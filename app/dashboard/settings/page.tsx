import { colors, fontFamily } from "@/lib/dashboard-styles";

export default function SettingsPage() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <h1 style={{ fontSize: "28px", fontWeight: 700, color: colors.text, margin: 0 }}>
        Paramètres
      </h1>
      <p style={{ marginTop: "6px", fontSize: "14px", color: colors.textMuted }}>
        Configure ton compte et tes préférences
      </p>
      <div
        style={{
          marginTop: "28px",
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: "12px",
          padding: "32px",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: "40px" }}>⚙️</span>
        <p style={{ marginTop: "16px", marginBottom: 0, fontSize: "16px", fontWeight: 600, color: colors.text }}>
          Bientôt disponible
        </p>
        <p style={{ marginTop: "8px", marginBottom: 0, fontSize: "14px", color: colors.textMuted }}>
          Les paramètres avancés arrivent dans une prochaine version.
        </p>
      </div>
    </div>
  );
}
