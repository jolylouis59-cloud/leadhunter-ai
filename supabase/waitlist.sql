-- Exécute ce SQL dans Supabase → SQL Editor

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- Permet les insertions depuis le client (anon key)
alter table public.waitlist enable row level security;

create policy "Allow public insert"
  on public.waitlist
  for insert
  to anon
  with check (true);

-- Optionnel : empêcher la lecture publique des emails
create policy "No public select"
  on public.waitlist
  for select
  to anon
  using (false);
