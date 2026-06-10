create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null default 'reddit',
  title text not null,
  post_body text,
  subreddit text,
  username text,
  intent_score integer not null default 0,
  status text not null default 'new' check (status in ('new', 'responded', 'ignored')),
  ai_response text,
  post_url text,
  post_created_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists leads_user_id_idx on public.leads (user_id);
create index if not exists leads_intent_score_idx on public.leads (intent_score desc);

create unique index if not exists leads_user_post_url_idx
  on public.leads (user_id, post_url)
  where post_url is not null;

alter table public.leads enable row level security;

create policy "Users can view own leads"
  on public.leads for select
  using (auth.uid() = user_id);

create policy "Users can insert own leads"
  on public.leads for insert
  with check (auth.uid() = user_id);

create policy "Users can update own leads"
  on public.leads for update
  using (auth.uid() = user_id);

create policy "Users can delete own leads"
  on public.leads for delete
  using (auth.uid() = user_id);
