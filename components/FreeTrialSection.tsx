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

export default function FreeTrialSection() {
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
        background: landingColors.white,
        fontFamily: landingFont,
      }}
    >
      <div style={{ ...containerStyle, textAlign: "center" }}>
        <h2
          style={{
            ...sectionTitleStyle,
            color: landingColors.text,
          }}
        >
          Essai gratuit 7 jours — Aucune carte bancaire requise
        </h2>
        <p
          style={{
            margin: "16px auto 0",
            maxWidth: "520px",
            fontSize: "16px",
            lineHeight: 1.6,
            color: landingColors.muted,
          }}
        >
          Tu configures en 2 minutes. Les premiers leads arrivent dans l&apos;heure.
        </p>
        <a
          href="/login"
          style={{
            ...primaryBtnStyle,
            marginTop: "28px",
            padding: isMobile ? "14px 28px" : "16px 32px",
            fontSize: "15px",
          }}
        >
          Commencer gratuitement →
        </a>
      </div>
    </section>
  );
}
