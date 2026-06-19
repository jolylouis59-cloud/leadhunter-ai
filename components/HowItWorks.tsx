"use client";

import { useEffect, useState } from "react";
import {
  containerStyle,
  landingColors,
  landingFont,
  sectionPadding,
  sectionTitleStyle,
} from "@/lib/landing-styles";

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
  stepLabel,
}: {
  num: string;
  title: string;
  desc: string;
  stepLabel?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        width: "100%",
        background: landingColors.white,
        border: `1px solid ${landingColors.border}`,
        borderRadius: "12px",
        padding: "32px",
        boxSizing: "border-box",
        marginBottom: stepLabel ? 32 : 0,
      }}
    >
      {stepLabel && (
        <p
          style={{
            fontSize: 12,
            color: landingColors.accent,
            fontWeight: 700,
            letterSpacing: 2,
            marginBottom: 8,
            marginTop: 0,
          }}
        >
          {stepLabel}
        </p>
      )}
      <span style={{ fontSize: "48px", fontWeight: 800, lineHeight: 1, color: landingColors.accent }}>
        {num}
      </span>
      <h3 style={{ margin: "16px 0 0", fontSize: "18px", fontWeight: 700, color: landingColors.text }}>
        {title}
      </h3>
      <p style={{ margin: "8px 0 0", fontSize: "14px", lineHeight: 1.6, color: "#6B7280" }}>{desc}</p>
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
        background: landingColors.oatmeal,
        ...sectionPadding,
        fontFamily: landingFont,
      }}
    >
      <div style={containerStyle}>
        <h2 style={{ ...sectionTitleStyle, color: landingColors.text, textAlign: "center" }}>
          Comment ça marche
        </h2>

        {isMobile ? (
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", width: "100%" }}>
            {steps.map((s, i) => (
              <StepCard key={s.num} {...s} stepLabel={`Étape ${i + 1} / 3`} />
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
            <span style={{ display: "flex", flexShrink: 0, alignItems: "center", fontSize: "24px", color: landingColors.accent }}>
              →
            </span>
            <StepCard {...steps[1]} />
            <span style={{ display: "flex", flexShrink: 0, alignItems: "center", fontSize: "24px", color: landingColors.accent }}>
              →
            </span>
            <StepCard {...steps[2]} />
          </div>
        )}
      </div>
    </section>
  );
}
