-- Internal AgentsHive lead-generation pilot. UNAPPLIED.
create table if not exists public.business_lead_sources (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.business_organizations(id) on delete cascade,
 source_url text not null check(source_url ~ '^https://'), source_name text not null check(char_length(source_name) between 2 and 160),
 verified_at timestamptz not null, verified_by uuid not null references auth.users(id), created_at timestamptz not null default now(),
 unique(organization_id,source_url)
);
create table if not exists public.business_prospects (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.business_organizations(id) on delete cascade,
 source_id uuid not null references public.business_lead_sources(id), organization_name text not null,
 public_contact_email text not null check(public_contact_email=lower(public_contact_email)),
 public_contact_role text not null check(public_contact_role in ('admissions','operations','general_business')),
 website_url text not null check(website_url ~ '^https://'), country text not null, fit_signals text[] not null default '{}',
 score integer not null check(score between 0 and 100), score_reasons text[] not null default '{}',
 status text not null default 'new' check(status in ('new','qualified','review','approved','rejected','contacted')),
 notes text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(organization_id,public_contact_email)
);
create table if not exists public.business_outreach_drafts (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.business_organizations(id) on delete cascade,
 prospect_id uuid not null references public.business_prospects(id) on delete cascade, subject text not null, body text not null,
 approval_status text not null default 'draft' check(approval_status in ('draft','needs_review','approved','rejected')),
 approved_by uuid references auth.users(id), approved_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(prospect_id)
);
create table if not exists public.business_lead_audit_events (
 id bigint generated always as identity primary key, organization_id uuid not null references public.business_organizations(id) on delete cascade,
 prospect_id uuid references public.business_prospects(id) on delete set null, actor_user_id uuid not null references auth.users(id),
 action text not null check(char_length(action) between 3 and 80), details jsonb not null default '{}', created_at timestamptz not null default now()
);
create index if not exists business_prospects_org_status_score_idx on public.business_prospects(organization_id,status,score desc);
create index if not exists business_drafts_org_approval_idx on public.business_outreach_drafts(organization_id,approval_status,updated_at desc);
create index if not exists business_lead_audit_org_recent_idx on public.business_lead_audit_events(organization_id,created_at desc);
alter table public.business_lead_sources enable row level security;
alter table public.business_prospects enable row level security;
alter table public.business_outreach_drafts enable row level security;
alter table public.business_lead_audit_events enable row level security;
do $$ declare t text; begin foreach t in array array['business_lead_sources','business_prospects','business_outreach_drafts','business_lead_audit_events'] loop
 execute format('drop policy if exists "effective members manage %1$s" on public.%1$I',t);
 execute format('create policy "effective members manage %1$s" on public.%1$I for all to authenticated using (public.business_has_effective_access(organization_id,(select auth.uid()),true)) with check (public.business_has_effective_access(organization_id,(select auth.uid()),true))',t);
 end loop; end $$;
grant select,insert,update on public.business_lead_sources,public.business_prospects,public.business_outreach_drafts to authenticated;
grant select,insert on public.business_lead_audit_events to authenticated;
grant usage,select on sequence public.business_lead_audit_events_id_seq to authenticated;
-- No send function, provider credential, mailbox action, or autonomous AI call exists in this schema.
