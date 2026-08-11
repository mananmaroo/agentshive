-- Schema-only baseline for AgentsHive profile identities.
-- Reproduces the current production public.users contract without copying row data.
-- Must run before 20260722233000_aarya_pilot_runtime.sql on a blank Supabase project.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  email text not null unique,
  avatar_url text,
  bio text,
  github_username text,
  created_at timestamp without time zone default now(),
  experience_level text,
  primary_interest text,
  onboarded_at timestamp with time zone,
  badges text[] not null default '{}'::text[],
  badges_acknowledged text[] not null default '{}'::text[],
  linkedin_url text,
  constraint users_experience_level_check
    check (experience_level in ('beginner','intermediate','advanced','expert')),
  constraint users_primary_interest_check
    check (primary_interest in ('building','browsing','learning','sharing'))
);

-- Repair a partial blank-project schema without replacing or widening production fields.
alter table public.users
  add column if not exists username text,
  add column if not exists email text,
  add column if not exists avatar_url text,
  add column if not exists bio text,
  add column if not exists github_username text,
  add column if not exists created_at timestamp without time zone default now(),
  add column if not exists experience_level text,
  add column if not exists primary_interest text,
  add column if not exists onboarded_at timestamp with time zone,
  add column if not exists badges text[] default '{}'::text[],
  add column if not exists badges_acknowledged text[] default '{}'::text[],
  add column if not exists linkedin_url text;

update public.users set badges='{}'::text[] where badges is null;
update public.users set badges_acknowledged='{}'::text[] where badges_acknowledged is null;

alter table public.users
  alter column id set default gen_random_uuid(),
  alter column id set not null,
  alter column username set not null,
  alter column email set not null,
  alter column created_at set default now(),
  alter column badges set default '{}'::text[],
  alter column badges set not null,
  alter column badges_acknowledged set default '{}'::text[],
  alter column badges_acknowledged set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid='public.users'::regclass and contype='p'
  ) then
    alter table public.users add constraint users_pkey primary key (id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid='public.users'::regclass and conname='users_username_key'
  ) then
    alter table public.users add constraint users_username_key unique (username);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid='public.users'::regclass and conname='users_email_key'
  ) then
    alter table public.users add constraint users_email_key unique (email);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid='public.users'::regclass and conname='users_experience_level_check'
  ) then
    alter table public.users add constraint users_experience_level_check
      check (experience_level in ('beginner','intermediate','advanced','expert'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid='public.users'::regclass and conname='users_primary_interest_check'
  ) then
    alter table public.users add constraint users_primary_interest_check
      check (primary_interest in ('building','browsing','learning','sharing'));
  end if;
end
$$;

alter table public.users enable row level security;

drop policy if exists "users_read" on public.users;
create policy "users_read"
  on public.users for select
  using (true);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
  on public.users for update
  using ((select auth.uid()) = id);

drop policy if exists "Users can insert their own profile" on public.users;
create policy "Users can insert their own profile"
  on public.users for insert
  to authenticated
  with check ((select auth.uid()) = id);

grant select,insert,update,delete on public.users to anon,authenticated,service_role;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_name text := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    split_part(new.email, '@', 1)
  );
  final_name text := base_name;
begin
  if exists (select 1 from public.users where username = final_name) then
    final_name := base_name || '_' || substr(new.id::text, 1, 4);
  end if;

  insert into public.users (id,username,email)
  values (new.id,final_name,new.email)
  on conflict (id) do nothing;

  return new;
end
$$;

revoke all on function public.handle_new_user() from public,anon,authenticated;
grant execute on function public.handle_new_user() to service_role;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
