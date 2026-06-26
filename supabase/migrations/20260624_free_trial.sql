-- Essai gratuit sans CB : quota leads + réponses IA
-- À coller dans le SQL Editor Supabase

alter table public.user_configs
  add column if not exists free_trial_leads_used integer not null default 0,
  add column if not exists is_free_trial boolean not null default true,
  add column if not exists free_trial_ai_responses_used integer not null default 0;
