import Stripe from "stripe";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY manquante");
  }
  return new Stripe(key, {
    apiVersion: "2026-05-27.dahlia",
  });
}

export type PlanKey = "starter" | "growth" | "agency";

export const PLAN_DETAILS: Record<
  PlanKey,
  { leads_limit: number; priceEnvKey: string }
> = {
  starter: { leads_limit: 300, priceEnvKey: "STRIPE_STARTER_PRICE_ID" },
  growth: { leads_limit: 1000, priceEnvKey: "STRIPE_GROWTH_PRICE_ID" },
  agency: { leads_limit: 999999, priceEnvKey: "STRIPE_AGENCY_PRICE_ID" },
};

export function getPriceIdForPlan(plan: PlanKey): string | null {
  const envKey = PLAN_DETAILS[plan].priceEnvKey;
  return process.env[envKey] || null;
}

export function getPlanFromPriceId(priceId: string): {
  plan: PlanKey;
  leads_limit: number;
} | null {
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) {
    return { plan: "starter", leads_limit: 300 };
  }
  if (priceId === process.env.STRIPE_GROWTH_PRICE_ID) {
    return { plan: "growth", leads_limit: 1000 };
  }
  if (priceId === process.env.STRIPE_AGENCY_PRICE_ID) {
    return { plan: "agency", leads_limit: 999999 };
  }
  return null;
}
