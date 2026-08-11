-- DRAFT / UNAPPLIED.
-- Depends on 20260805120000_razorpay_payment_integrity.sql.
-- Approval gate: do not apply until PR review, pgTAP on an isolated database, and explicit CEO/user approval.
-- No credentials or provider payloads are stored here.

alter table public.business_payment_orders
  add column if not exists provider text,
  add column if not exists setup_fee_amount bigint,
  add column if not exists service_fee_amount bigint,
  add column if not exists entitlement_months smallint;

update public.business_payment_orders
set provider = coalesce(provider, 'razorpay'),
    setup_fee_amount = coalesce(setup_fee_amount, 0),
    service_fee_amount = coalesce(service_fee_amount, amount),
    entitlement_months = coalesce(
      entitlement_months,
      case
        when exists (
          select 1 from public.business_payment_proposals p
          where p.id = business_payment_orders.proposal_id and p.price_book_id like '%_12m'
        ) then 12
        when exists (
          select 1 from public.business_payment_proposals p
          where p.id = business_payment_orders.proposal_id and p.price_book_id like '%_6m'
        ) then 6
        else 1
      end
    );

alter table public.business_payment_orders
  alter column provider set not null,
  alter column provider set default 'razorpay',
  alter column setup_fee_amount set not null,
  alter column setup_fee_amount set default 0,
  alter column service_fee_amount set not null,
  alter column entitlement_months set not null;

alter table public.business_payment_orders
  drop constraint if exists business_payment_orders_provider_check,
  add constraint business_payment_orders_provider_check
    check (provider in ('razorpay', 'paypal', 'stripe')),
  drop constraint if exists business_payment_orders_fee_allocation_check,
  add constraint business_payment_orders_fee_allocation_check
    check (
      setup_fee_amount >= 0
      and service_fee_amount >= 0
      and setup_fee_amount + service_fee_amount = amount
    ),
  drop constraint if exists business_payment_orders_entitlement_months_check,
  add constraint business_payment_orders_entitlement_months_check
    check (entitlement_months in (1, 6, 12));

alter table public.business_payment_orders
  drop constraint if exists business_payment_orders_provider_order_id_key,
  drop constraint if exists business_payment_orders_provider_payment_id_key;

create unique index if not exists business_payment_orders_provider_order_unique
  on public.business_payment_orders(provider, provider_order_id);
create unique index if not exists business_payment_orders_provider_payment_unique
  on public.business_payment_orders(provider, provider_payment_id)
  where provider_payment_id is not null;

alter table public.business_payment_webhook_events
  add column if not exists provider text;

update public.business_payment_webhook_events
set provider = coalesce(provider, 'razorpay');

alter table public.business_payment_webhook_events
  alter column provider set not null,
  alter column provider set default 'razorpay',
  drop constraint if exists business_payment_webhook_events_provider_check,
  add constraint business_payment_webhook_events_provider_check
    check (provider in ('razorpay', 'paypal', 'stripe')),
  drop constraint if exists business_payment_webhook_events_provider_event_id_key;

create unique index if not exists business_payment_webhook_provider_event_unique
  on public.business_payment_webhook_events(provider, provider_event_id);

create or replace function public.business_finalize_payment_event(
  p_provider text,
  p_event_id text,
  p_event_type text,
  p_payment_id text,
  p_order_id text,
  p_payload_hash text,
  p_action text
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.business_payment_orders%rowtype;
  v_grace_until timestamptz := now() + interval '3 days';
begin
  if p_provider not in ('razorpay', 'paypal', 'stripe') then
    raise exception 'Invalid payment provider';
  end if;
  if p_action not in ('activate', 'fail', 'full_refund', 'partial_refund', 'dispute', 'ignore') then
    raise exception 'Invalid payment action';
  end if;

  insert into public.business_payment_webhook_events(
    provider, provider_event_id, event_type, provider_payment_id, payload_hash
  ) values (
    p_provider, p_event_id, p_event_type, nullif(p_payment_id, ''), p_payload_hash
  )
  on conflict(provider, provider_event_id) do nothing;

  if not found then return false; end if;

  select * into v_order
  from public.business_payment_orders
  where provider = p_provider and provider_order_id = p_order_id
  for update;

  if v_order.id is null then
    update public.business_payment_webhook_events
    set processed_at = now()
    where provider = p_provider and provider_event_id = p_event_id;
    return true;
  end if;

  if p_action = 'activate' then
    update public.business_payment_orders
    set provider_payment_id = nullif(p_payment_id, ''),
        status = 'captured',
        verified_at = now()
    where id = v_order.id;

    update public.business_payment_proposals
    set status = 'paid', updated_at = now()
    where id = v_order.proposal_id and organization_id = v_order.organization_id;

    update public.business_organizations
    set payment_status = 'gateway_confirmed',
        pilot_access_status = 'active',
        access_grace_until = null,
        access_expires_at = greatest(coalesce(access_expires_at, now()), now())
          + make_interval(months => v_order.entitlement_months),
        access_updated_at = now()
    where id = v_order.organization_id;

  elsif p_action = 'partial_refund' then
    update public.business_payment_orders
    set status = p_event_type
    where id = v_order.id;

  elsif p_action in ('fail', 'full_refund', 'dispute') then
    update public.business_payment_orders
    set provider_payment_id = coalesce(provider_payment_id, nullif(p_payment_id, '')),
        status = p_event_type
    where id = v_order.id;

    update public.business_organizations
    set payment_status = case when p_action = 'full_refund' then 'refunded' else 'unpaid' end,
        pilot_access_status = 'active',
        access_grace_until = greatest(coalesce(access_grace_until, v_grace_until), v_grace_until),
        access_updated_at = now()
    where id = v_order.organization_id;
  end if;

  update public.business_payment_webhook_events
  set processed_at = now()
  where provider = p_provider and provider_event_id = p_event_id;

  return true;
end
$$;

revoke all on function public.business_finalize_payment_event(text,text,text,text,text,text,text)
  from public, anon, authenticated;
grant execute on function public.business_finalize_payment_event(text,text,text,text,text,text,text)
  to service_role;

create or replace function public.business_has_effective_access(
  p_organization_id uuid,
  p_user_id uuid default auth.uid(),
  p_require_membership boolean default true
) returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_organizations o
    where o.id = p_organization_id
      and o.status in ('pilot', 'active')
      and o.pilot_access_status = 'active'
      and (
        (
          o.payment_status in ('manual_confirmed', 'gateway_confirmed', 'waived')
          and (o.access_expires_at is null or o.access_expires_at > now())
        )
        or (
          o.payment_status in ('unpaid', 'refunded')
          and o.access_grace_until is not null
          and o.access_grace_until > now()
        )
      )
      and (
        not p_require_membership
        or (
          p_user_id is not null
          and exists (
            select 1
            from public.business_organization_members m
            where m.organization_id = o.id and m.user_id = p_user_id
          )
        )
      )
  )
$$;

revoke all on function public.business_has_effective_access(uuid,uuid,boolean)
  from public, anon;
grant execute on function public.business_has_effective_access(uuid,uuid,boolean)
  to authenticated, service_role;

-- Explicit Data API posture for current Supabase defaults.
revoke all on public.business_payment_proposals,
  public.business_payment_orders,
  public.business_payment_webhook_events
  from public, anon, authenticated;
grant all on public.business_payment_proposals,
  public.business_payment_orders,
  public.business_payment_webhook_events
  to service_role;
