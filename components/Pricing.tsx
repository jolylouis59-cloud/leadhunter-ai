"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  containerStyle,
  landingColors,
  landingFont,
  outlineBtnStyle,
  primaryBtnStyle,
  sectionPadding,
  sectionTitleStyle,
} from "@/lib/landing-styles";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ANNUAL_PRICE_IDS = {
  starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_ANNUAL_PRICE_ID ?? "",
  growth: process.env.NEXT_PUBLIC_STRIPE_GROWTH_ANNUAL_PRICE_ID ?? "",
  agency: process.env.NEXT_PUBLIC_STRIPE_AGENCY_ANNUAL_PRICE_ID ?? "",
};

const MONTHLY_PRICE_IDS = {
  starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID ?? "",
  growth: process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID ?? "",
  agency: process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID ?? "",
};

type PlanFeature = string | { text: string; tooltip: string };

const plans = [
  {
    key: "starter" as const,
    name: "Starter",
    tagline: "Idéal pour tester et valider",
    monthlyPrice: 49,
    annualPrice: 39,
    annualTotal: 468,
    desc: "Pour les solopreneurs qui veulent leurs premiers clients",
    features: [
      "300 leads/mois",
      "Reddit uniquement",
      "Intent Score IA",
      "Réponse IA en 1 clic",
      "Alertes email",
    ] as PlanFeature[],
    cta: "Commencer gratuitement →",
    popular: false,
  },
  {
    key: "growth" as const,
    name: "Growth",
    tagline: "Le plus populaire chez nos fondateurs",
    monthlyPrice: 99,
    annualPrice: 79,
    annualTotal: 948,
    desc: "Pour les founders qui veulent scaler leur acquisition",
    features: [
      "1000 leads/mois",
      "Reddit + X + LinkedIn",
      "Intent Score IA avancé",
      "Réponse IA ultra-personnalisée",
      {
        text: "Générateur de posts LinkedIn/Reddit",
        tooltip:
          "Crée des posts optimisés pour attirer des prospects qualifiés sur Reddit et LinkedIn, adaptés à ton produit.",
      },
      "Alertes Slack + email",
      "Dashboard analytics",
    ] as PlanFeature[],
    cta: "Commencer gratuitement →",
    popular: true,
  },
  {
    key: "agency" as const,
    name: "Agency",
    tagline: null,
    monthlyPrice: 199,
    annualPrice: 159,
    annualTotal: 1908,
    desc: "Pour les agences qui gèrent plusieurs clients",
    features: [
      "Leads illimités",
      "5 workspaces clients",
      "Tout inclus",
      "API access",
      "Support prioritaire",
      "Onboarding dédié",
    ] as PlanFeature[],
    cta: "Commencer gratuitement →",
    popular: false,
  },
];

function FeatureItem({
  feature,
  isPopular,
}: {
  feature: PlanFeature;
  isPopular: boolean;
}) {
  const text = typeof feature === "string" ? feature : feature.text;
  const tooltip = typeof feature === "string" ? undefined : feature.tooltip;

  return (
    <li
      style={{
        display: "flex",
        gap: "8px",
        fontSize: "14px",
        color: isPopular ? "rgba(255,255,255,0.8)" : "#6B7280",
        marginBottom: "12px",
      }}
    >
      <span style={{ fontWeight: 700, color: landingColors.accent }}>✓</span>
      {tooltip ? (
        <span title={tooltip} style={{ borderBottom: "1px dashed currentColor", cursor: "help" }}>
          {text}
        </span>
      ) : (
        <span>{text}</span>
      )}
    </li>
  );
}

