"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { colors, fontFamily } from "@/lib/dashboard-styles";

const CONSENT_KEY = "cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function saveConsent(value: "accepted" | "refused") {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentement cookies"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: "16px",
        boxSizing: "border-box",
        fontFamily,
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: "12px",
          padding: "20px 24px",
          boxShadow: "0 -4px 30px rgba(0,0,0,0.12)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <p
          style={{
            margin: 0,
            flex: "1 1 280px",
            fontSize: "13px",
            lineHeight: 1.6,
            color: colors.textMuted,
          }}
        >
          Nous utilisons des cookies pour améliorer votre expérience. En continuant, vous
          acceptez notre{" "}
          <Link href="/privacy" style={{ color: colors.accent, fontWeight: 600 }}>
            politique de confidentialité
          </Link>
          .
        </p>

        <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => saveConsent("refused")}
            style={{
              padding: "10px 20px",
              background: "#E5E7EB",
              color: colors.text,
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily,
            }}
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => saveConsent("accepted")}
            style={{
              padding: "10px 20px",
              background: colors.accent,
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily,
            }}
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
