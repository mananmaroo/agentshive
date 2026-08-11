begin;
select plan(12);

select col_is_pk('public','business_payment_orders','id','payment orders retain primary key');
select has_column('public','business_payment_orders','provider','orders are provider-namespaced');
select has_column('public','business_payment_orders','setup_fee_amount','setup fees are separately recorded');
select has_column('public','business_payment_orders','service_fee_amount','service fees are separately recorded');
select has_column('public','business_payment_orders','entitlement_months','entitlement term is stored');
select has_index('public','business_payment_orders','business_payment_orders_provider_order_unique','provider order IDs are provider-scoped');
select has_index('public','business_payment_orders','business_payment_orders_provider_payment_unique','provider payment IDs are provider-scoped');
select has_index('public','business_payment_webhook_events','business_payment_webhook_provider_event_unique','webhook replay keys are provider-scoped');
select isnt_empty(
  $$select 1 from pg_proc where proname='business_finalize_payment_event' and prosecdef$$,
  'provider-neutral webhook finalization is atomic and privileged'
);
select isnt_empty(
  $$select 1 from pg_proc where proname='business_finalize_payment_event'
    and pg_get_functiondef(oid) like '%partial_refund%'
    and pg_get_functiondef(oid) like '%interval ''3 days''%'$$,
  'partial refund and three-day grace are explicit'
);
select isnt_empty(
  $$select 1 from pg_proc where proname='business_has_effective_access'
    and pg_get_functiondef(oid) like '%access_grace_until%'
    and pg_get_functiondef(oid) like '%payment_status in (''unpaid'', ''refunded'')%'$$,
  'effective access permits only time-bounded failed-payment grace'
);
select isnt_empty(
  $$select 1 from pg_class where relname='business_payment_orders' and relrowsecurity$$,
  'orders remain protected by RLS'
);

select * from finish();
rollback;
