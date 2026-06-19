"use client";

import { useEffect, useState } from "react";
import {
  containerStyle,
  landingColors,
  landingFont,
  sectionPadding,
  sectionTitleStyle,
} from "@/lib/landing-styles";

const ROWS = [
  { feature: "Détection intention d'achat", lh: "✅" },
  { feature: "Leads chauds en temps réel", lh: "✅" },
  { feature: "Réponse IA en 1 clic", lh: "✅" },
  { feature: "Scan Reddit", lh: "✅" },
  { feature: "Sans cold email", lh: "✅" },
  { feature: "Prix d'entrée", lh: "49€/mois" },
];

const DESKTOP_ROWS = [
  { feature: "Détection intention d'achat", lh: "✅", cold: "❌", linkedin: "❌", manual: "❌" },
  { feature: "Leads chauds en temps réel", lh: "✅", cold: "❌", linkedin: "❌", manual: "❌" },
  { feature: "Réponse IA en 1 clic", lh: "✅", cold: "❌", linkedin: "❌", manual: "❌" },
  { feature: "Scan Reddit", lh: "✅", cold: "❌", linkedin: "❌", manual: "❌" },
  { feature: "Sans cold email", lh: "✅", cold: "❌", linkedin: "❌", manual: "❌" },
  {
    feature: "Prix d'entrée",
    lh: "49€/mois",
    cold: "~50-60€/mois",
    linkedin: "~35-45€/mois",
    manual: "0€ mais 20h/semaine",
  },
];

const HEADERS = [
  "Fonctionnalité",
  "LeadHunter AI",
  "Outils de cold outreach classiques",
  "Outils d'automatisation LinkedIn",
  "Prospection manuelle",
];

export default function ComparisonTable() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const cellBase = {
    padding: "14px 16px",
    fontSize: "14px",
    borderBottom: `1px solid ${landingColors.border}`,
    verticalAlign: "middle" as const,
  };

  return (
    <section
      style={{
        ...sectionPadding,
        background: landingColors.white,
        fontFamily: landingFont,
      }}
    >
      <div style={containerStyle}>
        <h2
          style={{
            ...sectionTitleStyle,
            color: landingColors.text,
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          Pourquoi LeadHunter AI ?
        </h2>

        {isMobile ? (
          <div
            style={{
              border: `1px solid ${landingColors.border}`,
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {ROWS.map((row, i) => (
              <div
                key={row.feature}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  padding: "14px 16px",
                  background: i % 2 === 0 ? landingColors.white : "#F9FAFB",
                  borderBottom: i < ROWS.length - 1 ? `1px solid ${landingColors.border}` : "none",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: 600, color: landingColors.text }}>
                  {row.feature}
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: landingColors.accent,
                    flexShrink: 0,
                  }}
                >
                  {row.lh}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: `1px solid ${landingColors.border}`,
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <thead>
                <tr>
                  {HEADERS.map((header, i) => (
                    <th
                      key={header}
                      style={{
                        ...cellBase,
                        textAlign: i === 0 ? "left" : "center",
                        fontWeight: 700,
                        background: i === 1 ? landingColors.accent : landingColors.white,
                        color: i === 1 ? landingColors.white : landingColors.text,
                        borderBottom: `2px solid ${i === 1 ? landingColors.accent : landingColors.border}`,
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DESKTOP_ROWS.map((row) => (
                  <tr key={row.feature}>
                    <td
                      style={{
                        ...cellBase,
                        fontWeight: 600,
                        color: landingColors.text,
                        background: landingColors.white,
                      }}
                    >
                      {row.feature}
                    </td>
                    <td
                      style={{
                        ...cellBase,
                        textAlign: "center",
                        fontWeight: 600,
                        background: landingColors.accent,
                        color: landingColors.white,
                      }}
                    >
                      {row.lh}
                    </td>
                    <td style={{ ...cellBase, textAlign: "center", color: landingColors.muted, background: landingColors.white }}>
                      {row.cold}
                    </td>
                    <td style={{ ...cellBase, textAlign: "center", color: landingColors.muted, background: landingColors.white }}>
                      {row.linkedin}
                    </td>
                    <td style={{ ...cellBase, textAlign: "center", color: landingColors.muted, background: landingColors.white }}>
                      {row.manual}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
