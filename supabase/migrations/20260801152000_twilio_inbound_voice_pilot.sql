-- Gated inbound voice pilot. Schema only: no provider secrets, number purchases, or activation.
alter table public.business_organizations
  add column if not exists voice_provider text,
  add column if not exists voice_provider_number_e164 text,
  add column if not exists voice_transfer_phone_e164 text,
  add column if not exists voice_disclosure text not null default 'Hello. You are speaking with Aarya, an AI admissions assistant. This call is not recorded. You can ask for a human counsellor at any time.',
  add column if not exists voice_enabled boolean not null default false,
  add column if not exists voice_daily_call_limit integer not null default 20,
  add column if not exists voice_monthly_spend_limit_usd numeric(8,2) not null default 40.00,
  add column if not exists voice_recording_enabled boolean not null default false,
  add column if not exists voice_transcript_retention_days integer not null default 30;

do $$ begin
  if not exists (select 1 from pg_constraint where conname='business_org_voice_provider_check') then
    alter table public.business_organizations add constraint business_org_voice_provider_check check (voice_provider is null or voice_provider='twilio');
  end if;
  if not exists (select 1 from pg_constraint where conname='business_org_voice_provider_number_check') then
    alter table public.business_organizations add constraint business_org_voice_provider_number_check check (voice_provider_number_e164 is null or voice_provider_number_e164 ~ '^\+[1-9][0-9]{7,14}$');
  end if;
  if not exists (select 1 from pg_constraint where conname='business_org_voice_transfer_number_check') then
    alter table public.business_organizations add constraint business_org_voice_transfer_number_check check (voice_transfer_phone_e164 is null or voice_transfer_phone_e164 ~ '^\+[1-9][0-9]{7,14}$');
  end if;
  if not exists (select 1 from pg_constraint where conname='business_org_voice_limits_check') then
    alter table public.business_organizations add constraint business_org_voice_limits_check check (
      voice_daily_call_limit between 1 and 100 and voice_monthly_spend_limit_usd between 1 and 50
      and voice_transcript_retention_days between 1 and 90 and voice_recording_enabled=false
    );
  end if;
end $$;

create unique index if not exists business_org_voice_provider_number_unique
  on public.business_organizations(voice_provider_number_e164) where voice_provider_number_e164 is not null;

