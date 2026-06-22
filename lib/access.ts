export type UserAccess = {
  plan: string;
  trial_ends_at: string | null;
};

export function isPaidPlan(plan: string): boolean {
  return plan !== "free";
}

export function isTrialActive(trialEndsAt: string | null): boolean {
  if (!trialEndsAt) return false;
  return new Date(trialEndsAt).getTime() > Date.now();
}

export function hasActiveAccess(user: UserAccess): boolean {
  if (isPaidPlan(user.plan)) return true;
  return isTrialActive(user.trial_ends_at);
}
