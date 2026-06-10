create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  leads_used integer not null default 0,
  plan text not null default 'free'
);

alter table public.users enable row level security;

create policy "Allow public insert"
  on public.users for insert to anon with check (true);

create policy "No public select"
  on public.users for select to anon using (false);
