"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { cardBase, colors, fontFamily, primaryButton } from "@/lib/dashboard-styles";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PLANS = [
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

export default function PricingPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
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

  async function handleSelectPlan(priceId: string, planKey: string) {
    console.log("click plan", priceId);

    if (!priceId) {
      setToast("Price ID Stripe non configuré pour ce plan.");
      return;
    }

    if (!userId || !userEmail) {
      setToast("Connecte-toi pour choisir un plan.");
      return;
    }

    setCheckoutLoading(planKey);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          userId,
          userEmail,
        }),
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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        fontFamily,
        padding: isMobile ? "24px 16px" : "40px 24px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "14px",
            fontWeight: 600,
            color: colors.accent,
            textDecoration: "none",
            marginBottom: isMobile ? "24px" : "32px",
          }}
        >
          ← Retour à l&apos;accueil
        </Link>

        <header style={{ marginBottom: isMobile ? "28px" : "40px", textAlign: "center" }}>
          <h1
            style={{
              margin: 0,
              fontSize: isMobile ? "28px" : "36px",
              fontWeight: 800,
              color: colors.text,
              letterSpacing: "-0.02em",
            }}
          >
            Choisis ton plan
          </h1>
          <p
            style={{
              margin: "12px auto 0",
              maxWidth: "480px",
              fontSize: "15px",
              color: colors.textMuted,
              lineHeight: 1.6,
            }}
          >
            Accède au scanner Reddit, à l&apos;Intent Score IA et aux réponses générées
            automatiquement.
          </p>
        </header>

        <div
          style={
            isMobile
              ? { display: "flex", flexDirection: "column", gap: "16px" }
              : {
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "20px",
                }
          }
        >
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              style={{
                ...cardBase,
                padding: isMobile ? "24px 20px" : "28px 24px",
                position: "relative",
                border: plan.popular
                  ? `2px solid ${colors.accent}`
                  : `1px solid ${colors.border}`,
                boxShadow: plan.popular ? "0 4px 20px rgba(31,77,58,0.12)" : "none",
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
              <p style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: colors.text }}>
                {plan.name}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: colors.textMuted }}>
                {plan.desc}
              </p>
              <p
                style={{
                  margin: "20px 0 0",
                  fontSize: "32px",
                  fontWeight: 800,
                  color: colors.text,
                }}
              >
                {plan.price}
                <span style={{ fontSize: "14px", fontWeight: 500, color: colors.textMuted }}>
                  {plan.period}
                </span>
              </p>
              <ul style={{ margin: "20px 0 0", padding: 0, listStyle: "none" }}>
                {plan.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      fontSize: "13px",
                      color: colors.textMuted,
                      padding: "5px 0",
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    <span style={{ color: colors.accent }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => handleSelectPlan(plan.priceId, plan.key)}
                disabled={checkoutLoading === plan.key}
                style={{
                  ...(plan.popular ? primaryButton(false, false) : {}),
                  marginTop: "24px",
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  borderRadius: "8px",
                  cursor: checkoutLoading === plan.key ? "wait" : "pointer",
                  fontFamily,
                  opacity: checkoutLoading !== null && checkoutLoading !== plan.key ? 0.6 : 1,
                  background: plan.popular ? colors.accent : "transparent",
                  color: plan.popular ? "#FFFFFF" : colors.accent,
                  border: plan.popular ? "none" : `1.5px solid ${colors.accent}`,
                }}
              >
                {checkoutLoading === plan.key ? "Redirection…" : "Choisir ce plan"}
              </button>
            </div>
          ))}
        </div>

        {!userId && (
          <p
            style={{
              marginTop: "24px",
              textAlign: "center",
              fontSize: "14px",
              color: colors.textMuted,
            }}
          >
            <Link href="/login" style={{ color: colors.accent, fontWeight: 600 }}>
              Connecte-toi
            </Link>{" "}
            pour souscrire à un plan.
          </p>
        )}
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            background: colors.text,
            color: "#FFFFFF",
            padding: "14px 24px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 500,
            boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            zIndex: 100,
            maxWidth: "90vw",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
