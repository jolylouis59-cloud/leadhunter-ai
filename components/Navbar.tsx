"use client";

import { useEffect, useState } from "react";
import { landingColors, landingFont, primaryBtnStyle } from "@/lib/landing-styles";

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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: isMobile ? 56 : 64,
          padding: isMobile ? "0 16px" : "0 24px",
          maxWidth: isMobile ? "100%" : 1100,
          margin: "0 auto",
          boxSizing: "border-box",
          gap: 8,
          width: "100%",
        }}
      >
        <a
          href="#"
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 6 : 10,
            textDecoration: "none",
            flexShrink: 0,
            minWidth: 0,
          }}
        >
          <img
            src="/logo.png"
            width={isMobile ? 32 : 36}
            height={isMobile ? 32 : 36}
            alt="LeadHunter AI"
            style={{ flexShrink: 0 }}
          />
          {!isMobile && (
            <span style={{ fontSize: 16, fontWeight: 700, color: logoTextColor }}>LeadHunter AI</span>
          )}
          {isMobile && (
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: logoTextColor,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              LeadHunter
            </span>
          )}
        </a>

        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexShrink: 0 }}>
            <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  style={{
                    fontSize: 14,
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
                borderRadius: 8,
                padding: "8px 18px",
                fontWeight: 500,
                textDecoration: "none",
                fontSize: 14,
                whiteSpace: "nowrap",
              }}
            >
              Se connecter
            </a>
            <a href="/login" style={{ ...primaryBtnStyle, padding: "12px 20px", whiteSpace: "nowrap" }}>
              Essai gratuit — 15 leads
            </a>
          </div>
        )}

        {isMobile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 1,
              minWidth: 0,
              justifyContent: "flex-end",
            }}
          >
            <a
              href="/login"
              style={{
                ...primaryBtnStyle,
                padding: "8px 14px",
                fontSize: 13,
                borderRadius: 8,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Essai gratuit — 15 leads
            </a>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
              style={{
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: scrolled ? landingColors.text : landingColors.white,
                fontSize: 20,
                lineHeight: 1,
                flexShrink: 0,
                padding: 0,
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
                fontSize: 14,
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
              marginTop: 12,
              textAlign: "center",
              border: `1.5px solid ${landingColors.accent}`,
              color: scrolled ? landingColors.accent : landingColors.white,
              borderRadius: 8,
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
