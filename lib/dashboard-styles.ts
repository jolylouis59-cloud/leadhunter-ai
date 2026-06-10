import type { CSSProperties } from "react";

export const colors = {
  sidebar: "#2B2B2B",
  bg: "#F3EDE2",
  accent: "#1F4D3A",
  accentHover: "#163d2e",
  card: "#FFFFFF",
  border: "#E5E7EB",
  text: "#2B2B2B",
  textMuted: "#6B7280",
  reddit: "#FF4500",
  scoreGreen: "#16a34a",
  scoreOrange: "#ea580c",
  scoreRed: "#dc2626",
  navInactive: "rgba(243, 237, 226, 0.7)",
  navHover: "#3a3a3a",
  oatmeal: "#F3EDE2",
};

export const fontFamily = "'Plus Jakarta Sans', sans-serif";

export function intentColor(score: number): string {
  if (score > 70) return colors.scoreGreen;
  if (score >= 40) return colors.scoreOrange;
  return colors.scoreRed;
}

export function getInitials(email: string): string {
  const part = email.split("@")[0] ?? email;
  return part.slice(0, 2).toUpperCase();
}

export const cardBase: CSSProperties = {
  background: colors.card,
  border: `1px solid ${colors.border}`,
  borderRadius: "12px",
};

export const primaryButton = (hover = false, disabled = false): CSSProperties => ({
  background: disabled ? colors.accent : hover ? colors.accentHover : colors.accent,
  color: "#ffffff",
  borderRadius: "10px",
  border: "none",
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.7 : 1,
  transition: "background 150ms ease",
});
