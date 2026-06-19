export type IcpSegmentId = "founders" | "sales_directors" | "freelancers" | "agencies";

export type MonthlyGoalId = "first_10" | "scale_50" | "automate";

export const ICP_OPTIONS: { id: IcpSegmentId; label: string; prospectCount: number }[] = [
  { id: "founders", label: "Fondateurs startups", prospectCount: 847 },
  { id: "sales_directors", label: "Directeurs commerciaux", prospectCount: 1891 },
  { id: "freelancers", label: "Freelances / Consultants", prospectCount: 634 },
  { id: "agencies", label: "Agences", prospectCount: 1243 },
];

export const GOAL_OPTIONS: { id: MonthlyGoalId; label: string }[] = [
  { id: "first_10", label: "Trouver mes 10 premiers clients" },
  { id: "scale_50", label: "Scaler à 50+ leads/mois" },
  { id: "automate", label: "Automatiser ma prospection" },
];

export const LOADING_LOGS = [
  "Analyse de 2,4M posts Reddit...",
  "Identification des signaux d'achat...",
  "Calcul de ton potentiel...",
];

export function getProspectCount(segmentId: IcpSegmentId | null): number {
  return ICP_OPTIONS.find((o) => o.id === segmentId)?.prospectCount ?? 0;
}

export const ONBOARDING_PLANS = [
  {
    key: "starter",
    name: "Starter",
    price: "49€",
    period: "/mois",
    desc: "Pour les solopreneurs",
    features: ["300 leads/mois", "Reddit + X + LinkedIn", "Intent Score IA"],
    popular: false,
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID ?? "",
  },
  {
    key: "growth",
    name: "Growth",
    price: "99€",
    period: "/mois",
    desc: "Pour scaler ton acquisition",
    features: ["1000 leads/mois", "Content Studio", "Alertes Slack + email"],
    popular: true,
    priceId: process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID ?? "",
  },
  {
    key: "agency",
    name: "Agency",
    price: "199€",
    period: "/mois",
    desc: "Pour les agences",
    features: ["Leads illimités", "5 workspaces", "API access"],
    popular: false,
    priceId: process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID ?? "",
  },
];
