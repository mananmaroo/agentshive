begin;

select plan(7);

select ok(
  (select relrowsecurity from pg_class where oid='public.business_solution_requests'::regclass),
  'solution requests has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid='public.business_solution_request_events'::regclass),
  'solution request events has RLS enabled'
);
select ok(not has_table_privilege('anon','public.business_solution_requests','SELECT'), 'anon cannot read requests');
select ok(not has_table_privilege('anon','public.business_solution_requests','INSERT'), 'anon cannot insert requests directly');
select ok(not has_table_privilege('authenticated','public.business_solution_requests','SELECT'), 'ordinary users cannot read all requests');
select ok(not has_table_privilege('authenticated','public.business_solution_requests','UPDATE'), 'ordinary users cannot mutate pipeline state');
select ok(not has_function_privilege('anon','public.record_business_solution_request_status()','EXECUTE'), 'anon cannot execute audit trigger function');

select * from finish();
rollback;
