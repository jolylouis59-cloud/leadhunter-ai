"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter, useSearchParams } from "next/navigation";
import { cardBase, colors, fontFamily, primaryButton } from "@/lib/dashboard-styles";
import { getKeywordLimit, getSubredditLimit } from "@/lib/plan-limits";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type TabId = "scanner" | "billing" | "notifications" | "account";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "scanner", label: "Scanner", icon: "🎯" },
  { id: "billing", label: "Abonnement", icon: "💳" },
  { id: "notifications", label: "Notifications", icon: "🔔" },
  { id: "account", label: "Compte", icon: "👤" },
];

const DEFAULT_KEYWORDS = [
  "trouver des clients B2B",
  "prospection sans cold email",
  "comment trouver des clients",
  "outil prospection",
  "alternative cold email",
];

const DEFAULT_SUBREDDITS = ["FrenchStartup", "Entrepreneur_Francophone", "SaaS"];

const ANNUAL_PRICE_IDS: Record<string, string> = {
  starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_ANNUAL_PRICE_ID ?? "",
  growth: process.env.NEXT_PUBLIC_STRIPE_GROWTH_ANNUAL_PRICE_ID ?? "",
  agency: process.env.NEXT_PUBLIC_STRIPE_AGENCY_ANNUAL_PRICE_ID ?? "",
};

const PLAN_PRICING: Record<string, { monthly: string; annualLine: string }> = {
  starter: { monthly: "49€/mois", annualLine: "39€/mois · 468€/an" },
  growth: { monthly: "99€/mois", annualLine: "79€/mois · 948€/an" },
  agency: { monthly: "199€/mois", annualLine: "159€/mois · 1908€/an" },
};

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

const PLAN_LABELS: Record<string, string> = {
  free: "Essai gratuit",
  starter: "Starter",
  growth: "Growth",
  agency: "Agency",
};

function Toggle({
  enabled,
  onChange,
  isMobile,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  isMobile: boolean;
}) {
  const w = isMobile ? 44 : 44;
  const h = 24;
  const circle = 20;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      style={{
        width: w,
        height: h,
        borderRadius: h,
        border: "none",
        background: enabled ? colors.accent : "#E5E7EB",
        position: "relative",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 150ms ease",
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: (h - circle) / 2,
          left: enabled ? w - circle - 2 : 2,
          width: circle,
          height: circle,
          borderRadius: "50%",
          background: "#FFFFFF",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          transition: "left 150ms ease",
        }}
      />
    </button>
  );
}

