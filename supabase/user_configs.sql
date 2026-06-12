create table if not exists public.user_configs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  product_description text not null default 'outil de prospection B2B automatisé',
  target text not null default 'founders, solopreneurs, agences marketing',
  keywords text[] not null default array['prospection B2B', 'trouver clients', 'lead generation', 'growth hacking', 'cold outreach'],
  subreddits text[] not null default array['SaaS', 'entrepreneur', 'startups', 'marketing', 'Entrepreneur_Ride_Along'],
  updated_at timestamptz not null default now()
);

alter table public.user_configs enable row level security;

create policy "Users can view own config"
  on public.user_configs for select
  using (auth.uid() = user_id);

create policy "Users can insert own config"
  on public.user_configs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own config"
  on public.user_configs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Upsert requires unique constraint on conflict column (PK already covers this)
do $$ begin
  alter table public.user_configs
    add constraint user_configs_user_id_key unique (user_id);
exception
  when duplicate_object then null;
end $$;

-- Migration leads: post_body + unique post_url per user
alter table public.leads add column if not exists post_body text;

create unique index if not exists leads_user_post_url_idx
  on public.leads (user_id, post_url)
  where post_url is not null;

-- Migration Stripe : plan & abonnement
alter table public.user_configs add column if not exists plan text default 'free';
alter table public.user_configs add column if not exists leads_limit integer default 0;
alter table public.user_configs add column if not exists stripe_customer_id text;
