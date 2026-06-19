"use client";

import { useEffect, useState } from "react";
import RedditLogo from "./RedditLogo";
import {
  containerStyle,
  landingColors,
  landingFont,
  sectionPadding,
  sectionTitleStyle,
} from "@/lib/landing-styles";

const bullets = [
  "Scan Reddit, X, LinkedIn avec tes keywords",
  "Intent Score IA 0-100 sur chaque post",
  "Réponse personnalisée en 1 clic",
];

export default function Feature1() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <section
      id="fonctionnalites"
      style={{
        ...sectionPadding,
        background: landingColors.white,
        fontFamily: landingFont,
      }}
    >
      <div style={containerStyle}>
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? "40px" : "64px",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ ...sectionTitleStyle, color: landingColors.text }}>
              Trouve les prospects qui cherchent ce que tu vends
            </h2>
            <ul style={{ margin: "32px 0 0", padding: 0, listStyle: "none" }}>
              {bullets.map((b) => (
                <li
                  key={b}
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                    marginBottom: "16px",
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#6B7280",
                  }}
                >
                  <span style={{ fontWeight: 700, color: landingColors.accent }}>✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div
            style={{
              borderRadius: "12px",
              border: `1px solid ${landingColors.border}`,
              background: landingColors.white,
              padding: "20px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "16px",
                borderBottom: `1px solid ${landingColors.border}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <RedditLogo size={22} />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#C2410C" }}>Reddit</span>
              </div>
              <span
                style={{
                  borderRadius: "999px",
                  background: "#FEF3C7",
                  padding: "2px 10px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#B45309",
                }}
              >
                Intent 94%
              </span>
            </div>
            <p style={{ margin: "16px 0 0", fontSize: "14px", lineHeight: 1.6, color: "#6B7280" }}>
              &ldquo;Je cherche un outil de prospection B2B qui trouve mes clients sur Reddit
              automatiquement. Des alternatives à Octolens ?&rdquo;
            </p>
            <a
              href="/login"
              style={{
                display: "inline-block",
                marginTop: "20px",
                fontSize: "14px",
                fontWeight: 600,
                color: landingColors.accent,
                textDecoration: "none",
              }}
            >
              Voir la réponse IA →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