export default function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsDesktop(w >= 1024);
      setIsMobile(w < 768);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email ?? "");
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  function getPriceId(planKey: "starter" | "growth" | "agency") {
    const ids = billing === "annual" ? ANNUAL_PRICE_IDS : MONTHLY_PRICE_IDS;
    return ids[planKey];
  }

  async function handleSelectPlan(planKey: "starter" | "growth" | "agency") {
    const priceId = getPriceId(planKey);

    if (!priceId) {
      setToast("Price ID Stripe non configuré pour ce plan.");
      return;
    }

    if (!userId || !userEmail) {
      window.location.href = "/login";
      return;
    }

    setCheckoutLoading(planKey);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, userId, userEmail }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        setToast(data.error || "Erreur lors de la création du checkout");
        return;
      }

      window.location.href = data.url;
    } catch (e) {
      setToast("Erreur checkout: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setCheckoutLoading(null);
    }
  }

  const orderedPlans = isMobile
    ? [plans[1], plans[0], plans[2]]
    : plans;

  return (
    <section
      id="pricing"
      style={{
        ...sectionPadding,
        background: landingColors.white,
        fontFamily: landingFont,
      }}
    >
      <div style={containerStyle}>
        <h2 style={{ ...sectionTitleStyle, color: landingColors.text, textAlign: "center" }}>
          Tarification simple
        </h2>
        <p
          style={{
            margin: "16px auto 0",
            maxWidth: "480px",
            textAlign: "center",
            color: "#6B7280",
            fontSize: "16px",
          }}
        >
          7 jours gratuits sur tous les plans. Aucune CB requise.
        </p>

        <div
          style={{
            margin: "32px auto 0",
            display: "flex",
            width: "fit-content",
            gap: "4px",
            borderRadius: "8px",
            background: "#F3F4F6",
            padding: "4px",
          }}
        >
          {(["monthly", "annual"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setBilling(mode)}
              style={{
                padding: "8px 20px",
                borderRadius: "6px",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                background: billing === mode ? landingColors.white : "transparent",
                color: billing === mode ? landingColors.text : "#6B7280",
                boxShadow: billing === mode ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                fontFamily: landingFont,
              }}
            >
              {mode === "monthly" ? "Mensuel" : "Annuel "}
              {mode === "annual" && (
                <span style={{ color: landingColors.accent, fontSize: "11px" }}>-20%</span>
              )}
            </button>
          ))}
        </div>

        <div
          style={{
            marginTop: "56px",
            display: "grid",
            gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "1fr",
            gap: "24px",
            alignItems: "center",
          }}
        >
          {orderedPlans.map((plan) => {
            const isPopular = plan.popular;
            const displayPrice = billing === "monthly" ? plan.monthlyPrice : plan.annualPrice;

            return (
              <div
                key={plan.name}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "12px",
                  padding: "32px",
                  width: "100%",
                  boxSizing: "border-box",
                  background: isPopular ? landingColors.dark : landingColors.white,
                  color: isPopular ? landingColors.white : landingColors.text,
                  border: isPopular ? "none" : `1px solid ${landingColors.border}`,
                  boxShadow: isPopular ? "0 20px 60px rgba(0,0,0,0.3)" : "none",
                  transform: isPopular && isDesktop ? "scale(1.05)" : "none",
                }}
              >
                {isPopular && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-12px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      borderRadius: "999px",
                      background: landingColors.accent,
                      padding: "4px 14px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: landingColors.white,
                    }}
                  >
                    POPULAIRE
                  </span>
                )}

                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>{plan.name}</h3>
                {plan.tagline && (
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: landingColors.accent,
                    }}
                  >
                    {plan.tagline}
                  </p>
                )}
                <div style={{ marginTop: "16px", display: "flex", alignItems: "baseline", gap: "4px" }}>
                  <span style={{ fontSize: "36px", fontWeight: 800 }}>{displayPrice}€</span>
                  <span style={{ color: isPopular ? "rgba(255,255,255,0.6)" : "#6B7280" }}>/mois</span>
                </div>
                {billing === "annual" && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "12px",
                      color: isPopular ? "rgba(255,255,255,0.6)" : "#6B7280",
                    }}
                  >
                    soit {plan.annualPrice}€/mois, facturé {plan.annualTotal}€/an
                  </p>
                )}
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "14px",
                    color: isPopular ? "rgba(255,255,255,0.65)" : "#6B7280",
                  }}
                >
                  {plan.desc}
                </p>

                <ul style={{ margin: "24px 0 0", padding: 0, listStyle: "none", flex: 1 }}>
                  {plan.features.map((f) => (
                    <FeatureItem key={typeof f === "string" ? f : f.text} feature={f} isPopular={isPopular} />
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleSelectPlan(plan.key)}
                  disabled={checkoutLoading !== null}
                  style={{
                    ...(isPopular ? primaryBtnStyle : outlineBtnStyle),
                    marginTop: "32px",
                    width: "100%",
                    textAlign: "center",
                    boxSizing: "border-box",
                    cursor: checkoutLoading !== null ? "wait" : "pointer",
                    opacity: checkoutLoading !== null && checkoutLoading !== plan.key ? 0.6 : 1,
                    ...(!isPopular
                      ? { borderColor: landingColors.accent, color: landingColors.accent }
                      : {}),
                  }}
                >
                  {checkoutLoading === plan.key ? "Redirection…" : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        <p
          style={{
            margin: "40px auto 0",
            maxWidth: "640px",
            textAlign: "center",
            fontSize: "14px",
            color: "#6B7280",
          }}
        >
          (Prix HT, TVA applicable selon votre pays) · Annulation en 1 clic
        </p>
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            left: isMobile ? 24 : "auto",
            background: landingColors.text,
            color: landingColors.white,
            padding: "14px 20px",
            borderRadius: "10px",
            fontSize: "14px",
            zIndex: 100,
            fontFamily: landingFont,
          }}
        >
          {toast}
        </div>
      )}
    </section>
  );
}
