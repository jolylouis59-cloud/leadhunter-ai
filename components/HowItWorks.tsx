"use client";

import { useEffect, useState } from "react";
import { colors, fontFamily } from "@/lib/dashboard-styles";

const steps = [
  {
    num: "01",
    title: "Tu décris ton produit",
    desc: "2 minutes, tu dis ce que tu vends et à qui tu t'adresses.",
  },
  {
    num: "02",
    title: "L'IA scanne pour toi",
    desc: "24h/24 sur Reddit, X et LinkedIn. Chaque post est scoré.",
  },
  {
    num: "03",
    title: "Tu closes",
    desc: "Réponds aux leads chauds, publie ton contenu en 1 clic.",
  },
];

function StepCard({
  num,
  title,
  desc,
  mobile,
}: {
  num: string;
  title: string;
  desc: string;
  mobile?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: mobile ? "0 0 auto" : 1,
        minWidth: mobile ? "80vw" : undefined,
        scrollSnapAlign: mobile ? "center" : undefined,
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: "12px",
        padding: "32px",
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          fontSize: "48px",
          fontWeight: 800,
          lineHeight: 1,
          color: colors.accent,
        }}
      >
        {num}
      </span>
      <h3
        style={{
          margin: "16px 0 0",
          fontSize: "18px",
          fontWeight: 700,
          color: colors.text,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: "8px 0 0",
          fontSize: "14px",
          lineHeight: 1.6,
          color: colors.textMuted,
        }}
      >
        {desc}
      </p>
    </div>
  );
}

export default function HowItWorks() {
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
        background: colors.card,
        padding: "64px 24px",
        fontFamily,
      }}
    >
      <style>{`
        .how-it-works-slider::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h2
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 800,
            color: colors.text,
            letterSpacing: "-0.02em",
          }}
        >
          Comment ça marche
        </h2>

        {isMobile ? (
          <div
            className="how-it-works-slider"
            style={{
              marginTop: "40px",
              display: "flex",
              gap: "16px",
              overflowX: "scroll",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-x",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              padding: "4px 0 8px",
            }}
          >
            {steps.map((s) => (
              <StepCard key={s.num} {...s} mobile />
            ))}
          </div>
        ) : (
          <div
            style={{
              marginTop: "56px",
              display: "flex",
              alignItems: "stretch",
              gap: "16px",
            }}
          >
            <StepCard {...steps[0]} />
            <span
              style={{
                display: "flex",
                flexShrink: 0,
                alignItems: "center",
                fontSize: "24px",
                color: colors.accent,
              }}
            >
              →
            </span>
            <StepCard {...steps[1]} />
            <span
              style={{
                display: "flex",
                flexShrink: 0,
                alignItems: "center",
                fontSize: "24px",
                color: colors.accent,
              }}
            >
              →
            </span>
            <StepCard {...steps[2]} />
          </div>
        )}
      </div>
    </section>
  );
}
