-- Run after applying the five-file business/auth/payment chain documented in
-- docs/paypal-sandbox-setup.md. All fixtures roll back.
begin;

select plan(28);

select has_table('public','users','profile table exists');
select col_is_pk('public','users','id','profile id is the primary key');
select has_column('public','users','username','profile username exists');
select has_column('public','users','email','profile email exists');
select isnt_empty(
  $$select 1 from pg_class where oid='public.users'::regclass and relrowsecurity$$,
  'profile table has RLS enabled'
);
select is(
  (select count(*)::integer from pg_policies where schemaname='public' and tablename='users'),
  3,
  'production profile policy set is preserved'
);
select isnt_empty(
  $$select 1 from pg_trigger
    where tgrelid='auth.users'::regclass
      and tgname='on_auth_user_created'
      and not tgisinternal$$,
  'auth signup profile trigger exists'
);
select isnt_empty(
  $$select 1 from pg_proc
    where pronamespace='public'::regnamespace
      and proname='handle_new_user'
      and prosecdef
      and proconfig @> array['search_path=public']
      and not has_function_privilege('anon',oid,'execute')
      and not has_function_privilege('authenticated',oid,'execute')$$,
  'profile trigger function is privileged and not client-callable'
);

insert into auth.users(id,email,raw_user_meta_data,created_at,updated_at)
values
 ('10000000-0000-0000-0000-000000000001','profile-one@example.test','{"username":"profile_one"}',now(),now()),
 ('20000000-0000-0000-0000-000000000002','fallback-name@example.test','{}',now(),now()),
 ('30000000-0000-0000-0000-000000000003','profile-collision@example.test','{"username":"profile_one"}',now(),now()),
 ('40000000-0000-0000-0000-000000000004','client-insert@example.test','{"username":"client_insert"}',now(),now());

select ok(
  exists(select 1 from public.users where id='10000000-0000-0000-0000-000000000001'),
  'auth signup creates a profile'
);
select is(
  (select username from public.users where id='10000000-0000-0000-0000-000000000001'),
  'profile_one',
  'signup metadata supplies the username'
);
select is(
  (select username from public.users where id='20000000-0000-0000-0000-000000000002'),
  'fallback-name',
  'email local part is the username fallback'
);
select is(
  (select username from public.users where id='30000000-0000-0000-0000-000000000003'),
  'profile_one_3000',
  'username collisions preserve the production suffix behavior'
);

delete from public.users where id='40000000-0000-0000-0000-000000000004';

set local role authenticated;
select set_config('request.jwt.claim.sub','40000000-0000-0000-0000-000000000004',true);

select ok(
  exists(select 1 from public.users where id='10000000-0000-0000-0000-000000000001'),
  'public profile visibility matches production semantics'
);

select lives_ok(
  $$insert into public.users(id,username,email)
    values('40000000-0000-0000-0000-000000000004','client_insert','client-insert@example.test')$$,
  'an authenticated user can insert their own profile'
);
select throws_ok(
  $$insert into public.users(id,username,email)
    values('50000000-0000-0000-0000-000000000005','cross_insert','cross-insert@example.test')$$,
  '42501',
  'cross-user profile insertion is denied'
);
select lives_ok(
  $$update public.users set bio='own update'
    where id='40000000-0000-0000-0000-000000000004'$$,
  'a user can update their own profile'
);
select is(
  (select bio from public.users where id='40000000-0000-0000-0000-000000000004'),
  'own update',
  'own profile update is persisted'
);
select lives_ok(
  $$update public.users set bio='cross update'
    where id='10000000-0000-0000-0000-000000000001'$$,
  'cross-user update is filtered without leaking the row'
);
select is(
  (select bio from public.users where id='10000000-0000-0000-0000-000000000001'),
  null,
  'cross-user update cannot change another profile'
);
select lives_ok(
  $$delete from public.users
    where id='10000000-0000-0000-0000-000000000001'$$,
  'cross-user delete is filtered by the absence of a delete policy'
);
select ok(
  exists(select 1 from public.users where id='10000000-0000-0000-0000-000000000001'),
  'cross-user delete cannot remove another profile'
);

reset role;

select has_table('public','business_organizations','business organization baseline is compatible');
select has_table('public','business_organization_members','business membership baseline is compatible');
select has_table('public','business_payment_proposals','payment proposals are compatible');
select has_table('public','business_payment_orders','payment orders are compatible');
select has_table('public','business_payment_webhook_events','payment webhooks are compatible');
select has_column('public','business_payment_orders','provider','provider-neutral ledger is compatible');
select isnt_empty(
  $$select 1 from pg_proc
    where pronamespace='public'::regnamespace
      and proname='business_finalize_payment_event'$$,
  'provider-neutral finalizer is installed'
);

select * from finish();
rollback;
