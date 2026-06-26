import type { SupabaseClient } from "@supabase/supabase-js";

export const FREE_TRIAL_LEADS_LIMIT = 15;
export const FREE_TRIAL_AI_RESPONSES_LIMIT = 5;

export type FreeTrialUsage = {
  plan: string;
  trial_ends_at: string | null;
  is_free_trial?: boolean;
  free_trial_leads_used?: number;
  free_trial_ai_responses_used?: number;
};

function isPaidPlan(plan: string): boolean {
  return plan !== "free";
}

function isLegacyTrialActive(trialEndsAt: string | null): boolean {
  if (!trialEndsAt) return false;
  return new Date(trialEndsAt).getTime() > Date.now();
}

export function isOnFreeTrial(user: FreeTrialUsage): boolean {
  if (isPaidPlan(user.plan)) return false;
  if (isLegacyTrialActive(user.trial_ends_at)) return false;
  return user.is_free_trial !== false;
}

export function countsTowardFreeTrialLimits(user: FreeTrialUsage): boolean {
  return isOnFreeTrial(user);
}

export function isFreeTrialLeadLimitReached(user: FreeTrialUsage): boolean {
  if (!countsTowardFreeTrialLimits(user)) return false;
  return (user.free_trial_leads_used ?? 0) >= FREE_TRIAL_LEADS_LIMIT;
}

export function isFreeTrialAiLimitReached(user: FreeTrialUsage): boolean {
  if (!countsTowardFreeTrialLimits(user)) return false;
  return (user.free_trial_ai_responses_used ?? 0) >= FREE_TRIAL_AI_RESPONSES_LIMIT;
}

export async function incrementFreeTrialLeadsUsed(
  admin: SupabaseClient,
  userId: string
): Promise<void> {
  const { data } = await admin
    .from("user_configs")
    .select("free_trial_leads_used")
    .eq("user_id", userId)
    .maybeSingle();

  const current = data?.free_trial_leads_used ?? 0;
  await admin
    .from("user_configs")
    .update({
      free_trial_leads_used: current + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}

export async function incrementFreeTrialAiResponsesUsed(
  admin: SupabaseClient,
  userId: string
): Promise<void> {
  const { data } = await admin
    .from("user_configs")
    .select("free_trial_ai_responses_used")
    .eq("user_id", userId)
    .maybeSingle();

  const current = data?.free_trial_ai_responses_used ?? 0;
  await admin
    .from("user_configs")
    .update({
      free_trial_ai_responses_used: current + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}
