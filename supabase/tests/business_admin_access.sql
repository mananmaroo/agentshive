-- Run after applying the Aarya runtime and admin-access migrations.
begin;

do $$
declare
  v_active uuid := gen_random_uuid();
  v_grace uuid := gen_random_uuid();
  v_expired uuid := gen_random_uuid();
  v_revoked uuid := gen_random_uuid();
  v_unpaid uuid := gen_random_uuid();
  v_wrong_user uuid := gen_random_uuid();
begin
  if has_table_privilege('anon','public.business_admin_audit_events','select')
     or has_table_privilege('authenticated','public.business_admin_audit_events','select') then
    raise exception 'admin audit events are exposed to client roles';
  end if;
  if not (select relrowsecurity from pg_class where oid='public.business_admin_audit_events'::regclass) then
    raise exception 'admin audit RLS is disabled';
  end if;
  if has_function_privilege('anon','public.business_require_current_organization()','execute') then
    raise exception 'anonymous role can call protected access resolver';
  end if;

  insert into public.business_organizations
    (id,name,root_url,status,pilot_access_status,access_expires_at,access_grace_until,payment_status)
  values
    (v_active,'Access test active','https://active.example','pilot','active',now()+interval '1 day',now()+interval '4 days','waived'),
    (v_grace,'Access test grace','https://grace.example','active','active',now()-interval '1 hour',now()+interval '1 day','manual_confirmed'),
    (v_expired,'Access test expired','https://expired.example','active','active',now()-interval '2 days',now()-interval '1 day','manual_confirmed'),
    (v_revoked,'Access test revoked','https://revoked.example','active','revoked',now()+interval '1 day',now()+interval '4 days','manual_confirmed'),
    (v_unpaid,'Access test unpaid','https://unpaid.example','active','active',now()+interval '1 day',now()+interval '4 days','unpaid');

  if not public.business_has_effective_access(v_active,null,false) then raise exception 'active access was denied'; end if;
  if not public.business_has_effective_access(v_grace,null,false) then raise exception 'grace-period access was denied'; end if;
  if public.business_has_effective_access(v_expired,null,false) then raise exception 'expired access was allowed'; end if;
  if public.business_has_effective_access(v_revoked,null,false) then raise exception 'revoked access was allowed'; end if;
  if public.business_has_effective_access(v_unpaid,null,false) then raise exception 'unpaid access was allowed'; end if;
  if public.business_has_effective_access(v_active,v_wrong_user,true) then raise exception 'wrong-organization user was allowed'; end if;

  if exists (
    select 1 from pg_policies
    where schemaname='public' and tablename in (
      'business_organizations','business_organization_members','business_approved_knowledge',
      'business_conversations','business_messages','business_leads','business_attention_items'
    )
    and coalesce(qual,'') not like '%business_has_effective_access%'
    and coalesce(with_check,'') not like '%business_has_effective_access%'
  ) then
    raise exception 'a member data policy diverges from the authoritative access gate';
  end if;
end $$;

rollback;
