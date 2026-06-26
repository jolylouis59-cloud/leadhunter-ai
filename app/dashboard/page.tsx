"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import FreeTrialUpgradeSection from "@/components/dashboard/FreeTrialUpgradeSection";
import LeadCard from "@/components/dashboard/LeadCard";
import LeadSkeleton from "@/components/dashboard/LeadSkeleton";
import ResponseModal from "@/components/dashboard/ResponseModal";
import Toast from "@/components/dashboard/Toast";
import {
  canGenerateAiResponse,
  canReceiveNewLeads,
  hasDashboardAccess,
  type UserAccess,
} from "@/lib/access";
import {
  FREE_TRIAL_AI_RESPONSES_LIMIT,
  FREE_TRIAL_LEADS_LIMIT,
  isFreeTrialAiLimitReached,
  isFreeTrialLeadLimitReached,
  isOnFreeTrial,
} from "@/lib/free-trial";
import { supabase } from "@/lib/supabase-client";
import { cardBase, colors, fontFamily, primaryButton } from "@/lib/dashboard-styles";
import { dedupeLeads, getLeadCreatedTimestamp, getLeadTimestamp } from "@/lib/leads-utils";
import type { Lead, LeadStatus } from "@/lib/types";

type FilterTab = "all" | LeadStatus;
type PlatformFilter = "all" | "reddit" | "x" | "linkedin";
type SortOption = "score_desc" | "score_asc" | "date_desc" | "date_asc";

const PAGE_SIZE = 20;

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "new", label: "Nouveau" },
  { key: "responded", label: "Répondu" },
  { key: "ignored", label: "Ignoré" },
];

const PLATFORM_FILTERS: { key: PlatformFilter; label: string; color: string }[] = [
  { key: "all", label: "Toutes", color: colors.accent },
  { key: "reddit", label: "Reddit", color: "#FF4500" },
  { key: "x", label: "X", color: "#2B2B2B" },
  { key: "linkedin", label: "LinkedIn", color: "#0A66C2" },
];

function countInWeek(leads: Lead[], weeksAgo: number): number {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const end = now - weeksAgo * weekMs;
  const start = end - weekMs;
  return leads.filter((l) => {
    const t = getLeadCreatedTimestamp(l);
    return t >= start && t < end;
  }).length;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  if (current === previous) return null;
  const up = current > previous;
  return (
    <span style={{ fontSize: "12px", fontWeight: 600, color: up ? "#16a34a" : "#dc2626" }}>
      {up ? "↑" : "↓"} {Math.abs(current - previous)}
    </span>
  );
}

