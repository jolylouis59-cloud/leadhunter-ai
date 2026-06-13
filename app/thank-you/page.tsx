import Link from "next/link";
import { colors, fontFamily } from "@/lib/dashboard-styles";

export default function ThankYouPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        fontFamily,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: "16px",
          padding: "48px 40px",
          maxWidth: "520px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        <p style={{ margin: 0, fontSize: "56px", lineHeight: 1 }}>🎉</p>
        <h1
          style={{
            margin: "20px 0 12px",
            fontSize: "28px",
            fontWeight: 800,
            color: colors.text,
            letterSpacing: "-0.02em",
          }}
        >
          Merci pour ton abonnement 🎉
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: "15px",
            color: colors.textMuted,
            lineHeight: 1.6,
          }}
        >
          Ton compte est activé. Tu peux maintenant accéder à ton dashboard.
        </p>
        <Link
          href="/dashboard"
          style={{
            display: "inline-block",
            marginTop: "32px",
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
          Accéder au dashboard
        </Link>
      </div>
    </div>
  );
}