create table if not exists public.business_voice_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.business_organizations(id) on delete cascade,
  conversation_id uuid not null references public.business_conversations(id) on delete cascade,
  provider text not null default 'twilio' check (provider='twilio'),
  provider_call_sid_hash text not null unique,
  caller_phone_e164 text,
  called_phone_e164 text not null,
  status text not null default 'initiated' check (status in ('initiated','in-progress','completed','busy','failed','no-answer','canceled','time_limit','transferred')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer not null default 0 check (duration_seconds between 0 and 300),
  needs_human boolean not null default false,
  transferred boolean not null default false,
  summary text,
  price numeric(10,4),
  price_unit text,
  retention_expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_voice_sessions_org_recent_idx on public.business_voice_sessions(organization_id,started_at desc);
create index if not exists business_voice_sessions_org_month_cost_idx on public.business_voice_sessions(organization_id,started_at) where price is not null;
alter table public.business_voice_sessions enable row level security;

drop policy if exists "members read voice sessions" on public.business_voice_sessions;
create policy "members read voice sessions" on public.business_voice_sessions for select to authenticated
using (exists (select 1 from public.business_organization_members m where m.organization_id=business_voice_sessions.organization_id and m.user_id=(select auth.uid())));

create or replace function public.business_resolve_inbound_voice(p_provider_number text,p_call_sid text,p_from_number text)
returns table(organization_id uuid,organization_name text,widget_key uuid,transfer_phone_e164 text,disclosure text,daily_call_limit integer,voice_enabled boolean,allowed boolean,session_id uuid)
language plpgsql security definer set search_path=''
as $$
declare v_org public.business_organizations%rowtype; v_conversation uuid; v_session uuid; v_today integer; v_spend numeric;
begin
 if p_call_sid !~ '^CA[0-9a-fA-F]{32}$' then raise exception 'Invalid call reference'; end if;
 select * into v_org from public.business_organizations where voice_provider='twilio' and voice_provider_number_e164=p_provider_number and status in ('pilot','active');
 if v_org.id is null then return; end if;
 select count(*) into v_today from public.business_voice_sessions where organization_id=v_org.id and started_at>=date_trunc('day',now());
 select coalesce(sum(abs(price)),0) into v_spend from public.business_voice_sessions where organization_id=v_org.id and started_at>=date_trunc('month',now());
 if not v_org.voice_enabled or v_org.voice_status<>'active' or v_today>=v_org.voice_daily_call_limit or v_spend>=v_org.voice_monthly_spend_limit_usd then
   return query select v_org.id,v_org.name,v_org.widget_key,v_org.voice_transfer_phone_e164,v_org.voice_disclosure,v_org.voice_daily_call_limit,v_org.voice_enabled,false,null::uuid;
   return;
 end if;
 select s.id into v_session from public.business_voice_sessions s where s.provider_call_sid_hash=encode(extensions.digest(p_call_sid,'sha256'),'hex');
 if v_session is null then
   insert into public.business_conversations(organization_id,channel,visitor_phone,status) values(v_org.id,'voice',nullif(p_from_number,''),'open') returning id into v_conversation;
   insert into public.business_voice_sessions(organization_id,conversation_id,provider_call_sid_hash,caller_phone_e164,called_phone_e164,retention_expires_at)
   values(v_org.id,v_conversation,encode(extensions.digest(p_call_sid,'sha256'),'hex'),nullif(p_from_number,''),p_provider_number,now()+make_interval(days=>v_org.voice_transcript_retention_days))
   returning id into v_session;
 else
   select conversation_id into v_conversation from public.business_voice_sessions where id=v_session;
 end if;
 return query select v_org.id,v_org.name,v_org.widget_key,v_org.voice_transfer_phone_e164,v_org.voice_disclosure,v_org.voice_daily_call_limit,v_org.voice_enabled,true,v_session;
end $$;

create or replace function public.business_get_voice_context(p_session_id uuid)
returns table(organization_id uuid,widget_key uuid,conversation_id uuid,transfer_phone_e164 text,elapsed_seconds integer)
language sql stable security definer set search_path=''
as $$ select o.id,o.widget_key,s.conversation_id,o.voice_transfer_phone_e164,least(300,greatest(0,extract(epoch from (now()-s.started_at))::integer)) from public.business_voice_sessions s join public.business_organizations o on o.id=s.organization_id where s.id=p_session_id and s.status in ('initiated','in-progress') and o.voice_enabled and o.voice_status='active' $$;

create or replace function public.business_record_voice_turn(p_session_id uuid,p_question text,p_answer text,p_needs_human boolean,p_source_urls text[] default '{}')
returns void language plpgsql security definer set search_path=''
as $$
declare v_org uuid; v_conversation uuid;
begin
 if char_length(trim(p_question)) not between 1 and 2000 or char_length(trim(p_answer)) not between 1 and 5000 then raise exception 'Invalid voice turn'; end if;
 select organization_id,conversation_id into v_org,v_conversation from public.business_voice_sessions where id=p_session_id and status in ('initiated','in-progress');
 if v_org is null then raise exception 'Unknown voice session'; end if;
 update public.business_voice_sessions set status='in-progress',needs_human=needs_human or p_needs_human,summary=left(trim(p_question)||' — '||trim(p_answer),1000),updated_at=now() where id=p_session_id;
 update public.business_conversations set status=case when p_needs_human then 'needs_attention' else status end,last_message_at=now() where id=v_conversation;
 insert into public.business_messages(conversation_id,sender,content) values(v_conversation,'visitor',trim(p_question));
 insert into public.business_messages(conversation_id,sender,content,source_urls,needs_human) values(v_conversation,'aarya',trim(p_answer),coalesce(p_source_urls,'{}'),p_needs_human);
 if p_needs_human and not exists(select 1 from public.business_attention_items where conversation_id=v_conversation and status='open') then
   insert into public.business_attention_items(organization_id,conversation_id,reason) values(v_org,v_conversation,'Voice caller requested a person or Aarya could not safely answer from approved knowledge.');
 end if;
end $$;

create or replace function public.business_finish_voice_session(p_session_id uuid,p_status text,p_duration_seconds integer)
returns void language sql security definer set search_path=''
as $$ update public.business_voice_sessions set status=case when p_status in ('completed','failed','time_limit','transferred') then p_status else 'completed' end,ended_at=now(),duration_seconds=least(300,greatest(0,p_duration_seconds)),updated_at=now() where id=p_session_id $$;

create or replace function public.business_finish_voice_session_by_call(p_call_sid text,p_status text,p_duration_seconds integer,p_price text,p_price_unit text)
returns void language plpgsql security definer set search_path=''
as $$
begin
 update public.business_voice_sessions set
 status=case when p_status in ('completed','busy','failed','no-answer','canceled') then p_status else 'completed' end,
 ended_at=now(),duration_seconds=least(300,greatest(0,p_duration_seconds)),
 price=case when p_price ~ '^-?[0-9]+(\.[0-9]+)?$' then abs(p_price::numeric) else price end,
 price_unit=nullif(p_price_unit,''),updated_at=now()
 where provider_call_sid_hash=encode(extensions.digest(p_call_sid,'sha256'),'hex');
end $$;

revoke all on public.business_voice_sessions from anon;
grant select on public.business_voice_sessions to authenticated;
revoke all on function public.business_resolve_inbound_voice(text,text,text) from public,anon,authenticated;
revoke all on function public.business_get_voice_context(uuid) from public,anon,authenticated;
revoke all on function public.business_record_voice_turn(uuid,text,text,boolean,text[]) from public,anon,authenticated;
revoke all on function public.business_finish_voice_session(uuid,text,integer) from public,anon,authenticated;
revoke all on function public.business_finish_voice_session_by_call(text,text,integer,text,text) from public,anon,authenticated;
grant execute on function public.business_resolve_inbound_voice(text,text,text),public.business_get_voice_context(uuid),public.business_record_voice_turn(uuid,text,text,boolean,text[]),public.business_finish_voice_session(uuid,text,integer),public.business_finish_voice_session_by_call(text,text,integer,text,text) to service_role;
