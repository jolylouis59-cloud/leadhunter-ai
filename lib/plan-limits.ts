export const KEYWORD_LIMITS: Record<string, number> = {
  free: 50,
  starter: 50,
  growth: 50,
  agency: 50,
};

export const SUBREDDIT_LIMITS: Record<string, number> = {
  free: 50,
  starter: 50,
  growth: 50,
  agency: 50,
};

export function getKeywordLimit(plan: string): number {
  return KEYWORD_LIMITS[plan] ?? KEYWORD_LIMITS.free;
}

export function getSubredditLimit(plan: string): number {
  return SUBREDDIT_LIMITS[plan] ?? SUBREDDIT_LIMITS.free;
}

export const PLAN_BADGE_STYLES: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  free: { label: "Essai gratuit", bg: "#E5E7EB", color: "#6B7280" },
  starter: { label: "Starter", bg: "#E8F5E9", color: "#1F4D3A" },
  growth: { label: "Growth", bg: "#1F4D3A", color: "#FFFFFF" },
  agency: { label: "Agency", bg: "#FEF3C7", color: "#92400E" },
};
