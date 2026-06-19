"use client";

import { useEffect, useState } from "react";
import { containerStyle, landingColors, landingFont, primaryBtnStyle } from "@/lib/landing-styles";

const links = [
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Tarification", href: "#pricing" },
  { label: "Témoignages", href: "#temoignages" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onScroll();
    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const logoTextColor = scrolled ? landingColors.text : landingColors.white;
  const drawerBg = scrolled ? "rgba(255,255,255,0.98)" : landingColors.dark;
  const drawerText = scrolled ? landingColors.text : landingColors.white;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        fontFamily: landingFont,
        background: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.08)" : "none",
        borderBottom: scrolled ? `1px solid ${landingColors.border}` : "1px solid transparent",
        transition: "background 250ms ease, box-shadow 250ms ease, border-color 250ms ease",
      }}
    >
      <div
        style={{
          ...containerStyle,
          display: "flex",
          height: "64px",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <a
          href="#"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <img src="/logo.png" width={36} height={36} alt="LeadHunter AI" />
          <span style={{ fontSize: "16px", fontWeight: 700, color: logoTextColor }}>
            LeadHunter AI
          </span>
        </a>

        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <nav style={{ display: "flex", alignItems: "center", gap: "32px" }}>
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: scrolled ? "#6B7280" : "rgba(255,255,255,0.85)",
                    textDecoration: "none",
                  }}
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <a
              href="/login"
              style={{
                border: `1.5px solid ${scrolled ? landingColors.accent : "rgba(255,255,255,0.6)"}`,
                color: scrolled ? landingColors.accent : landingColors.white,
                borderRadius: "8px",
                padding: "8px 18px",
                fontWeight: 500,
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              Se connecter
            </a>
            <a href="/login" style={{ ...primaryBtnStyle, padding: "12px 20px" }}>
              Commencer gratuitement
            </a>
          </div>
        )}

        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <a
              href="/login"
              style={{
                ...primaryBtnStyle,
                padding: "10px 14px",
                fontSize: "12px",
                whiteSpace: "nowrap",
              }}
            >
              Commencer gratuitement
            </a>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
              style={{
                display: "flex",
                height: "40px",
                width: "40px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                border: `1px solid ${scrolled ? landingColors.border : "rgba(255,255,255,0.3)"}`,
                background: "transparent",
                cursor: "pointer",
                color: scrolled ? landingColors.text : landingColors.white,
                fontSize: "20px",
                lineHeight: 1,
              }}
            >
              {open ? "✕" : "☰"}
            </button>
          </div>
        )}
      </div>

      {isMobile && open && (
        <div
          style={{
            borderTop: `1px solid ${landingColors.border}`,
            padding: "16px 24px 24px",
            background: drawerBg,
          }}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "12px 0",
                fontSize: "14px",
                fontWeight: 500,
                color: drawerText,
                textDecoration: "none",
              }}
            >
              {l.label}
            </a>
          ))}
          <a
            href="/login"
            onClick={() => setOpen(false)}
            style={{
              display: "block",
              marginTop: "12px",
              textAlign: "center",
              border: `1.5px solid ${landingColors.accent}`,
              color: scrolled ? landingColors.accent : landingColors.white,
              borderRadius: "8px",
              padding: "10px 18px",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Se connecter
          </a>
        </div>
      )}
    </header>
  );
}