function dedupeLeadsByPostUrl(leads: Lead[]): Lead[] {
  return dedupeLeads(leads);
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("score_desc");
  const [minScore, setMinScore] = useState(0);
  const [page, setPage] = useState(1);
  const [modalResponse, setModalResponse] = useState<string | null>(null);
  const [modalLeadId, setModalLeadId] = useState<string | null>(null);
  const [modalLeadTitle, setModalLeadTitle] = useState("");
  const [scanHover, setScanHover] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [userAccess, setUserAccess] = useState<UserAccess>({
    plan: "free",
    trial_ends_at: null,
    is_free_trial: true,
    free_trial_leads_used: 0,
    free_trial_ai_responses_used: 0,
  });
  const [accessLoading, setAccessLoading] = useState(true);

  const dashboardAccess = hasDashboardAccess(userAccess);
  const canScanNewLeads = canReceiveNewLeads(userAccess);
  const canGenerate = canGenerateAiResponse(userAccess);
  const onFreeTrial = isOnFreeTrial(userAccess);
  const freeTrialLeadsExhausted = isFreeTrialLeadLimitReached(userAccess);
  const freeTrialAiExhausted = isFreeTrialAiLimitReached(userAccess);

  const fetchLeads = useCallback(async (options?: { silent?: boolean }): Promise<Lead[]> => {
    if (!options?.silent) {
      setLoading(true);
    }
    setFetchError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.log("LEADS ERROR: No authenticated user");
        return [];
      }

      const userId = user.id;
      console.log("USER ID:", user?.id);

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", userId)
        .order("intent_score", { ascending: false });

      console.log("LEADS DATA:", data);
      console.log("LEADS ERROR:", error);

      if (error) {
        setFetchError(error.message);
        return [];
      }

      const nextLeads = dedupeLeadsByPostUrl((data as Lead[]) ?? []);
      setLeads(nextLeads);
      return nextLeads;
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Erreur réseau");
      return [];
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    async function loadAccess() {
      setAccessLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setUserAccess({
            plan: "free",
            trial_ends_at: null,
            is_free_trial: true,
            free_trial_leads_used: 0,
            free_trial_ai_responses_used: 0,
          });
          return;
        }

        const { data } = await supabase
          .from("user_configs")
          .select(
            "plan, trial_ends_at, is_free_trial, free_trial_leads_used, free_trial_ai_responses_used"
          )
          .eq("user_id", user.id)
          .maybeSingle();

        setUserAccess({
          plan: data?.plan ?? "free",
          trial_ends_at: data?.trial_ends_at ?? null,
          is_free_trial: data?.is_free_trial,
          free_trial_leads_used: data?.free_trial_leads_used ?? 0,
          free_trial_ai_responses_used: data?.free_trial_ai_responses_used ?? 0,
        });
      } finally {
        setAccessLoading(false);
      }
    }

    loadAccess();
  }, []);

  const stats = useMemo(() => {
    const now = Date.now();
    const total = leads.length;
    const newLast24h = leads.filter((l) => {
      const t = getLeadCreatedTimestamp(l);
      return t > 0 && t >= now - DAY_MS;
    }).length;
    const responded = leads.filter((l) => l.status === "responded").length;
    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
    const leadsThisWeek = leads.filter((l) => {
      const t = getLeadCreatedTimestamp(l);
      return t > 0 && t >= now - WEEK_MS;
    }).length;
    const respondedThisWeek = countInWeek(
      leads.filter((l) => l.status === "responded"),
      0
    );
    const respondedLastWeek = countInWeek(
      leads.filter((l) => l.status === "responded"),
      1
    );
    return {
      total,
      newLast24h,
      responded,
      responseRate,
      leadsThisWeek,
      respondedThisWeek,
      respondedLastWeek,
    };
  }, [leads]);

  const topLeadsToday = useMemo(() => {
    const cutoff = Date.now() - DAY_MS;
    const recent = leads.filter((l) => {
      const t = getLeadCreatedTimestamp(l);
      return t > 0 && t >= cutoff;
    });
    return dedupeLeads(recent).slice(0, 3);
  }, [leads]);

  const filteredLeads = useMemo(() => {
    let result = leads.filter((lead) => {
      if (activeTab !== "all" && lead.status !== activeTab) return false;
      if (lead.intent_score < minScore) return false;
      if (platformFilter !== "all" && (lead.platform ?? "reddit").toLowerCase() !== platformFilter)
        return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "score_asc":
          return a.intent_score - b.intent_score;
        case "date_desc":
          return getLeadTimestamp(b) - getLeadTimestamp(a);
        case "date_asc":
          return getLeadTimestamp(a) - getLeadTimestamp(b);
        default:
          return b.intent_score - a.intent_score;
      }
    });

    return result;
  }, [leads, activeTab, minScore, platformFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));
  const paginatedLeads = filteredLeads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allPageLeadsProcessed =
    paginatedLeads.length > 0 &&
    paginatedLeads.every((l) => l.status === "responded" || l.status === "ignored");

  useEffect(() => {
    setPage(1);
  }, [activeTab, platformFilter, sortBy, minScore]);

  async function handleScan() {
    if (!canScanNewLeads) {
      setToast({
        message: `Limite essai gratuit atteinte (${FREE_TRIAL_LEADS_LIMIT} leads). Passe à un plan pour continuer.`,
        type: "error",
      });
      return;
    }

    setScanning(true);
    setToast({ message: "Scan en cours sur Reddit… cela peut prendre 15-30 secondes", type: "info" });

    const countBefore = leads.length;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("SCAN USER ID:", user?.id);

      const res = await fetch("/api/scan-reddit", {
        method: "POST",
        credentials: "include",
      });
      const result = await res.json();

      if (!res.ok) {
        const errorMessage =
          result.error === "Reddit API non configurée"
            ? "Reddit API non configurée — Configure tes credentials Reddit dans les paramètres"
            : result.error || "Erreur lors du scan Reddit";
        setToast({
          message: errorMessage,
          type: "error",
        });
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
      const refreshed = await fetchLeads({ silent: true });

      setTimeout(() => {
        void fetchLeads({ silent: true });
      }, 3000);

      const inserted =
        typeof result.leads_inserted === "number"
          ? result.leads_inserted
          : Math.max(0, refreshed.length - countBefore);

      if (result.free_trial_limit_reached) {
        setToast({
          message: `Limite essai gratuit atteinte (${FREE_TRIAL_LEADS_LIMIT} leads cumulés)`,
          type: "info",
        });
      } else if (inserted > 0) {
        setToast({ message: `${inserted} nouveaux leads trouvés !`, type: "success" });
      } else {
        setToast({ message: "Aucun nouveau lead cette fois", type: "info" });
      }

      const { data: accessRow } = await supabase
        .from("user_configs")
        .select("plan, trial_ends_at, is_free_trial, free_trial_leads_used, free_trial_ai_responses_used")
        .eq("user_id", user?.id ?? "")
        .maybeSingle();

      if (accessRow) {
        setUserAccess({
          plan: accessRow.plan ?? "free",
          trial_ends_at: accessRow.trial_ends_at ?? null,
          is_free_trial: accessRow.is_free_trial,
          free_trial_leads_used: accessRow.free_trial_leads_used ?? 0,
          free_trial_ai_responses_used: accessRow.free_trial_ai_responses_used ?? 0,
        });
      }
    } catch (e) {
      setToast({
        message: "Erreur scan: " + (e instanceof Error ? e.message : String(e)),
        type: "error",
      });
    } finally {
      setScanning(false);
    }
  }

  async function handleGenerate(leadId: string) {
    if (!canGenerate) {
      setToast({
        message: freeTrialAiExhausted
          ? `Limite essai gratuit atteinte (${FREE_TRIAL_AI_RESPONSES_LIMIT} réponses IA). Passe à un plan pour continuer.`
          : "Abonnement ou essai actif requis pour générer une réponse IA",
        type: "error",
      });
      return;
    }

    setGeneratingId(leadId);
    try {
      const res = await fetch("/api/generate-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId }),
      });
      const data = await res.json();
      if (res.ok && data.response) {
        const lead = leads.find((l) => l.id === leadId);
        setModalLeadTitle(lead?.post_title ?? lead?.title ?? "Lead");
        setModalResponse(data.response);
        setModalLeadId(leadId);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: accessRow } = await supabase
            .from("user_configs")
            .select(
              "plan, trial_ends_at, is_free_trial, free_trial_leads_used, free_trial_ai_responses_used"
            )
            .eq("user_id", user.id)
            .maybeSingle();
          if (accessRow) {
            setUserAccess({
              plan: accessRow.plan ?? "free",
              trial_ends_at: accessRow.trial_ends_at ?? null,
              is_free_trial: accessRow.is_free_trial,
              free_trial_leads_used: accessRow.free_trial_leads_used ?? 0,
              free_trial_ai_responses_used: accessRow.free_trial_ai_responses_used ?? 0,
            });
          }
        }
      } else if (res.status === 403) {
        setToast({
          message: data.error || "Abonnement ou essai actif requis",
          type: "error",
        });
      }
    } finally {
      setGeneratingId(null);
    }
  }

  async function handleIgnore(leadId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("leads").update({ status: "ignored" }).eq("id", leadId).eq("user_id", user.id);
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: "ignored" as const } : l))
    );
  }

  async function handleMarkResponded(leadId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("leads").update({ status: "responded" }).eq("id", leadId).eq("user_id", user.id);
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: "responded" as const } : l))
    );
  }

  function renderPaywallState() {
    return (
      <div
        style={{
          ...cardBase,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "64px 24px",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: "48px", lineHeight: 1 }}>🔒</span>
        <p style={{ marginTop: "20px", marginBottom: 0, fontSize: "18px", fontWeight: 700, color: colors.text }}>
          Ton essai est terminé
        </p>
        <p style={{ marginTop: "8px", marginBottom: 0, fontSize: "14px", color: colors.textMuted, maxWidth: "400px" }}>
          Choisis un plan pour voir tes leads et générer des réponses IA.
        </p>
        <Link
          href="/dashboard/settings?tab=billing"
          style={{
            ...primaryButton(false, false),
            marginTop: "24px",
            display: "inline-flex",
            alignItems: "center",
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily,
            textDecoration: "none",
          }}
        >
          Voir les plans
        </Link>
      </div>
    );
  }

  function renderEmptyState() {
    return (
      <div
        style={{
          ...cardBase,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "64px 24px",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: "48px", lineHeight: 1 }}>🎯</span>
        <p style={{ marginTop: "20px", marginBottom: 0, fontSize: "18px", fontWeight: 700, color: colors.text }}>
          Aucun lead pour l&apos;instant — Lance un scan pour trouver tes premiers prospects
        </p>
        <p style={{ marginTop: "8px", marginBottom: 0, fontSize: "14px", color: colors.textMuted, maxWidth: "360px" }}>
          Configure tes mots-clés en français dans les paramètres, puis lance un scan Reddit.
        </p>
        <button
          type="button"
          onClick={handleScan}
          disabled={scanning || !canScanNewLeads}
          style={{
            ...primaryButton(scanHover, scanning),
            marginTop: "24px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily,
          }}
        >
          {scanning ? (
            <>
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
              Scan en cours…
            </>
          ) : (
            "Scanner maintenant"
          )}
        </button>
      </div>
    );
  }

  const statCards = [
    {
      key: "total",
      label: "Total leads",
      value: stats.total,
      icon: "📊",
      sublabel: `+${stats.leadsThisWeek} cette semaine`,
    },
    {
      key: "new",
      label: "Leads nouveaux",
      value: stats.newLast24h,
      icon: "🆕",
      sublabel: "Dernières 24h",
    },
    {
      key: "responded",
      label: "Répondus",
      value: stats.responded,
      icon: "✅",
      trend: [stats.respondedThisWeek, stats.respondedLastWeek] as const,
    },
    {
      key: "rate",
      label: "Taux de réponse",
      value: `${stats.responseRate}%`,
      icon: "📈",
      sublabel: null,
    },
  ];

  return (
    <div style={{ fontFamily }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "32px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: colors.text, margin: 0 }}>Tes leads</h1>
          <p style={{ marginTop: "6px", marginBottom: 0, fontSize: "14px", color: colors.textMuted }}>
            Scanne Reddit pour trouver tes prospects
          </p>
        </div>
        <button
          type="button"
          onClick={handleScan}
          disabled={scanning || !canScanNewLeads}
          onMouseEnter={() => setScanHover(true)}
          onMouseLeave={() => setScanHover(false)}
          style={{
            ...primaryButton(scanHover, scanning),
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily,
          }}
        >
          {scanning ? (
            <>
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
              Scan en cours…
            </>
          ) : (
            <>🔍 Scanner Reddit</>
          )}
        </button>
      </header>

      {scanning && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            background: colors.card,
            border: `1px solid ${colors.accent}`,
            borderRadius: "8px",
            fontSize: "13px",
            color: colors.accent,
            fontWeight: 500,
          }}
        >
          Scan en cours sur Reddit… cela peut prendre 15-30 secondes
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {statCards.map((stat) => (
          <div
            key={stat.key}
            style={{
              ...cardBase,
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: "28px", fontWeight: 700, color: colors.text, lineHeight: 1 }}>
                {stat.value}
              </p>
              <p style={{ margin: "6px 0 0", fontSize: "13px", color: colors.textMuted }}>{stat.label}</p>
              {"sublabel" in stat && stat.sublabel && (
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: colors.accent, fontWeight: 600 }}>
                  {stat.sublabel}
                </p>
              )}
              {"trend" in stat && stat.trend && (
                <p style={{ margin: "4px 0 0", fontSize: "12px" }}>
                  <TrendBadge current={stat.trend[0]} previous={stat.trend[1]} />
                </p>
              )}
            </div>
            <span style={{ fontSize: "24px" }}>{stat.icon}</span>
          </div>
        ))}
      </div>

      {onFreeTrial && (
        <div
          style={{
            ...cardBase,
            marginBottom: "24px",
            padding: "16px 20px",
            background: freeTrialLeadsExhausted ? "#FEF2F2" : "#F0FDF4",
            border: `1px solid ${freeTrialLeadsExhausted ? "#FECACA" : "#86EFAC"}`,
          }}
        >
          <p style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: 700, color: colors.text }}>
            Essai gratuit — {userAccess.free_trial_leads_used ?? 0}/{FREE_TRIAL_LEADS_LIMIT} leads
            · {userAccess.free_trial_ai_responses_used ?? 0}/{FREE_TRIAL_AI_RESPONSES_LIMIT} réponses IA
          </p>
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
                width: `${Math.min(100, ((userAccess.free_trial_leads_used ?? 0) / FREE_TRIAL_LEADS_LIMIT) * 100)}%`,
                background: freeTrialLeadsExhausted ? "#DC2626" : colors.accent,
                borderRadius: "3px",
              }}
            />
          </div>
          {freeTrialLeadsExhausted && (
            <p style={{ margin: "10px 0 0", fontSize: "13px", color: "#B91C1C" }}>
              Limite de leads atteinte. Tes {FREE_TRIAL_LEADS_LIMIT} leads restent visibles ci-dessous.
            </p>
          )}
        </div>
      )}

      {onFreeTrial && freeTrialLeadsExhausted && (
        <FreeTrialUpgradeSection
          title="Tu as utilisé tes 15 leads offerts"
          subtitle="Passe à un plan pour continuer à recevoir de nouveaux prospects qualifiés."
        />
      )}

      {dashboardAccess && topLeadsToday.length > 0 && (
        <section
          style={{
            background: colors.accent,
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "32px",
            color: "#ffffff",
          }}
        >
          <h2 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700 }}>
            🔥 Top 3 leads du jour
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {topLeadsToday.map((lead) => {
              const title = lead.post_title ?? lead.title ?? "Sans titre";
              return (
                <div
                  key={lead.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    flexWrap: "wrap",
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    padding: "12px 16px",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        fontWeight: 600,
                        lineHeight: 1.4,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {title}
                    </p>
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: 700, flexShrink: 0 }}>
                    {lead.intent_score}/100
                  </span>
                  <button
                    type="button"
                    onClick={() => handleGenerate(lead.id)}
                    disabled={generatingId === lead.id || !canGenerate}
                    style={{
                      background: "#ffffff",
                      color: colors.accent,
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 14px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: generatingId === lead.id ? "not-allowed" : "pointer",
                      opacity: generatingId === lead.id ? 0.7 : 1,
                      fontFamily,
                      flexShrink: 0,
                    }}
                  >
                    {generatingId === lead.id ? "Génération…" : "Répondre"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                borderRadius: "20px",
                padding: "8px 18px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                background: isActive ? colors.accent : "transparent",
                color: isActive ? "#ffffff" : colors.textMuted,
                border: isActive ? "none" : `1px solid ${colors.border}`,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {PLATFORM_FILTERS.map((pf) => {
            const active = platformFilter === pf.key;
            return (
              <button
                key={pf.key}
                type="button"
                onClick={() => setPlatformFilter(pf.key)}
                style={{
                  borderRadius: "20px",
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: active ? pf.color : "transparent",
                  color: active ? "#FFFFFF" : pf.color,
                  border: `1.5px solid ${pf.color}`,
                }}
              >
                {pf.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <label style={{ fontSize: "13px", color: colors.textMuted, display: "flex", alignItems: "center", gap: "8px" }}>
            Trier par
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              style={{
                padding: "6px 10px",
                borderRadius: "8px",
                border: `1px solid ${colors.border}`,
                fontSize: "13px",
                fontFamily,
                color: colors.text,
                background: colors.card,
              }}
            >
              <option value="score_desc">Score décroissant</option>
              <option value="score_asc">Score croissant</option>
              <option value="date_desc">Date récente</option>
              <option value="date_asc">Date ancienne</option>
            </select>
          </label>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: "10px",
              padding: "6px 12px",
            }}
          >
            <label htmlFor="min-score" style={{ fontSize: "13px", color: colors.textMuted }}>
              Score min
            </label>
            <input
              id="min-score"
              type="range"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              style={{ width: "80px", accentColor: colors.accent }}
            />
            <span style={{ fontSize: "13px", fontWeight: 700, color: colors.text }}>{minScore}</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "8px" }}>
        {loading || accessLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <LeadSkeleton key={i} />
            ))}
          </>
        ) : !dashboardAccess && leads.length > 0 ? (
          renderPaywallState()
        ) : fetchError ? (
          <div style={{ ...cardBase, padding: "48px 24px", textAlign: "center" }}>
            <p style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 600, color: "#DC2626" }}>
              Impossible de charger les leads
            </p>
            <p style={{ margin: "0 0 20px", fontSize: "14px", color: colors.textMuted }}>{fetchError}</p>
            <button
              type="button"
              onClick={() => fetchLeads()}
              style={{
                ...primaryButton(false, false),
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: 600,
                fontFamily,
              }}
            >
              Réessayer
            </button>
          </div>
        ) : leads.length === 0 ? (
          renderEmptyState()
        ) : filteredLeads.length === 0 ? (
          <div style={{ ...cardBase, padding: "48px 24px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "14px", color: colors.textMuted }}>
              Aucun lead ne correspond à ces filtres.
            </p>
          </div>
        ) : (
          <>
            {allPageLeadsProcessed && (
              <div
                style={{
                  ...cardBase,
                  marginBottom: "16px",
                  padding: "16px 20px",
                  textAlign: "center",
                  background: "#ECFDF5",
                  border: "1px solid #86EFAC",
                }}
              >
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: colors.accent }}>
                  ✅ Tu as traité tous tes leads ! Reviens demain ou lance un nouveau scan.
                </p>
              </div>
            )}

            {paginatedLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onGenerate={handleGenerate}
                onIgnore={handleIgnore}
                generating={generatingId === lead.id}
                canGenerate={canGenerate}
              />
            ))}

            {filteredLeads.length > PAGE_SIZE && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "24px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: `1px solid ${colors.border}`,
                    background: colors.card,
                    cursor: page <= 1 ? "not-allowed" : "pointer",
                    opacity: page <= 1 ? 0.5 : 1,
                    fontSize: "13px",
                    fontFamily,
                  }}
                >
                  Précédent
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      border: p === page ? "none" : `1px solid ${colors.border}`,
                      background: p === page ? colors.accent : colors.card,
                      color: p === page ? "#fff" : colors.text,
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 600,
                      fontFamily,
                    }}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: `1px solid ${colors.border}`,
                    background: colors.card,
                    cursor: page >= totalPages ? "not-allowed" : "pointer",
                    opacity: page >= totalPages ? 0.5 : 1,
                    fontSize: "13px",
                    fontFamily,
                  }}
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {modalResponse && modalLeadId && (
        <ResponseModal
          response={modalResponse}
          leadTitle={modalLeadTitle}
          leadId={modalLeadId}
          onClose={() => {
            setModalResponse(null);
            setModalLeadId(null);
            setModalLeadTitle("");
          }}
          onMarkResponded={handleMarkResponded}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={toast.type === "info" && scanning ? 30000 : 4000}
        />
      )}
    </div>
  );
}
