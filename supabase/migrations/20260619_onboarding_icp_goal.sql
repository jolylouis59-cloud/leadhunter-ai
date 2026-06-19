-- Onboarding flow : segment ICP + objectif mensuel
alter table public.user_configs add column if not exists icp_segment text;
alter table public.user_configs add column if not exists monthly_goal text;
