"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ONBOARDING_PLANS } from "@/lib/onboarding-flow";
import { cardBase, colors, fontFamily, primaryButton } from "@/lib/dashboard-styles";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type FreeTrialUpgradeSectionProps = {
  title?: string;
  subtitle?: string;
};

export default function FreeTrialUpgradeSection({
  title = "Passe à un plan pour débloquer plus de leads",
  subtitle = "Choisis Starter, Growth ou Agency pour continuer ta prospection sans limite.",
}: FreeTrialUpgradeSectionProps) {
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  }

  async function handleSelectPlan(priceId: string, planKey: string) {
    if (!priceId) {
      showToast("Price ID Stripe non configuré pour ce plan.");
      return;
    }

    setCheckoutLoading(planKey);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        showToast("Session expirée. Reconnecte-toi.");
        return;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        showToast(data.error || "Erreur lors de la création du checkout");
        return;
      }

      window.location.href = data.url;
    } catch (e) {
      showToast("Erreur checkout: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setCheckoutLoading(null);
    }
  }

  return (
    <div style={{ marginBottom: "24px" }}>
      <div
        style={{
          ...cardBase,
          padding: "24px",
          marginBottom: "20px",
          background: "linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)",
          border: `1px solid ${colors.accent}33`,
        }}
      >
        <p style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 700, color: colors.text }}>
          {title}
        </p>
        <p style={{ margin: 0, fontSize: "14px", color: colors.textMuted }}>{subtitle}</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        {ONBOARDING_PLANS.map((plan) => (
          <div
            key={plan.key}
            style={{
              ...cardBase,
              padding: "20px",
              position: "relative",
              border: plan.popular ? `2px solid ${colors.accent}` : `1px solid ${colors.border}`,
            }}
          >
            {plan.popular && (
              <span
                style={{
                  position: "absolute",
                  top: "-10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: colors.accent,
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: "20px",
                }}
              >
                POPULAIRE
              </span>
            )}
            <p style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 700, color: colors.text }}>
              {plan.name}
            </p>
            <p style={{ margin: "0 0 12px", fontSize: "13px", color: colors.textMuted }}>{plan.desc}</p>
            <p style={{ margin: "0 0 12px", fontSize: "28px", fontWeight: 800, color: colors.text }}>
              {plan.price}
              <span style={{ fontSize: "14px", fontWeight: 500, color: colors.textMuted }}>{plan.period}</span>
            </p>
            <ul style={{ margin: "0 0 16px", paddingLeft: "18px", fontSize: "13px", color: colors.textMuted }}>
              {plan.features.map((feature) => (
                <li key={feature} style={{ marginBottom: "4px" }}>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => handleSelectPlan(plan.priceId, plan.key)}
              disabled={checkoutLoading !== null}
              style={{
                ...(plan.popular ? primaryButton(false, checkoutLoading === plan.key) : {}),
                width: "100%",
                padding: "10px 16px",
                fontSize: "14px",
                fontWeight: 600,
                borderRadius: "8px",
                cursor: checkoutLoading !== null ? "wait" : "pointer",
                fontFamily,
                opacity: checkoutLoading !== null && checkoutLoading !== plan.key ? 0.6 : 1,
                background: plan.popular ? colors.accent : "transparent",
                color: plan.popular ? "#FFFFFF" : colors.accent,
                border: plan.popular ? "none" : `1.5px solid ${colors.accent}`,
              }}
            >
              {checkoutLoading === plan.key ? "Redirection…" : `Choisir ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      {toast && (
        <p style={{ margin: "16px 0 0", fontSize: "13px", color: "#DC2626", textAlign: "center" }}>
          {toast}
        </p>
      )}
    </div>
  );
}
