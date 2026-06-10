"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { cardBase, colors, fontFamily, primaryButton } from "@/lib/dashboard-styles";

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
  "prospection B2B",
  "lead generation",
  "find clients",
  "growth hacking",
  "cold outreach",
];

const DEFAULT_SUBREDDITS = [
  "SaaS",
  "entrepreneur",
  "startups",
  "marketing",
  "Entrepreneur_Ride_Along",
];

const PLANS = [
  {
    name: "Starter",
    price: "49€",
    period: "/mois",
    desc: "Pour les solopreneurs",
    features: ["300 leads/mois", "Reddit + X + LinkedIn", "Intent Score IA"],
    popular: false,
  },
  {
    name: "Growth",
    price: "99€",
    period: "/mois",
    desc: "Pour scaler ton acquisition",
    features: ["1000 leads/mois", "Content Studio", "Alertes Slack + email"],
    popular: true,
  },
  {
    name: "Agency",
    price: "199€",
    period: "/mois",
    desc: "Pour les agences",
    features: ["Leads illimités", "5 workspaces", "API access"],
    popular: false,
  },
];

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
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("scanner");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveHover, setSaveHover] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [productDesc, setProductDesc] = useState("");
  const [target, setTarget] = useState("");
  const [keywords, setKeywords] = useState<string[]>(DEFAULT_KEYWORDS);
  const [subreddits, setSubreddits] = useState<string[]>(DEFAULT_SUBREDDITS);
  const [keywordInput, setKeywordInput] = useState("");
  const [subredditInput, setSubredditInput] = useState("");

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  const [userEmail, setUserEmail] = useState("");

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

      const { data, error } = await supabase
        .from("user_configs")
        .select("product_description, target, keywords, subreddits")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data) {
        if (data.product_description) setProductDesc(data.product_description);
        if (data.target) setTarget(data.target);
        if (data.keywords?.length) setKeywords(data.keywords);
        if (data.subreddits?.length) setSubreddits(data.subreddits);
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

  function addKeyword() {
    const value = keywordInput.trim();
    if (!value || keywords.includes(value)) return;
    setKeywords((prev) => [...prev, value]);
    setKeywordInput("");
  }

  function addSubreddit() {
    const value = subredditInput.trim().replace(/^r\//, "");
    if (!value || subreddits.includes(value)) return;
    setSubreddits((prev) => [...prev, value]);
    setSubredditInput("");
  }

  async function handleSave() {
    console.log("handleSave called");
    setSaving(true);

    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { error } = await supabase.from("user_configs").upsert(
      {
        user_id: userId,
        product_description: productDesc,
        target: target,
        keywords: keywords,
        subreddits: subreddits,
      },
      { onConflict: "user_id" }
    );

    setSaving(false);

    if (error) {
      console.error("Erreur save:", error);
      setToast("Erreur : " + error.message);
    } else {
      setToast("✅ Config sauvegardée !");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
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
            <p style={{ margin: 0, fontSize: "13px", color: colors.textMuted }}>
              Ces infos sont utilisées par Claude pour scorer l&apos;intention d&apos;achat sur Reddit.
            </p>
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
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            onMouseEnter={() => setSaveHover(true)}
            onMouseLeave={() => setSaveHover(false)}
            style={{
              ...primaryButton(saveHover, saving),
              width: btnWidth,
              minWidth: btnMinWidth,
              padding: "12px 28px",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily,
            }}
          >
            {saving ? "Sauvegarde…" : "Sauvegarder"}
          </button>
        </div>
      )}

      {/* ── TAB: Abonnement ── */}
      {activeTab === "billing" && (
        <div>
          <p style={{ margin: "0 0 16px", fontSize: "14px", color: colors.textMuted }}>
            Plan actuel : <strong style={{ color: colors.text }}>Essai gratuit</strong>
          </p>
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
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                style={{
                  ...cardBase,
                  padding: cardPadding,
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
                <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: colors.text }}>
                  {plan.name}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: colors.textMuted }}>
                  {plan.desc}
                </p>
                <p style={{ margin: "16px 0 0", fontSize: "28px", fontWeight: 800, color: colors.text }}>
                  {plan.price}
                  <span style={{ fontSize: "13px", fontWeight: 500, color: colors.textMuted }}>
                    {plan.period}
                  </span>
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
                  style={{
                    ...(plan.popular ? primaryButton(false, false) : {}),
                    marginTop: "20px",
                    width: "100%",
                    padding: "10px 16px",
                    fontSize: "13px",
                    fontWeight: 600,
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontFamily,
                    background: plan.popular ? colors.accent : "transparent",
                    color: plan.popular ? "#FFFFFF" : colors.accent,
                    border: plan.popular ? "none" : `1.5px solid ${colors.accent}`,
                  }}
                >
                  Essayer 7 jours gratuits
                </button>
              </div>
            ))}
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
          {renderToggleRow(
            "Alertes Slack",
            "Envoie les leads directement dans ton canal Slack",
            slackAlerts,
            setSlackAlerts
          )}
          {renderToggleRow(
            "Scan automatique",
            "Lance un scan Reddit chaque jour à 8h",
            autoScan,
            setAutoScan
          )}
          {renderToggleRow(
            "Résumé hebdomadaire",
            "Reçois un digest de tes performances chaque lundi",
            weeklyDigest,
            setWeeklyDigest
          )}
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
              onClick={() => setToast("Contacte le support pour supprimer ton compte.")}
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
    </div>
  );
}
