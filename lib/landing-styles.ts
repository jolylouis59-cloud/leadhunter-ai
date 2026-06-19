import type { CSSProperties } from "react";

export const landingColors = {
  dark: "#0D1117",
  text: "#2B2B2B",
  accent: "#1F4D3A",
  oatmeal: "#F3EDE2",
  muted: "#A0ADB8",
  border: "#E5E7EB",
  white: "#FFFFFF",
};

export const landingFont = '"Plus Jakarta Sans", sans-serif';

export const containerStyle: CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "0 24px",
  boxSizing: "border-box",
};

export const sectionPadding: CSSProperties = {
  padding: "60px 0",
};

export const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(2rem, 4vw, 3rem)",
  fontWeight: 800,
  letterSpacing: "-0.02em",
  fontFamily: landingFont,
};

export const headlineStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(3rem, 6vw, 5rem)",
  fontWeight: 800,
  lineHeight: 1.1,
  letterSpacing: "-0.02em",
  fontFamily: landingFont,
};

export const primaryBtnStyle: CSSProperties = {
  display: "inline-block",
  padding: "14px 24px",
  borderRadius: "12px",
  background: landingColors.accent,
  color: landingColors.white,
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: landingFont,
  transition: "transform 150ms ease, box-shadow 150ms ease",
};

export const outlineBtnStyle: CSSProperties = {
  display: "inline-block",
  padding: "14px 24px",
  borderRadius: "12px",
  background: "transparent",
  color: landingColors.accent,
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "none",
  border: `2px solid ${landingColors.accent}`,
  cursor: "pointer",
  fontFamily: landingFont,
};
