"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { cardBase, colors, fontFamily, primaryButton } from "@/lib/dashboard-styles";
import {
  getProspectCount,
  GOAL_OPTIONS,
  ICP_OPTIONS,
  LOADING_LOGS,
  ONBOARDING_PLANS,
  type IcpSegmentId,
  type MonthlyGoalId,
} from "@/lib/onboarding-flow";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Step = 1 | 2 | 3 | 4;
type LoadingPhase = "logs" | "result";

function ChoiceCard({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "18px 20px",
        borderRadius: "12px",
        border: `2px solid ${selected ? colors.accent : colors.border}`,
        background: selected ? "rgba(31,77,58,0.06)" : colors.card,
        color: colors.text,
        fontSize: "15px",
        fontWeight: 600,
        cursor: "pointer",
        fontFamily,
        transition: "border-color 150ms ease, background 150ms ease",
      }}
    >
      {label}
    </button>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [icpSegment, setIcpSegment] = useState<IcpSegmentId | null>(null);
  const [monthlyGoal, setMonthlyGoal] = useState<MonthlyGoalId | null>(null);
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>("logs");
  const [logIndex, setLogIndex] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const prospectCount = getProspectCount(icpSegment);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setUserId(user.id);
      setUserEmail(user.email ?? "");

      const { data } = await supabase
        .from("user_configs")
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.onboarding_completed) {
        router.replace("/dashboard");
        return;
      }

      setLoading(false);
    }

    load();
  }, [router]);

  useEffect(() => {
    if (step !== 3) return;

    setLoadingPhase("logs");
    setLogIndex(0);

    const intervals: ReturnType<typeof setInterval>[] = [];
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    LOADING_LOGS.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setLogIndex(index);
        if (index === LOADING_LOGS.length - 1) {
          const resultTimeout = setTimeout(() => setLoadingPhase("result"), 1000);
          timeouts.push(resultTimeout);
        }
      }, index * 1000);
      timeouts.push(timeout);
    });

    const advanceTimeout = setTimeout(() => setStep(4), 4500);
    timeouts.push(advanceTimeout);

    return () => {
      intervals.forEach(clearInterval);
      timeouts.forEach(clearTimeout);
    };
  }, [step]);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  }

  async function saveOnboardingAndCheckout(priceId: string, planKey: string) {
    if (!priceId) {
      showToast("Price ID Stripe non configuré pour ce plan.");
      return;
    }

    if (!userId || !userEmail) {
      showToast("Session expirée. Reconnecte-toi.");
      return;
    }

    if (!icpSegment || !monthlyGoal) {
      showToast("Complète les étapes précédentes.");
      return;
    }

    setCheckoutLoading(planKey);

    try {
      const { error: saveError } = await supabase.from("user_configs").upsert(
        {
          user_id: userId,
          icp_segment: icpSegment,
          monthly_goal: monthlyGoal,
          onboarding_completed: true,
        },
        { onConflict: "user_id" }
      );

      if (saveError) {
        showToast("Erreur sauvegarde : " + saveError.message);
        return;
      }

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

  if (loading) {
    return (
      <div style={{ fontFamily, color: colors.textMuted, padding: "48px 0", textAlign: "center" }}>
        Chargement…
      </div>
    );
  }

  return (
    <div style={{ fontFamily, maxWidth: step === 4 ? "960px" : "640px", margin: "0 auto", width: "100%" }}>
      {step < 4 && (
        <p style={{ margin: "0 0 24px", fontSize: "13px", fontWeight: 600, color: colors.accent }}>
          Étape {step} / 4
        </p>
      )}

      {step === 1 && (
        <div style={{ ...cardBase, padding: isMobile ? "24px" : "32px" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: "26px", fontWeight: 700, color: colors.text }}>
            Qui tu cibles ?
          </h1>
          <p style={{ margin: "0 0 24px", fontSize: "14px", color: colors.textMuted }}>
            Choisis le profil qui correspond le mieux à ta cible.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {ICP_OPTIONS.map((option) => (
              <ChoiceCard
                key={option.id}
                label={option.label}
                selected={icpSegment === option.id}
                onClick={() => setIcpSegment(option.id)}
              />
            ))}
          </div>
          <button
            type="button"
            disabled={!icpSegment}
            onClick={() => setStep(2)}
            style={{
              ...primaryButton(false, !icpSegment),
              width: "100%",
              marginTop: "24px",
              padding: "14px 24px",
              fontSize: "15px",
              fontWeight: 600,
              fontFamily,
            }}
          >
            Continuer →
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ ...cardBase, padding: isMobile ? "24px" : "32px" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: "26px", fontWeight: 700, color: colors.text }}>
            Quel est ton objectif ce mois-ci ?
          </h1>
          <p style={{ margin: "0 0 24px", fontSize: "14px", color: colors.textMuted }}>
            On adapte ta stratégie de prospection à ton ambition.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {GOAL_OPTIONS.map((option) => (
              <ChoiceCard
                key={option.id}
                label={option.label}
                selected={monthlyGoal === option.id}
                onClick={() => setMonthlyGoal(option.id)}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                flex: 1,
                padding: "14px 20px",
                fontSize: "14px",
                fontWeight: 600,
                color: colors.text,
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: "10px",
                cursor: "pointer",
                fontFamily,
              }}
            >
              ← Retour
            </button>
            <button
              type="button"
              disabled={!monthlyGoal}
              onClick={() => setStep(3)}
              style={{
                ...primaryButton(false, !monthlyGoal),
                flex: 2,
                padding: "14px 24px",
                fontSize: "15px",
                fontWeight: 600,
                fontFamily,
              }}
            >
              Analyser mon potentiel →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div
          style={{
            ...cardBase,
            padding: isMobile ? "32px 24px" : "48px 32px",
            textAlign: "center",
            minHeight: "280px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loadingPhase === "logs" && (
            <>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  border: `3px solid ${colors.border}`,
                  borderTopColor: colors.accent,
                  borderRadius: "50%",
                  animation: "onboarding-spin 0.9s linear infinite",
                  marginBottom: "28px",
                }}
              />
              <p
                key={logIndex}
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 600,
                  color: colors.text,
                  animation: "onboarding-fade 0.4s ease",
                }}
              >
                {LOADING_LOGS[logIndex]}
              </p>
            </>
          )}

          {loadingPhase === "result" && (
            <p
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 700,
                color: colors.text,
                lineHeight: 1.5,
                animation: "onboarding-fade 0.5s ease",
              }}
            >
              Nous avons identifié{" "}
              <span style={{ color: colors.accent }}>{prospectCount.toLocaleString("fr-FR")}</span>{" "}
              prospects correspondant à ton profil.
            </p>
          )}
        </div>
      )}

      {step === 4 && (
        <div>
          <h1
            style={{
              margin: "0 0 8px",
              fontSize: isMobile ? "26px" : "32px",
              fontWeight: 800,
              color: colors.text,
              textAlign: "center",
            }}
          >
            Tes {prospectCount.toLocaleString("fr-FR")} leads t&apos;attendent.
          </h1>
          <p
            style={{
              margin: "0 0 32px",
              fontSize: "15px",
              color: colors.textMuted,
              textAlign: "center",
            }}
          >
            Débloque l&apos;accès pour contacter tes prospects qualifiés.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: "20px",
            }}
          >
            {ONBOARDING_PLANS.map((plan) => (
              <div
                key={plan.key}
                style={{
                  ...cardBase,
                  padding: "24px",
                  position: "relative",
                  border: plan.popular ? `2px solid ${colors.accent}` : `1px solid ${colors.border}`,
                  boxShadow: plan.popular ? "0 8px 30px rgba(31,77,58,0.12)" : "none",
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
                <p style={{ margin: "20px 0 0", fontSize: "32px", fontWeight: 800, color: colors.text }}>
                  {plan.price}
                  <span style={{ fontSize: "14px", fontWeight: 500, color: colors.textMuted }}>
                    {plan.period}
                  </span>
                </p>
                <ul style={{ margin: "20px 0 0", padding: 0, listStyle: "none" }}>
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      style={{
                        fontSize: "13px",
                        color: colors.textMuted,
                        padding: "5px 0",
                        display: "flex",
                        gap: "8px",
                      }}
                    >
                      <span style={{ color: colors.accent }}>✓</span> {feature}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => saveOnboardingAndCheckout(plan.priceId, plan.key)}
                  disabled={checkoutLoading !== null}
                  style={{
                    ...(plan.popular ? primaryButton(false, checkoutLoading === plan.key) : {}),
                    marginTop: "24px",
                    width: "100%",
                    padding: "12px 16px",
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
                  {checkoutLoading === plan.key ? "Redirection…" : "Débloquer mes leads →"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes onboarding-spin { to { transform: rotate(360deg); } }
        @keyframes onboarding-fade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            left: isMobile ? 24 : "auto",
            background: colors.text,
            color: "#fff",
            padding: "14px 20px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 500,
            boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            zIndex: 100,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
