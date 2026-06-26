import {
  FREE_TRIAL_AI_RESPONSES_LIMIT,
  FREE_TRIAL_LEADS_LIMIT,
  isOnFreeTrial,
} from "@/lib/free-trial";

export type UserAccess = {
  plan: string;
  trial_ends_at: string | null;
  is_free_trial?: boolean;
  free_trial_leads_used?: number;
  free_trial_ai_responses_used?: number;
};

export function isPaidPlan(plan: string): boolean {
  return plan !== "free";
}

export function isTrialActive(trialEndsAt: string | null): boolean {
  if (!trialEndsAt) return false;
  return new Date(trialEndsAt).getTime() > Date.now();
}

/** Plan payant ou essai temporel legacy (trial_ends_at) — inchangé pour compatibilité. */
export function hasActiveAccess(user: UserAccess): boolean {
  if (isPaidPlan(user.plan)) return true;
  return isTrialActive(user.trial_ends_at);
}

/** Accès au dashboard (voir leads, scanner, paramètres). */
export function hasDashboardAccess(user: UserAccess): boolean {
  if (hasActiveAccess(user)) return true;
  return isOnFreeTrial(user);
}

/** Peut recevoir de nouveaux leads (scan / cron). */
export function canReceiveNewLeads(user: UserAccess): boolean {
  if (hasActiveAccess(user)) return true;
  if (!isOnFreeTrial(user)) return false;
  return (user.free_trial_leads_used ?? 0) < FREE_TRIAL_LEADS_LIMIT;
}

/** Peut générer une réponse IA. */
export function canGenerateAiResponse(user: UserAccess): boolean {
  if (hasActiveAccess(user)) return true;
  if (!isOnFreeTrial(user)) return false;
  return (user.free_trial_ai_responses_used ?? 0) < FREE_TRIAL_AI_RESPONSES_LIMIT;
}
