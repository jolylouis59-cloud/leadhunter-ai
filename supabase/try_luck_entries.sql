create table if not exists public.try_luck_entries (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  problem text not null,
  name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now()
);

create index if not exists try_luck_entries_email_idx on public.try_luck_entries (email);
create index if not exists try_luck_entries_created_at_idx on public.try_luck_entries (created_at desc);

-- RLS : pas d'accès public, seulement service role via API
alter table public.try_luck_entries enable row level security;

-- Aucune policy = seul le service role key peut lire/écrire
