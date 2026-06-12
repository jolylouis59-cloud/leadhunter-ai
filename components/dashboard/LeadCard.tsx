"use client";

import { useState } from "react";
import { formatRelativeTime } from "@/lib/format-relative";
import { colors, fontFamily, intentColor, primaryButton } from "@/lib/dashboard-styles";
import type { Lead } from "@/lib/types";

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

  const meta = [
    lead.subreddit ? `r/${lead.subreddit}` : null,
    displayAuthor ? `u/${displayAuthor}` : null,
    formatRelativeTime(lead.post_created_at),
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
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              display: "inline-block",
              backgroundColor: colors.reddit,
              color: "#ffffff",
              borderRadius: "999px",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            Reddit
          </span>

          <h3
            style={{
              marginTop: "12px",
              marginBottom: 0,
              fontSize: "15px",
              fontWeight: 700,
              color: colors.text,
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {displayTitle}
          </h3>

          <p style={{ marginTop: "8px", marginBottom: 0, fontSize: "13px", color: colors.textMuted }}>
            {meta}
          </p>
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
          <span style={{ marginTop: "2px", fontSize: "9px", fontWeight: 600, color: colors.textMuted, letterSpacing: "0.02em" }}>
            Intent
          </span>
        </div>
      </div>

      <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
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
