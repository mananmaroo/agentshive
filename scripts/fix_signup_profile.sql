-- Fix: new signups never got a public.users profile row, because the users
-- table has no INSERT policy for anon/authenticated — only the service role
-- could insert. This broke email signup AND would break GitHub/Google signup.
--
-- Standard Supabase fix: a SECURITY DEFINER trigger on auth.users that creates
-- the profile automatically on every signup, reading the username from the
-- signup metadata (set by the signup form / OAuth). Runs as the function owner
-- so it bypasses RLS. Idempotent — safe to run once in the Supabase SQL editor.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_name text := coalesce(nullif(trim(new.raw_user_meta_data->>'username'), ''), split_part(new.email, '@', 1));
  final_name text := base_name;
begin
  -- avoid colliding with an existing username
  if exists (select 1 from public.users where username = final_name) then
    final_name := base_name || '_' || substr(new.id::text, 1, 4);
  end if;

  insert into public.users (id, username, email)
  values (new.id, final_name, new.email)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Belt-and-suspenders: also let an authenticated user insert their own row,
-- in case any client path tries to (id must match the signed-in user).
drop policy if exists "Users can insert their own profile" on public.users;
create policy "Users can insert their own profile"
  on public.users for insert
  to authenticated
  with check (auth.uid() = id);