function Toast({
  message,
  isMobile,
  onClose,
}: {
  message: string;
  isMobile: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 100,
        bottom: isMobile ? 16 : 24,
        right: isMobile ? 16 : 24,
        left: isMobile ? 16 : "auto",
        width: isMobile ? "calc(100% - 32px)" : "auto",
        maxWidth: isMobile ? "none" : 360,
        background: colors.text,
        color: "#FFFFFF",
        padding: "14px 20px",
        borderRadius: "10px",
        fontSize: "14px",
        fontWeight: 500,
        boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
        fontFamily,
      }}
    >
      {message}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            fontFamily,
            color: colors.textMuted,
            padding: "48px 16px",
            textAlign: "center",
          }}
        >
          Chargement…
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>(
    (searchParams.get("tab") as TabId) || "scanner"
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveHover, setSaveHover] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [keywordError, setKeywordError] = useState<string | null>(null);
  const [subredditError, setSubredditError] = useState<string | null>(null);

  const [productDesc, setProductDesc] = useState("");
  const [target, setTarget] = useState("");
  const [keywords, setKeywords] = useState<string[]>(DEFAULT_KEYWORDS);
  const [subreddits, setSubreddits] = useState<string[]>(DEFAULT_SUBREDDITS);
  const [keywordInput, setKeywordInput] = useState("");
  const [subredditInput, setSubredditInput] = useState("");
  const [initialSnapshot, setInitialSnapshot] = useState("");

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [alertEmail, setAlertEmail] = useState("");
  const [slackWebhook, setSlackWebhook] = useState("");
  const [autoScanHour, setAutoScanHour] = useState(8);
  const [slackTesting, setSlackTesting] = useState(false);

  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [leadsLimit, setLeadsLimit] = useState(0);
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [billingName, setBillingName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    async function loadConfig() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserEmail(user.email ?? "");
      setUserId(user.id);

      const { data, error } = await supabase
        .from("user_configs")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data) {
        const pd = data.product_description ?? "";
        const tg = data.target ?? "";
        const kw = data.keywords?.length ? data.keywords : DEFAULT_KEYWORDS;
        const sr = data.subreddits?.length ? data.subreddits : DEFAULT_SUBREDDITS;

        setProductDesc(pd);
        setTarget(tg);
        setKeywords(kw);
        setSubreddits(sr);
        if (data.plan) setCurrentPlan(data.plan);
        if (typeof data.leads_limit === "number") setLeadsLimit(data.leads_limit);
        if (data.stripe_customer_id) setStripeCustomerId(data.stripe_customer_id);
        if (data.trial_ends_at) setTrialEndsAt(data.trial_ends_at);
        if (data.billing_name) setBillingName(data.billing_name);
        if (data.billing_address) setBillingAddress(data.billing_address);
        if (data.alert_email) setAlertEmail(data.alert_email);
        else setAlertEmail(user.email ?? "");
        if (data.slack_webhook_url) setSlackWebhook(data.slack_webhook_url);
        if (typeof data.email_alerts === "boolean") setEmailAlerts(data.email_alerts);
        if (typeof data.slack_alerts === "boolean") setSlackAlerts(data.slack_alerts);
        if (typeof data.auto_scan === "boolean") setAutoScan(data.auto_scan);
        if (typeof data.weekly_digest === "boolean") setWeeklyDigest(data.weekly_digest);
        if (typeof data.auto_scan_hour === "number") setAutoScanHour(data.auto_scan_hour);

        setInitialSnapshot(
          JSON.stringify({
            productDesc: pd,
            target: tg,
            keywords: kw,
            subreddits: sr,
            emailAlerts: data.email_alerts ?? true,
            slackAlerts: data.slack_alerts ?? false,
            autoScan: data.auto_scan ?? false,
            weeklyDigest: data.weekly_digest ?? true,
            alertEmail: data.alert_email ?? user.email,
            slackWebhook: data.slack_webhook_url ?? "",
            autoScanHour: data.auto_scan_hour ?? 8,
          })
        );
      } else {
        setAlertEmail(user.email ?? "");
        setInitialSnapshot(
          JSON.stringify({
            productDesc: "",
            target: "",
            keywords: DEFAULT_KEYWORDS,
            subreddits: DEFAULT_SUBREDDITS,
            emailAlerts: true,
            slackAlerts: false,
            autoScan: false,
            weeklyDigest: true,
            alertEmail: user.email,
            slackWebhook: "",
            autoScanHour: 8,
          })
        );
      }

      setLoading(false);
    }

    loadConfig();
  }, []);

  const cardPadding = isMobile ? "16px" : "28px";
  const pagePadding = isMobile ? "16px" : "0";

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: colors.text,
    marginBottom: "8px",
    letterSpacing: "-0.01em",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    fontSize: "14px",
    color: colors.text,
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: "8px",
    outline: "none",
    fontFamily,
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: "96px",
    resize: "vertical",
    lineHeight: 1.5,
  };

  const btnWidth = isMobile ? "100%" : "auto";
  const btnMinWidth = isMobile ? "unset" : "160px";

  const keywordLimit = getKeywordLimit(currentPlan);
  const subredditLimit = getSubredditLimit(currentPlan);

  const isDirty = useMemo(() => {
    if (!initialSnapshot) return false;
    const current = JSON.stringify({
      productDesc,
      target,
      keywords,
      subreddits,
      emailAlerts,
      slackAlerts,
      autoScan,
      weeklyDigest,
      alertEmail,
      slackWebhook,
      autoScanHour,
    });
    return current !== initialSnapshot;
  }, [
    initialSnapshot,
    productDesc,
    target,
    keywords,
    subreddits,
    emailAlerts,
    slackAlerts,
    autoScan,
    weeklyDigest,
    alertEmail,
    slackWebhook,
    autoScanHour,
  ]);

  const trialDaysLeft = useMemo(() => {
    if (!trialEndsAt) return null;
    const diff = new Date(trialEndsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [trialEndsAt]);

  function addKeyword() {
    const value = keywordInput.trim();
    setKeywordError(null);

    if (!value) {
      setKeywordError("Le mot-clé ne peut pas être vide.");
      return;
    }
    if (keywords.includes(value)) {
      setKeywordError("Ce mot-clé existe déjà");
      return;
    }
    if (keywords.length >= keywordLimit) {
      setKeywordError("Limite de mots-clés atteinte pour votre plan.");
      return;
    }
    setKeywords((prev) => [...prev, value]);
    setKeywordInput("");
  }

  function addSubreddit() {
    const value = subredditInput.trim().replace(/^r\//, "");
    setSubredditError(null);
    if (!value) {
      setSubredditError("Le subreddit ne peut pas être vide.");
      return;
    }
    if (subreddits.includes(value)) {
      setSubredditError("Ce subreddit existe déjà.");
      return;
    }
    if (subreddits.length >= subredditLimit) {
      setSubredditError("Limite de subreddits atteinte pour votre plan.");
      return;
    }
    setSubreddits((prev) => [...prev, value]);
    setSubredditInput("");
  }

  async function handleSave() {
    setSaving(true);

    const uid = (await supabase.auth.getUser()).data.user?.id;

    const { error } = await supabase.from("user_configs").upsert(
      {
        user_id: uid,
        product_description: productDesc,
        target: target,
        keywords: keywords,
        subreddits: subreddits,
        email_alerts: emailAlerts,
        slack_alerts: slackAlerts,
        auto_scan: autoScan,
        weekly_digest: weeklyDigest,
        alert_email: alertEmail,
        slack_webhook_url: slackWebhook || null,
        auto_scan_hour: autoScanHour,
      },
      { onConflict: "user_id" }
    );

    setSaving(false);

    if (error) {
      setToast("Erreur : " + error.message);
    } else {
      setToast("Paramètres sauvegardés ✓");
      setInitialSnapshot(
        JSON.stringify({
          productDesc,
          target,
          keywords,
          subreddits,
          emailAlerts,
          slackAlerts,
          autoScan,
          weeklyDigest,
          alertEmail,
          slackWebhook,
          autoScanHour,
        })
      );
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleSelectPlan(priceId: string, planKey: string) {
    if (!priceId) {
      setToast(
        "Paiement bientôt disponible — contacte-nous à contact@leadhunterai.fr"
      );
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

  function renderBadges(items: string[], onRemove: (item: string) => void) {
    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginTop: "12px",
        }}
      >
        {items.map((item) => (
          <span
            key={item}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: 500,
              color: colors.text,
              flexShrink: 0,
            }}
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(item)}
              style={{
                background: "transparent",
                border: "none",
                color: colors.textMuted,
                cursor: "pointer",
                fontSize: "15px",
                padding: 0,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    );
  }

  function renderToggleRow(
    title: string,
    desc: string,
    value: boolean,
    onChange: (v: boolean) => void
  ) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 0",
          borderBottom: "1px solid #F3F4F6",
        }}
      >
        <div style={{ flex: 1, paddingRight: "16px" }}>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: colors.text }}>
            {title}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: colors.textMuted, lineHeight: 1.4 }}>
            {desc}
          </p>
        </div>
        <Toggle enabled={value} onChange={onChange} isMobile={isMobile} />
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          fontFamily,
          color: colors.textMuted,
          padding: isMobile ? "48px 16px" : "48px 0",
          textAlign: "center",
        }}
      >
        Chargement…
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily,
        padding: pagePadding,
        maxWidth: "800px",
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <header style={{ marginBottom: isMobile ? "20px" : "32px" }}>
        <h1
          style={{
            fontSize: isMobile ? "24px" : "28px",
            fontWeight: 700,
            color: colors.text,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Paramètres
        </h1>
        <p style={{ marginTop: "6px", marginBottom: 0, fontSize: "14px", color: colors.textMuted }}>
          Gère ton scanner, ton abonnement et tes préférences
        </p>
      </header>

      {/* Tabs */}
      <div
        style={
          isMobile
            ? {
                overflowX: "auto",
                whiteSpace: "nowrap",
                display: "flex",
                gap: "8px",
                marginBottom: "20px",
                paddingBottom: "4px",
                WebkitOverflowScrolling: "touch",
              }
            : {
                display: "flex",
                gap: "8px",
                marginBottom: "28px",
                flexWrap: "wrap",
              }
        }
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: isMobile ? "inline-block" : "inline-flex",
                flexShrink: 0,
                alignItems: "center",
                gap: "6px",
                padding: "10px 16px",
                borderRadius: "8px",
                border: active ? "none" : `1px solid ${colors.border}`,
                background: active ? colors.accent : colors.card,
                color: active ? "#FFFFFF" : colors.textMuted,
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily,
                transition: "background 150ms ease, color 150ms ease",
              }}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB: Scanner ── */}
      {activeTab === "scanner" && (
        <div
          style={{
            ...cardBase,
            padding: cardPadding,
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? "20px" : "28px",
          }}
        >
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700, color: colors.text }}>
              Configuration du scanner
            </p>
            <p style={{ margin: "0 0 12px", fontSize: "13px", color: colors.textMuted }}>
              Ces infos sont utilisées par Claude pour scorer l&apos;intention d&apos;achat sur Reddit.
            </p>
            <Link
              href="/dashboard/onboarding"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 16px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#fff",
                background: colors.accent,
                borderRadius: "8px",
                textDecoration: "none",
                fontFamily,
              }}
            >
              Configurer mon profil client →
            </Link>
          </div>

          <div>
            <label htmlFor="product" style={labelStyle}>
              Décris ton produit en 1 phrase
            </label>
            <textarea
              id="product"
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
              placeholder="Ex: SaaS de prospection B2B qui scanne Reddit pour trouver des clients"
              style={textareaStyle}
            />
          </div>

          <div>
            <label htmlFor="target" style={labelStyle}>
              Qui cherches-tu à atteindre ?
            </label>
            <textarea
              id="target"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Ex: Founders SaaS, solopreneurs, agences marketing"
              style={textareaStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Mots-clés Reddit</label>
            <p
              style={{
                fontSize: 12,
                color: "#888888",
                marginTop: 0,
                marginBottom: 12,
                fontStyle: "italic",
              }}
            >
              💡 Conseil : utilise des mots-clés en français pour cibler le marché francophone. Ex :
              &apos;trouver des clients B2B&apos;, &apos;prospection automatique&apos;, &apos;alternative cold
              email&apos;
            </p>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "10px" }}>
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
                placeholder="Ajouter un mot-clé…"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={addKeyword}
                style={{
                  padding: "12px 18px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: colors.accent,
                  background: colors.card,
                  border: `1px solid ${colors.accent}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontFamily,
                  width: isMobile ? "100%" : "auto",
                  flexShrink: 0,
                }}
              >
                Ajouter
              </button>
            </div>
            {renderBadges(keywords, (item) =>
              setKeywords((prev) => prev.filter((k) => k !== item))
            )}
            <div style={{ marginTop: "12px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  color: colors.textMuted,
                  marginBottom: "6px",
                }}
              >
                <span>
                  {keywords.length} / {keywordLimit} mots-clés
                </span>
              </div>
              <div
                style={{
                  height: "6px",
                  background: colors.border,
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(100, (keywords.length / keywordLimit) * 100)}%`,
                    background:
                      keywords.length >= keywordLimit ? "#DC2626" : colors.accent,
                    borderRadius: "3px",
                  }}
                />
              </div>
              {keywordError && (
                <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#DC2626" }}>
                  {keywordError}
                </p>
              )}
              {keywords.length >= keywordLimit && currentPlan === "starter" && (
                <p style={{ margin: "8px 0 0", fontSize: "13px", color: colors.textMuted }}>
                  Limite atteinte —{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("billing")}
                    style={{
                      background: "none",
                      border: "none",
                      color: colors.accent,
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: 0,
                      fontFamily,
                      textDecoration: "underline",
                    }}
                  >
                    Passe au plan Growth
                  </button>{" "}
                  pour ajouter plus de mots-clés
                </p>
              )}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Subreddits</label>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "10px" }}>
              <input
                type="text"
                value={subredditInput}
                onChange={(e) => setSubredditInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSubreddit();
                  }
                }}
                placeholder="Ex: SaaS"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={addSubreddit}
                style={{
                  padding: "12px 18px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: colors.accent,
                  background: colors.card,
                  border: `1px solid ${colors.accent}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontFamily,
                  width: isMobile ? "100%" : "auto",
                  flexShrink: 0,
                }}
              >
                Ajouter
              </button>
            </div>
            {renderBadges(subreddits, (item) =>
              setSubreddits((prev) => prev.filter((s) => s !== item))
            )}
            <div style={{ marginTop: "12px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  color: colors.textMuted,
                  marginBottom: "6px",
                }}
              >
                <span>
                  {subreddits.length} / {subredditLimit} subreddits
                </span>
              </div>
              <div
                style={{
                  height: "6px",
                  background: colors.border,
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(100, (subreddits.length / subredditLimit) * 100)}%`,
                    background:
                      subreddits.length >= subredditLimit ? "#DC2626" : colors.accent,
                    borderRadius: "3px",
                  }}
                />
              </div>
              {subredditError && (
                <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#DC2626" }}>
                  {subredditError}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
            onMouseEnter={() => setSaveHover(true)}
            onMouseLeave={() => setSaveHover(false)}
            style={{
              ...primaryButton(saveHover, saving || !isDirty),
              width: btnWidth,
              minWidth: btnMinWidth,
              padding: "12px 28px",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {saving && (
              <span
                style={{
                  width: "14px",
                  height: "14px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            )}
            {saving ? "Sauvegarde…" : "Sauvegarder"}
          </button>
        </div>
      )}

      {/* ── TAB: Abonnement ── */}
      {activeTab === "billing" && (
        <div>
          <div
            style={{
              ...cardBase,
              padding: "16px 20px",
              marginBottom: "20px",
              border: `1px solid ${colors.accent}`,
              background: "rgba(31,77,58,0.05)",
            }}
          >
            <p style={{ margin: 0, fontSize: "14px", color: colors.text }}>
              Plan actuel :{" "}
              <strong>{PLAN_LABELS[currentPlan] ?? currentPlan}</strong>
              {leadsLimit > 0 && (
                <span>
                  {" "}
                  — {leadsLimit >= 999999 ? "leads illimités" : `${leadsLimit} leads/mois`}
                </span>
              )}
            </p>
            {currentPlan === "free" && (
              <p style={{ margin: "8px 0 0", fontSize: "13px", color: colors.textMuted }}>
                {trialEndsAt
                  ? `Votre essai gratuit se termine le ${new Date(trialEndsAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}${trialDaysLeft !== null ? ` (${trialDaysLeft} jour${trialDaysLeft > 1 ? "s" : ""} restant${trialDaysLeft > 1 ? "s" : ""})` : ""}`
                  : "7 jours d'essai inclus"}
              </p>
            )}
          </div>
          <div
            style={{
              display: "flex",
              background: "#F3EDE2",
              borderRadius: 24,
              padding: 4,
              width: "fit-content",
              margin: "0 auto 32px",
            }}
          >
            {(["monthly", "annual"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setBillingPeriod(mode)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  fontFamily,
                  background: billingPeriod === mode ? colors.accent : "transparent",
                  color: billingPeriod === mode ? "#FFFFFF" : "#666666",
                }}
              >
                {mode === "monthly" ? "Mensuel" : "Annuel -20%"}
              </button>
            ))}
          </div>
          <div
            style={
              isMobile
                ? { display: "flex", flexDirection: "column", gap: "12px" }
                : {
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "16px",
                  }
            }
          >
            {PLANS.map((plan) => {
              const isCurrent = currentPlan === plan.key;
              const priceId =
                billingPeriod === "annual"
                  ? ANNUAL_PRICE_IDS[plan.key] || plan.priceId
                  : plan.priceId;
              const pricing = PLAN_PRICING[plan.key];
              return (
              <div
                key={plan.name}
                style={{
                  ...cardBase,
                  padding: cardPadding,
                  position: "relative",
                  border: isCurrent
                    ? `2px solid ${colors.accent}`
                    : plan.popular
                      ? `2px solid ${colors.accent}`
                      : `1px solid ${colors.border}`,
                  boxShadow: plan.popular ? "0 4px 20px rgba(31,77,58,0.12)" : "none",
                  opacity: isCurrent ? 1 : 1,
                }}
              >
                {isCurrent && (
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
                      whiteSpace: "nowrap",
                    }}
                  >
                    Votre plan actuel
                  </span>
                )}
                {!isCurrent && plan.popular && (
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
                <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: colors.text }}>
                  {plan.name}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: colors.textMuted }}>
                  {plan.desc}
                </p>
                <p style={{ margin: "16px 0 0", fontSize: "28px", fontWeight: 800, color: colors.text }}>
                  {billingPeriod === "annual" && pricing ? (
                    <span style={{ fontSize: "20px" }}>{pricing.annualLine}</span>
                  ) : (
                    <>
                      {plan.price}
                      <span style={{ fontSize: "13px", fontWeight: 500, color: colors.textMuted }}>
                        {plan.period}
                      </span>
                    </>
                  )}
                </p>
                <ul style={{ margin: "16px 0 0", padding: 0, listStyle: "none" }}>
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        fontSize: "13px",
                        color: colors.textMuted,
                        padding: "4px 0",
                        display: "flex",
                        gap: "6px",
                      }}
                    >
                      <span style={{ color: colors.accent }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => !isCurrent && handleSelectPlan(priceId, plan.key)}
                  disabled={isCurrent || checkoutLoading === plan.key}
                  style={{
                    ...(plan.popular && !isCurrent ? primaryButton(false, false) : {}),
                    marginTop: "20px",
                    width: "100%",
                    padding: "10px 16px",
                    fontSize: "13px",
                    fontWeight: 600,
                    borderRadius: "8px",
                    cursor: isCurrent ? "default" : checkoutLoading === plan.key ? "wait" : "pointer",
                    fontFamily,
                    opacity: isCurrent ? 0.6 : checkoutLoading !== null && checkoutLoading !== plan.key ? 0.6 : 1,
                    background: isCurrent
                      ? "#E5E7EB"
                      : plan.popular
                        ? colors.accent
                        : "transparent",
                    color: isCurrent ? colors.textMuted : plan.popular ? "#FFFFFF" : colors.accent,
                    border: isCurrent ? "1px solid #E5E7EB" : plan.popular ? "none" : `1.5px solid ${colors.accent}`,
                  }}
                >
                  {isCurrent
                    ? "Plan actuel"
                    : checkoutLoading === plan.key
                      ? "Redirection…"
                      : "Passer à ce plan"}
                </button>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB: Notifications ── */}
      {activeTab === "notifications" && (
        <div style={{ ...cardBase, padding: cardPadding }}>
          <p style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 700, color: colors.text }}>
            Alertes & automatisations
          </p>
          <p style={{ margin: "0 0 8px", fontSize: "13px", color: colors.textMuted }}>
            Configure comment LeadHunter te contacte.
          </p>
          {renderToggleRow(
            "Alertes email",
            "Reçois un email quand un lead chaud est détecté",
            emailAlerts,
            setEmailAlerts
          )}
          {emailAlerts && (
            <div style={{ padding: "0 0 16px", borderBottom: "1px solid #F3F4F6" }}>
              <p style={{ margin: "0 0 8px", fontSize: "13px", color: colors.textMuted }}>
                Les alertes seront envoyées à{" "}
                <strong style={{ color: colors.text }}>{alertEmail || userEmail}</strong>
              </p>
              <label style={labelStyle}>Email d&apos;alerte (optionnel)</label>
              <input
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                placeholder={userEmail}
                style={inputStyle}
              />
            </div>
          )}
          {renderToggleRow(
            "Alertes Slack",
            "Envoie les leads directement dans ton canal Slack",
            slackAlerts,
            setSlackAlerts
          )}
          {slackAlerts && (
            <div style={{ padding: "0 0 16px", borderBottom: "1px solid #F3F4F6" }}>
              <label style={labelStyle}>URL du webhook Slack</label>
              <input
                type="url"
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                placeholder="https://hooks.slack.com/services/…"
                style={{ ...inputStyle, marginBottom: "10px" }}
              />
              <button
                type="button"
                disabled={slackTesting || !slackWebhook.trim()}
                onClick={async () => {
                  setSlackTesting(true);
                  const res = await fetch("/api/slack-test", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ webhookUrl: slackWebhook }),
                  });
                  const data = await res.json();
                  setToast(
                    res.ok ? "Message de test envoyé sur Slack ✓" : data.error || "Échec du test"
                  );
                  setSlackTesting(false);
                }}
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: colors.card,
                  border: `1px solid ${colors.accent}`,
                  color: colors.accent,
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontFamily,
                }}
              >
                {slackTesting ? "Test…" : "Tester la connexion"}
              </button>
            </div>
          )}
          {renderToggleRow(
            "Scan automatique",
            `Lance un scan Reddit chaque jour à ${autoScanHour}h`,
            autoScan,
            setAutoScan
          )}
          {autoScan && (
            <div style={{ padding: "0 0 16px", borderBottom: "1px solid #F3F4F6" }}>
              <label style={labelStyle}>Heure du scan quotidien</label>
              <select
                value={autoScanHour}
                onChange={(e) => setAutoScanHour(Number(e.target.value))}
                style={inputStyle}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>
          )}
          {renderToggleRow(
            "Résumé hebdomadaire",
            "Reçois un digest de tes performances chaque lundi",
            weeklyDigest,
            setWeeklyDigest
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
            onMouseEnter={() => setSaveHover(true)}
            onMouseLeave={() => setSaveHover(false)}
            style={{
              ...primaryButton(saveHover, saving || !isDirty),
              marginTop: "20px",
              width: btnWidth,
              minWidth: btnMinWidth,
              padding: "12px 28px",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {saving && (
              <span
                style={{
                  width: "14px",
                  height: "14px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            )}
            {saving ? "Sauvegarde…" : "Sauvegarder"}
          </button>
        </div>
      )}

      {/* ── TAB: Compte ── */}
      {activeTab === "account" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ ...cardBase, padding: cardPadding }}>
            <p style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700, color: colors.text }}>
              Informations du compte
            </p>
            <p style={{ margin: "12px 0 0", fontSize: "14px", color: colors.textMuted }}>
              Email connecté
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 600, color: colors.text }}>
              {userEmail || "—"}
            </p>
          </div>

          <div style={{ ...cardBase, padding: cardPadding }}>
            <p style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700, color: colors.text }}>
              Sécurité
            </p>
            <button
              type="button"
              onClick={async () => {
                if (!userEmail) return;
                const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
                  redirectTo: `${window.location.origin}/login`,
                });
                setToast(
                  error
                    ? "Erreur : " + error.message
                    : "Email de réinitialisation envoyé à votre adresse"
                );
              }}
              style={{
                marginTop: "12px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 600,
                color: colors.accent,
                background: colors.card,
                border: `1px solid ${colors.accent}`,
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily,
              }}
            >
              Changer mon mot de passe
            </button>
          </div>

          {stripeCustomerId && (
            <div style={{ ...cardBase, padding: cardPadding }}>
              <p style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700, color: colors.text }}>
                Facturation
              </p>
              {billingName && (
                <p style={{ margin: "8px 0 0", fontSize: "14px", color: colors.text }}>
                  {billingName}
                </p>
              )}
              {billingAddress && (
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: colors.textMuted }}>
                  {billingAddress}
                </p>
              )}
              <button
                type="button"
                onClick={async () => {
                  const res = await fetch("/api/stripe/billing-portal", { method: "POST" });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                  else setToast(data.error || "Portail indisponible");
                }}
                style={{
                  marginTop: "16px",
                  padding: "10px 20px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: colors.accent,
                  background: "transparent",
                  border: `1px solid ${colors.accent}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontFamily,
                }}
              >
                Gérer ma facturation
              </button>
            </div>
          )}

          <div
            style={{
              ...cardBase,
              padding: cardPadding,
              border: "1px solid #FECACA",
              background: "#FFFBFB",
            }}
          >
            <p style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700, color: "#DC2626" }}>
              Zone de danger
            </p>
            <p style={{ margin: "0 0 16px", fontSize: "13px", color: colors.textMuted }}>
              Actions irréversibles sur ton compte.
            </p>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: isMobile ? "100%" : "auto",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 600,
                color: colors.text,
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily,
                marginBottom: "10px",
                display: "block",
              }}
            >
              Se déconnecter
            </button>
            <button
              type="button"
              onClick={() => {
                setDeleteConfirm("");
                setDeleteModalOpen(true);
              }}
              style={{
                width: isMobile ? "100%" : "auto",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#DC2626",
                background: "transparent",
                border: "1px solid #FECACA",
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily,
              }}
            >
              Supprimer mon compte
            </button>
          </div>
        </div>
      )}

      {toast && (
        <Toast message={toast} isMobile={isMobile} onClose={() => setToast(null)} />
      )}

      {deleteModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setDeleteModalOpen(false)}
        >
          <div
            style={{
              ...cardBase,
              padding: cardPadding,
              maxWidth: "440px",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 700, color: "#DC2626" }}>
              Supprimer mon compte
            </p>
            <p style={{ margin: "0 0 16px", fontSize: "14px", color: colors.textMuted, lineHeight: 1.5 }}>
              Cette action est irréversible. Toutes vos données seront supprimées définitivement.
            </p>
            <label style={labelStyle}>
              Tapez <strong>SUPPRIMER</strong> pour confirmer
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="SUPPRIMER"
              style={{ ...inputStyle, marginBottom: "16px" }}
            />
            <div style={{ display: "flex", gap: "10px", flexDirection: isMobile ? "column" : "row" }}>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontFamily,
                }}
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={deleteConfirm !== "SUPPRIMER"}
                onClick={async () => {
                  const res = await fetch("/api/account/delete", { method: "DELETE" });
                  if (res.ok) {
                    await supabase.auth.signOut();
                    router.push("/login");
                    router.refresh();
                  } else {
                    const data = await res.json();
                    setToast(data.error || "Erreur lors de la suppression");
                    setDeleteModalOpen(false);
                  }
                }}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  background: deleteConfirm === "SUPPRIMER" ? "#DC2626" : "#FECACA",
                  color: deleteConfirm === "SUPPRIMER" ? "#fff" : "#991B1B",
                  border: "none",
                  borderRadius: "8px",
                  cursor: deleteConfirm === "SUPPRIMER" ? "pointer" : "not-allowed",
                  fontFamily,
                }}
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
