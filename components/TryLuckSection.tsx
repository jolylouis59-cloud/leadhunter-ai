"use client";

import { useState } from "react";
import TryLuckModal from "@/components/TryLuckModal";
import { colors, fontFamily } from "@/lib/dashboard-styles";

export default function TryLuckSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section
        style={{
          background: colors.bg,
          padding: "64px 24px",
          fontFamily,
        }}
      >
        <div
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: "16px",
              padding: "48px 32px",
              boxShadow: "0 8px 30px rgba(31,77,58,0.08)",
            }}
          >
            <p style={{ margin: 0, fontSize: "40px", lineHeight: 1 }}>🎲</p>
            <h2
              style={{
                margin: "16px 0 12px",
                fontSize: "28px",
                fontWeight: 800,
                color: colors.text,
                letterSpacing: "-0.02em",
              }}
            >
              Tente ta chance — Gagne 1 mois offert
            </h2>
            <p
              style={{
                margin: "0 auto",
                maxWidth: "480px",
                fontSize: "15px",
                color: colors.textMuted,
                lineHeight: 1.6,
              }}
            >
              Réponds à 3 questions, on revient vers toi sous 6 à 12h
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              style={{
                marginTop: "28px",
                padding: "14px 32px",
                background: colors.accent,
                color: "#FFFFFF",
                border: "none",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily,
                boxShadow: "0 4px 14px rgba(31,77,58,0.25)",
              }}
            >
              Tenter ma chance
            </button>
          </div>
        </div>
      </section>

      <TryLuckModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
