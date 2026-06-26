"use client";

import Link from "next/link";
import { colors, fontFamily } from "@/lib/dashboard-styles";

export default function LaunchOffer() {
  return (
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
            boxShadow: "0 4px 20px rgba(31,77,58,0.06)",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              fontSize: "13px",
              fontWeight: 600,
              color: colors.accent,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Offre de lancement
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "17px",
              lineHeight: 1.65,
              color: colors.text,
              fontWeight: 500,
            }}
          >
            Pendant notre phase de lancement, les 50 premiers inscrits bénéficient d&apos;un mois
            offert. Aucune carte bancaire requise.
          </p>
          <Link
            href="/login"
            style={{
              display: "inline-block",
              marginTop: "28px",
              padding: "14px 32px",
              background: colors.accent,
              color: "#FFFFFF",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(31,77,58,0.25)",
            }}
          >
            Essai gratuit — 15 leads
          </Link>
        </div>
      </div>
    </section>
  );
}
