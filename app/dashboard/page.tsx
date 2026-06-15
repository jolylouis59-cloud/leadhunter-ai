"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LeadCard from "@/components/dashboard/LeadCard";
import LeadSkeleton from "@/components/dashboard/LeadSkeleton";
import ResponseModal from "@/components/dashboard/ResponseModal";
import Toast from "@/components/dashboard/Toast";
import { supabase } from "@/lib/supabase-client";
import { cardBase, colors, fontFamily, primaryButton } from "@/lib/dashboard-styles";
import { getLeadTimestamp } from "@/lib/leads-utils";
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
    const t = getLeadTimestamp(l);
    return t >= start && t < end;
  }).length;
}

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  if (current === previous) return null;
  const up = current > previous;
  return (
    <span style={{ fontSize: "12px", fontWeight: 600, color: up ? "#16a34a" : "#dc2626" }}>
      {up ? "↑" : "↓"} {Math.abs(current - previous)}
    </span>
  );
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

  const fetchLeads = useCallback(async (options?: { silent?: boolean }): Promise<Lead[]> => {
    if (!options?.silent) {
      setLoading(true);
    }
    setFetchError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id)
        .order("intent_score", { ascending: false });

      if (error) {
        setFetchError(error.message);
        return [];
      }

      const nextLeads = (data as Lead[]) ?? [];
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

  const stats = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter((l) => l.status === "new").length;
    const responded = leads.filter((l) => l.status === "responded").length;
    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
    const thisWeek = countInWeek(leads, 0);
    const lastWeek = countInWeek(leads, 1);
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
      new: newCount,
      responded,
      responseRate,
      thisWeek,
      lastWeek,
      respondedThisWeek,
      respondedLastWeek,
    };
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

  useEffect(() => {
    setPage(1);
  }, [activeTab, platformFilter, sortBy, minScore]);

  async function handleScan() {
    setScanning(true);
    setToast({ message: "Scan en cours sur Reddit… cela peut prendre 15-30 secondes", type: "info" });

    const countBefore = leads.length;

    try {
      const res = await fetch("/api/scan-reddit", { method: "POST" });
      const result = await res.json();

      if (!res.ok) {
        setToast({
          message: result.error || "Erreur lors du scan Reddit",
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
      if (inserted > 0) {
        setToast({ message: `${inserted} nouveaux leads trouvés !`, type: "success" });
      } else {
        setToast({ message: "Aucun nouveau lead cette fois", type: "info" });
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
          Aucun lead pour l&apos;instant
        </p>
        <p style={{ marginTop: "8px", marginBottom: 0, fontSize: "14px", color: colors.textMuted, maxWidth: "360px" }}>
          Lance un premier scan Reddit pour trouver tes prospects
        </p>
        <button
          type="button"
          onClick={handleScan}
          disabled={scanning}
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
    { key: "total", label: "Total leads", value: stats.total, icon: "📊", trend: [stats.thisWeek, stats.lastWeek] as const },
    { key: "new", label: "Leads nouveaux", value: stats.new, icon: "🆕", trend: null },
    { key: "responded", label: "Répondus", value: stats.responded, icon: "✅", trend: [stats.respondedThisWeek, stats.respondedLastWeek] as const },
    { key: "rate", label: "Taux de réponse", value: `${stats.responseRate}%`, icon: "📈", trend: null },
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
          disabled={scanning}
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
              {stat.trend && (
                <p style={{ margin: "4px 0 0", fontSize: "12px" }}>
                  <TrendBadge current={stat.trend[0]} previous={stat.trend[1]} />
                </p>
              )}
            </div>
            <span style={{ fontSize: "24px" }}>{stat.icon}</span>
          </div>
        ))}
      </div>

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
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <LeadSkeleton key={i} />
            ))}
          </>
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
            {paginatedLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onGenerate={handleGenerate}
                onIgnore={handleIgnore}
                generating={generatingId === lead.id}
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
