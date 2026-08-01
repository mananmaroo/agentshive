-- Run against a disposable Supabase branch after applying the two stacked migrations.
begin;

do $$
begin
  if has_table_privilege('anon','public.business_admin_audit_events','select')
     or has_table_privilege('authenticated','public.business_admin_audit_events','select') then
    raise exception 'admin audit events are exposed to client roles';
  end if;
  if not (select relrowsecurity from pg_class where oid='public.business_admin_audit_events'::regclass) then
    raise exception 'admin audit RLS is disabled';
  end if;
  if exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='business_admin_audit_events'
  ) then
    raise exception 'client policy unexpectedly exposes admin audit events';
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='business_organizations'
      and policyname='members read organizations'
      and qual like '%auth.uid()%'
  ) then
    raise exception 'organization membership isolation policy is missing';
  end if;
end $$;

rollback;
