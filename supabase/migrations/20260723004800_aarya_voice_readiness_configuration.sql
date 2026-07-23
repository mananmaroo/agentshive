-- Persist an institute's existing phone number for voice-pilot readiness only.
-- This does not purchase, provision, verify, forward, or activate telephone service.

alter table public.business_organizations
  add column if not exists voice_phone_e164 text,
  add column if not exists voice_status text not null default 'not_configured',
  add column if not exists voice_updated_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'business_organizations_voice_status_check'
      and conrelid = 'public.business_organizations'::regclass
  ) then
    alter table public.business_organizations
      add constraint business_organizations_voice_status_check
      check (voice_status in ('not_configured','configuration_saved','active','paused'));
  end if;
end
$$;

create or replace function public.business_save_voice_readiness(
  p_organization_id uuid,
  p_phone_e164 text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Authentication required';
  end if;

  if p_phone_e164 !~ '^\+[1-9][0-9]{7,14}$' then
    raise exception 'Enter a valid E.164 phone number';
  end if;

  if not exists (
    select 1
    from public.business_organization_members
    where organization_id = p_organization_id
      and user_id = v_user
  ) then
    raise exception 'Organization access denied';
  end if;

  update public.business_organizations
  set
    voice_phone_e164 = p_phone_e164,
    voice_status = 'configuration_saved',
    voice_updated_at = now(),
    updated_at = now()
  where id = p_organization_id;
end
$$;

revoke all on function public.business_save_voice_readiness(uuid,text) from public,anon;
grant execute on function public.business_save_voice_readiness(uuid,text) to authenticated,service_role;
