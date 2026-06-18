"use client";

import { colors, fontFamily } from "@/lib/dashboard-styles";

export default function StatsPage() {
  return (
    <div style={{ fontFamily }}>
      <h1 style={{ fontSize: "28px", fontWeight: 700, color: colors.text, margin: "0 0 8px" }}>
        Statistiques
      </h1>
      <p style={{ margin: "0 0 32px", fontSize: "14px", color: colors.textMuted }}>
        Analyse détaillée de tes performances de prospection
      </p>

      <div
        style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: "12px",
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: "40px", lineHeight: 1 }}>📊</span>
        <p
          style={{
            margin: "20px 0 0",
            fontSize: "18px",
            fontWeight: 700,
            color: colors.text,
          }}
        >
          Bientôt disponible
        </p>
        <p style={{ margin: "8px 0 0", fontSize: "14px", color: colors.textMuted }}>
          Les graphiques et analytics arrivent prochainement.
        </p>
      </div>
    </div>
  );
}
