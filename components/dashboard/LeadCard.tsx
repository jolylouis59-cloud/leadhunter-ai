"use client";

import { useState } from "react";
import { formatLeadRelative } from "@/lib/format-relative";
import { colors, fontFamily, intentColor, primaryButton } from "@/lib/dashboard-styles";
import type { Lead } from "@/lib/types";

const PLATFORM_STYLES: Record<string, { label: string; bg: string }> = {
  reddit: { label: "Reddit", bg: colors.reddit },
  x: { label: "X", bg: "#2B2B2B" },
  linkedin: { label: "LinkedIn", bg: "#0A66C2" },
};

type LeadCardProps = {
  lead: Lead;
  onGenerate: (leadId: string) => void;
  onIgnore: (leadId: string) => void;
  generating: boolean;
};

export default function LeadCard({
  lead,
  onGenerate,
  onIgnore,
  generating,
}: LeadCardProps) {
  const [hovered, setHovered] = useState(false);
  const [genHover, setGenHover] = useState(false);
  const [ignoreHover, setIgnoreHover] = useState(false);

  const scoreColor = intentColor(lead.intent_score);
  const displayTitle = lead.post_title ?? lead.title ?? "";
  const displayAuthor = lead.author ?? lead.username;
  const platform = (lead.platform ?? "reddit").toLowerCase();
  const platformStyle = PLATFORM_STYLES[platform] ?? PLATFORM_STYLES.reddit;

  const bodyExcerpt = lead.post_body
    ? lead.post_body.length > 160
      ? lead.post_body.slice(0, 160).trim() + "…"
      : lead.post_body
    : null;

  const meta = [
    lead.subreddit ? `r/${lead.subreddit}` : null,
    displayAuthor ? `u/${displayAuthor}` : null,
    formatLeadRelative(lead),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: colors.card,
        border: `1px solid ${hovered ? colors.accent : colors.border}`,
        borderRadius: "12px",
        padding: "20px 24px",
        marginBottom: "12px",
        fontFamily,
        transition: "border-color 150ms ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              display: "inline-block",
              backgroundColor: platformStyle.bg,
              color: "#ffffff",
              borderRadius: "999px",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            {platformStyle.label}
          </span>

          {lead.intent_score >= 85 && (
            <span
              style={{
                display: "inline-block",
                marginLeft: "8px",
                backgroundColor: "#DC2626",
                color: "#ffffff",
                borderRadius: "999px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              CHAUD
            </span>
          )}

          <h3
            style={{
              marginTop: "12px",
              marginBottom: 0,
              fontSize: "15px",
              fontWeight: 700,
              color: colors.text,
              lineHeight: 1.4,
            }}
          >
            {displayTitle}
          </h3>

          {bodyExcerpt && (
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "13px",
                lineHeight: 1.55,
                color: colors.textMuted,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {bodyExcerpt}
            </p>
          )}

          <p style={{ marginTop: "8px", marginBottom: 0, fontSize: "13px", color: colors.textMuted }}>
            {meta}
          </p>

          {lead.post_url && (
            <a
              href={lead.post_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: "10px",
                fontSize: "13px",
                fontWeight: 600,
                color: colors.accent,
                textDecoration: "none",
              }}
            >
              Voir le post →
            </a>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            border: `3px solid ${scoreColor}`,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "18px", fontWeight: 700, lineHeight: 1, color: scoreColor }}>
            {lead.intent_score}
          </span>
          <span
            style={{
              marginTop: "2px",
              fontSize: "9px",
              fontWeight: 600,
              color: colors.textMuted,
              letterSpacing: "0.02em",
            }}
          >
            Intent
          </span>
        </div>
      </div>

      <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => onGenerate(lead.id)}
          disabled={generating}
          onMouseEnter={() => setGenHover(true)}
          onMouseLeave={() => setGenHover(false)}
          style={{
            ...primaryButton(genHover, generating),
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "12px 16px",
            fontSize: "13px",
            fontWeight: 600,
            fontFamily,
          }}
        >
          ✨ {generating ? "Génération…" : "Générer réponse IA"}
        </button>
        <button
          type="button"
          onClick={() => onIgnore(lead.id)}
          onMouseEnter={() => setIgnoreHover(true)}
          onMouseLeave={() => setIgnoreHover(false)}
          style={{
            background: ignoreHover ? "#F9FAFB" : "transparent",
            border: `1px solid ${colors.border}`,
            color: colors.textMuted,
            borderRadius: "8px",
            padding: "12px 16px",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 150ms ease",
          }}
        >
          Ignorer
        </button>
      </div>
    </article>
  );
}
