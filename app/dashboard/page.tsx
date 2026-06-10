"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LeadCard from "@/components/dashboard/LeadCard";
import ResponseModal from "@/components/dashboard/ResponseModal";
import { supabase } from "@/lib/supabase-client";
import { cardBase, colors, fontFamily, primaryButton } from "@/lib/dashboard-styles";
import type { Lead, LeadStatus } from "@/lib/types";

type FilterTab = "all" | LeadStatus;

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "new", label: "Nouveau" },
  { key: "responded", label: "Répondu" },
  { key: "ignored", label: "Ignoré" },
];

const STATS = [
  { key: "total", label: "Total leads", icon: "📊" },
  { key: "new", label: "Leads nouveaux", icon: "🆕" },
  { key: "responded", label: "Répondus", icon: "✅" },
] as const;

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [minScore, setMinScore] = useState(0);
  const [modalResponse, setModalResponse] = useState<string | null>(null);
  const [modalLeadId, setModalLeadId] = useState<string | null>(null);
  const [scanHover, setScanHover] = useState(false);

  const fetchLeads = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("user_id", user.id)
      .order("intent_score", { ascending: false });

    if (!error && data) {
      setLeads(data as Lead[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const stats = useMemo(
    () => ({
      total: leads.length,
      new: leads.filter((l) => l.status === "new").length,
      responded: leads.filter((l) => l.status === "responded").length,
    }),
    [leads]
  );

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (activeTab !== "all" && lead.status !== activeTab) return false;
      if (lead.intent_score < minScore) return false;
      return true;
    });
  }, [leads, activeTab, minScore]);

  async function handleScan() {
    setScanning(true);
    try {
      const res = await fetch("/api/scan-reddit", { method: "POST" });
      if (res.ok) await fetchLeads();
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

    await supabase
      .from("leads")
      .update({ status: "ignored" })
      .eq("id", leadId)
      .eq("user_id", user.id);

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: "ignored" as const } : l))
    );
  }

  async function handleMarkResponded(leadId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("leads")
      .update({ status: "responded" })
      .eq("id", leadId)
      .eq("user_id", user.id);

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: "responded" as const } : l))
    );
  }

  return (
    <div style={{ fontFamily }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: colors.text, margin: 0 }}>
            Tes leads
          </h1>
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
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          }}
        >
          🔍 {scanning ? "Scanning..." : "Scanner Reddit"}
        </button>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {STATS.map((stat) => (
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
              <p style={{ margin: 0, fontSize: "32px", fontWeight: 700, color: colors.text, lineHeight: 1 }}>
                {stats[stat.key]}
              </p>
              <p style={{ margin: "6px 0 0", fontSize: "13px", color: colors.textMuted }}>
                {stat.label}
              </p>
            </div>
            <span style={{ fontSize: "28px" }}>{stat.icon}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "28px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
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
                  transition: "background 150ms ease, color 150ms ease",
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
            alignItems: "center",
            gap: "12px",
            background: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: "10px",
            padding: "8px 16px",
          }}
        >
          <label htmlFor="min-score" style={{ fontSize: "13px", fontWeight: 500, color: colors.textMuted }}>
            Score minimum
          </label>
          <input
            id="min-score"
            type="range"
            min={0}
            max={100}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            style={{ width: "120px", accentColor: colors.accent }}
          />
          <span
            style={{
              minWidth: "28px",
              fontSize: "13px",
              fontWeight: 700,
              color: colors.text,
              textAlign: "right",
            }}
          >
            {minScore}
          </span>
        </div>
      </div>

      <div style={{ marginTop: "24px" }}>
        {loading ? (
          <p style={{ textAlign: "center", color: colors.textMuted, padding: "48px 0" }}>
            Chargement…
          </p>
        ) : leads.length === 0 ? (
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
              Lance ton premier scan
            </p>
            <p style={{ marginTop: "8px", marginBottom: 0, fontSize: "14px", color: colors.textMuted, maxWidth: "360px" }}>
              Scanne Reddit pour détecter les prospects qui cherchent activement une solution comme la tienne.
            </p>
            <button
              type="button"
              onClick={handleScan}
              disabled={scanning}
              onMouseEnter={() => setScanHover(true)}
              onMouseLeave={() => setScanHover(false)}
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
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              }}
            >
              🔍 {scanning ? "Scanning..." : "Scanner Reddit"}
            </button>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div
            style={{
              ...cardBase,
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0, fontSize: "14px", color: colors.textMuted }}>
              Aucun lead ne correspond à ces filtres.
            </p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onGenerate={handleGenerate}
              onIgnore={handleIgnore}
              generating={generatingId === lead.id}
            />
          ))
        )}
      </div>

      {modalResponse && modalLeadId && (
        <ResponseModal
          response={modalResponse}
          leadId={modalLeadId}
          onClose={() => {
            setModalResponse(null);
            setModalLeadId(null);
          }}
          onMarkResponded={handleMarkResponded}
        />
      )}
    </div>
  );
}
