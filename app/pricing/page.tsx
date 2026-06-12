import Link from "next/link";

const colors = {
  bg: "#F3EDE2",
  text: "#2B2B2B",
  textMuted: "#6B7280",
  accent: "#1F4D3A",
  card: "#FFFFFF",
  border: "#E5E7EB",
};

export default function PricingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
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
          padding: "40px 32px",
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <p style={{ margin: 0, fontSize: "40px" }}>💳</p>
        <h1
          style={{
            margin: "16px 0 8px",
            fontSize: "24px",
            fontWeight: 700,
            color: colors.text,
          }}
        >
          Paiement annulé
        </h1>
        <p style={{ margin: 0, fontSize: "14px", color: colors.textMuted, lineHeight: 1.6 }}>
          Tu n&apos;as pas été débité. Tu peux choisir un plan à tout moment depuis tes
          paramètres.
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginTop: "28px",
          }}
        >
          <Link
            href="/dashboard/settings"
            style={{
              display: "block",
              padding: "12px 20px",
              background: colors.accent,
              color: "#FFFFFF",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Retour aux paramètres
          </Link>
          <Link
            href="/#pricing"
            style={{
              display: "block",
              padding: "12px 20px",
              background: "transparent",
              color: colors.accent,
              border: `1.5px solid ${colors.accent}`,
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Voir les tarifs
          </Link>
        </div>
      </div>
    </div>
  );
}
