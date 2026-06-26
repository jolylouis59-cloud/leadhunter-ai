export type IcpSegmentId =
  | "founders"
  | "sales_directors"
  | "freelancers"
  | "agencies"
  | "others";

export type MonthlyGoalId = "first_10" | "scale_50" | "automate";

const ONBOARDING_POSTS_POTENTIAL_COUNT = 143;

export const ICP_OPTIONS: { id: IcpSegmentId; label: string; prospectCount: number }[] = [
  { id: "founders", label: "Fondateurs startups", prospectCount: ONBOARDING_POSTS_POTENTIAL_COUNT },
  { id: "sales_directors", label: "Directeurs commerciaux", prospectCount: ONBOARDING_POSTS_POTENTIAL_COUNT },
  { id: "freelancers", label: "Freelances / Consultants", prospectCount: ONBOARDING_POSTS_POTENTIAL_COUNT },
  { id: "agencies", label: "Agences", prospectCount: ONBOARDING_POSTS_POTENTIAL_COUNT },
  { id: "others", label: "Autres", prospectCount: ONBOARDING_POSTS_POTENTIAL_COUNT },
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
