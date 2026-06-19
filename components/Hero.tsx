"use client";

import { useEffect, useState } from "react";
import EmailForm from "./EmailForm";
import Logo from "./Logo";
import RedditLogo from "./RedditLogo";
import UserCount from "./UserCount";
import LiveLeadTicker from "./LiveLeadTicker";
import { headlineStyle, landingColors, landingFont } from "@/lib/landing-styles";

export default function Hero() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsDesktop(w >= 1024);
      setIsMobile(w < 768);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const sectionPadding = isMobile ? "24px 16px" : "0 24px";

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        overflow: "hidden",
        background: landingColors.dark,
        paddingTop: isMobile ? "88px" : "100px",
        paddingBottom: isMobile ? "48px" : "80px",
        paddingLeft: isMobile ? "16px" : 0,
        paddingRight: isMobile ? "16px" : 0,
        fontFamily: landingFont,
      }}
    >
      <style>{`
        @keyframes hero-particle-pulse {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.6); }
        }
        @keyframes hero-pulse-arrow {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(4px); opacity: 1; }
        }
        @keyframes hero-pulse-amber {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          50% { box-shadow: 0 0 0 6px rgba(245, 158, 11, 0); }
        }
      `}</style>

      {[
        { top: "18%", left: "12%", delay: "0s" },
        { top: "32%", left: "28%", delay: "0.8s" },
        { top: "22%", left: "45%", delay: "1.6s" },
        { top: "38%", left: "8%", delay: "2.2s" },
      ].map((p, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            top: p.top,
            left: p.left,
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: landingColors.accent,
            boxShadow: `0 0 20px ${landingColors.accent}`,
            animation: `hero-particle-pulse 3.5s ease-in-out infinite`,
            animationDelay: p.delay,
            pointerEvents: "none",
          }}
        />
      ))}

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: sectionPadding, boxSizing: "border-box" }}>
        <div
          style={{
            display: "flex",
            flexDirection: isDesktop ? "row" : "column",
            gap: isDesktop ? "64px" : "32px",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", zIndex: 1, minWidth: 0, width: "100%" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "999px",
                border: `1px solid rgba(31, 77, 58, 0.4)`,
                background: "rgba(31, 77, 58, 0.15)",
                padding: "6px 16px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: landingColors.accent,
                }}
              />
              <span style={{ fontSize: "13px", fontWeight: 600, color: landingColors.accent }}>
                🔥 +47 entrepreneurs ont rejoint cette semaine
              </span>
            </div>

            <h1
              style={{
                ...headlineStyle,
                fontSize: isMobile ? "clamp(2rem, 8vw, 3.5rem)" : headlineStyle.fontSize,
                marginTop: "24px",
                color: landingColors.white,
              }}
            >
              Trouve tes clients B2B sans prospecter.
            </h1>

            <p
              style={{
                margin: "24px 0 0",
                maxWidth: "520px",
                fontSize: isMobile ? "16px" : "18px",
                lineHeight: 1.55,
                color: landingColors.muted,
              }}
            >
              On scanne Reddit, X et LinkedIn 24h/24. Tu reçois les prospects chauds directement
              dans ton dashboard. Moins de 15 minutes par jour.
            </p>

            <div style={{ marginTop: "32px", maxWidth: "520px" }}>
              <EmailForm buttonLabel="Voir mes premiers leads →" variant="hero-dark" />
            </div>

            <LiveLeadTicker />
            <UserCount />
          </div>

          <div style={{ minWidth: 0, width: "100%" }}>
            <HeroMockup compact={isMobile} />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMockup({ compact }: { compact?: boolean }) {
  return (
    <div
      style={{
        borderRadius: "16px",
        background: "#F8F9FA",
        padding: compact ? "20px" : "24px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          borderRadius: "12px",
          border: `1px solid ${landingColors.border}`,
          background: landingColors.white,
          padding: compact ? "16px" : "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <RedditLogo size={24} />
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#4B5563" }}>r/SaaS</span>
          </div>
          <span
            style={{
              borderRadius: "999px",
              background: "#FEF3C7",
              padding: "2px 10px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#B45309",
              animation: "hero-pulse-amber 2s ease-in-out infinite",
            }}
          >
            Intent 94%
          </span>
        </div>
        <p style={{ margin: "16px 0 0", fontSize: "14px", lineHeight: 1.6, color: "#4B5563" }}>
          Je cherche un outil de prospection B2B qui trouve mes clients sur Reddit automatiquement.
          Des alternatives à Octolens ?
        </p>
      </div>

      <div
        style={{
          margin: "16px 0",
          textAlign: "center",
          fontSize: "20px",
          color: landingColors.accent,
          animation: "hero-pulse-arrow 2s ease-in-out infinite",
        }}
      >
        ↓
      </div>

      <div
        style={{
          borderRadius: "12px",
          border: `1px solid ${landingColors.border}`,
          background: landingColors.white,
          padding: compact ? "16px" : "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Logo size={22} showText={false} />
          <span style={{ fontSize: "12px", fontWeight: 500, color: "#6B7280" }}>
            Réponse IA générée
          </span>
        </div>
        <p style={{ margin: "12px 0 0", fontSize: "14px", lineHeight: 1.6, color: "#374151" }}>
          Salut ! LeadHunter scanne Reddit 24/7 et t&apos;alerte dès qu&apos;un prospect cherche ta
          solution. Essai gratuit — réponse prête en 1 clic.
        </p>
        <span
          style={{
            display: "inline-block",
            marginTop: "12px",
            borderRadius: "999px",
            background: "#DCFCE7",
            padding: "4px 12px",
            fontSize: "12px",
            fontWeight: 700,
            color: landingColors.accent,
          }}
        >
          Prêt à envoyer ✓
        </span>
      </div>
    </div>
  );
}
