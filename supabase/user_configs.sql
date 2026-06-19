create table if not exists public.user_configs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  product_description text not null default 'outil de prospection B2B automatisé',
  target text not null default 'founders, solopreneurs, agences marketing',
  keywords text[] not null default array['trouver des clients B2B', 'prospection sans cold email', 'comment trouver des clients', 'outil prospection', 'alternative cold email'],
  subreddits text[] not null default array['FrenchStartup', 'Entrepreneur_Francophone', 'SaaS'],
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

-- Notifications & préférences
alter table public.user_configs add column if not exists alert_email text;
alter table public.user_configs add column if not exists slack_webhook_url text;
alter table public.user_configs add column if not exists email_alerts boolean default true;
alter table public.user_configs add column if not exists slack_alerts boolean default false;
alter table public.user_configs add column if not exists auto_scan boolean default false;
alter table public.user_configs add column if not exists auto_scan_hour integer default 8;
alter table public.user_configs add column if not exists weekly_digest boolean default true;
alter table public.user_configs add column if not exists trial_ends_at timestamptz;
alter table public.user_configs add column if not exists billing_name text;
alter table public.user_configs add column if not exists billing_address text;

-- Profil onboarding structuré
alter table public.user_configs add column if not exists product_name text;
alter table public.user_configs add column if not exists target_audience text;
alter table public.user_configs add column if not exists pain_point text;
alter table public.user_configs add column if not exists competitors text;
alter table public.user_configs add column if not exists website_url text;
alter table public.user_configs add column if not exists target_pricing text;
alter table public.user_configs add column if not exists onboarding_completed boolean default false;

-- Onboarding flow : segment ICP + objectif mensuel
alter table public.user_configs add column if not exists icp_segment text;
alter table public.user_configs add column if not exists monthly_goal text;
