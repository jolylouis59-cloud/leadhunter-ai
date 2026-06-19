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
    padding: isMobile ? "12px 10px" : "14px 16px",
    fontSize: isMobile ? "12px" : "14px",
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

        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table
            style={{
              width: "100%",
              minWidth: isMobile ? "640px" : undefined,
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
              {ROWS.map((row) => (
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
                  <td
                    style={{
                      ...cellBase,
                      textAlign: "center",
                      color: landingColors.muted,
                      background: landingColors.white,
                    }}
                  >
                    {row.cold}
                  </td>
                  <td
                    style={{
                      ...cellBase,
                      textAlign: "center",
                      color: landingColors.muted,
                      background: landingColors.white,
                    }}
                  >
                    {row.linkedin}
                  </td>
                  <td
                    style={{
                      ...cellBase,
                      textAlign: "center",
                      color: landingColors.muted,
                      background: landingColors.white,
                    }}
                  >
                    {row.manual}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
