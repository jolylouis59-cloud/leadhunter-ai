"use client";

import { useEffect, useState } from "react";
import {
  containerStyle,
  landingColors,
  landingFont,
  primaryBtnStyle,
  sectionPadding,
  sectionTitleStyle,
} from "@/lib/landing-styles";

const bullets = [
  "Posts optimisés pour Reddit, X et LinkedIn",
  "Adapté à ton produit et ta cible",
  "Calendrier de contenu suggéré par l'IA",
];

const tabs = ["Reddit", "X", "LinkedIn"];

export default function Feature2() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <section
      style={{
        ...sectionPadding,
        background: landingColors.dark,
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
          <div style={{ order: isMobile ? 2 : 1, width: "100%" }}>
            <div
              style={{
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                padding: "20px",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {tabs.map((tab) => (
                  <span
                    key={tab}
                    style={{
                      borderRadius: "8px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: tab === "Reddit" ? landingColors.accent : "transparent",
                      color: tab === "Reddit" ? landingColors.white : landingColors.muted,
                    }}
                  >
                    {tab}
                  </span>
                ))}
              </div>
              <p style={{ margin: "16px 0 0", fontSize: "12px", fontWeight: 500, color: landingColors.muted }}>
                Lundi · Post suggéré
              </p>
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  color: landingColors.white,
                }}
              >
                Voici comment j&apos;ai automatisé ma prospection B2B en 2h/semaine — sans cold
                email, sans SDR, juste en répondant aux bonnes conversations sur Reddit.
              </p>
              <a href="/login" style={{ ...primaryBtnStyle, marginTop: "20px", padding: "10px 16px", fontSize: "12px" }}>
                Générer →
              </a>
            </div>
          </div>

          <div style={{ order: isMobile ? 1 : 2, width: "100%" }}>
            <h2 style={{ ...sectionTitleStyle, color: landingColors.white }}>
              Crée du contenu qui attire des clients
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
                    color: landingColors.muted,
                  }}
                >
                  <span style={{ fontWeight: 700, color: landingColors.accent }}>✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
