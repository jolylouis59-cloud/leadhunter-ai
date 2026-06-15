import Link from "next/link";
import Logo from "./Logo";
import { colors, fontFamily } from "@/lib/dashboard-styles";

const navLinks = [
  { label: "Fonctionnalités", href: "/#fonctionnalites" },
  { label: "Tarification", href: "/#pricing" },
];

const legalLinks = [
  { label: "CGU", href: "/cgu" },
  { label: "Politique de confidentialité", href: "/privacy" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${colors.border}`,
        background: colors.card,
        padding: "48px 24px",
        fontFamily,
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Logo />
          <p style={{ margin: "8px 0 0", fontSize: "14px", color: colors.textMuted }}>
            Trouve tes clients. Pendant que tu dors.
          </p>
          <p style={{ margin: "16px 0 0", fontSize: "12px", color: "#9CA3AF" }}>
            © 2026 LeadHunter AI — contact@leadhunterai.fr
          </p>
          <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#9CA3AF" }}>
            (Prix HT, TVA applicable selon votre pays)
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px" }}>
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: colors.textMuted,
                textDecoration: "none",
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {legalLinks.map((l, i) => (
            <span key={l.href} style={{ display: "inline-flex", alignItems: "center" }}>
              {i > 0 && (
                <span style={{ color: colors.border, margin: "0 8px", fontSize: "13px" }}>|</span>
              )}
              <Link
                href={l.href}
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: colors.accent,
                  textDecoration: "none",
                }}
              >
                {l.label}
              </Link>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
