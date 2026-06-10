"use client";

import { useState } from "react";

const links = [
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Tarification", href: "#pricing" },
  { label: "Témoignages", href: "#temoignages" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-white/95 backdrop-blur-sm">
      <div className="container-page flex h-16 items-center justify-between">
        <a href="#" className="flex shrink-0 items-center gap-2.5">
          <img
            src="/logo.png"
            width={36}
            height={36}
            alt="LeadHunter AI"
            style={{ background: "transparent" }}
          />
          <span className="text-base font-bold text-brand-text">LeadHunter AI</span>
        </a>

        <div className="hidden items-center gap-6 md:flex">
          <nav className="flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-brand-muted transition-colors hover:text-brand-text"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <a
            href="/login"
            style={{
              border: "1.5px solid #1F4D3A",
              color: "#1F4D3A",
              borderRadius: "8px",
              padding: "8px 18px",
              fontWeight: "500",
              textDecoration: "none",
              marginRight: "12px",
            }}
          >
            Se connecter
          </a>
          <a href="#hero" className="btn-primary px-5 py-3">
            Commencer gratuitement
          </a>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-border md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-brand-border px-6 py-4 md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="block py-3 text-sm font-medium text-brand-muted"
              onClick={() => setOpen(false)}
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
              border: "1.5px solid #1F4D3A",
              color: "#1F4D3A",
              borderRadius: "8px",
              padding: "8px 18px",
              fontWeight: "500",
              textDecoration: "none",
            }}
          >
            Se connecter
          </a>
          <a href="#hero" className="btn-primary mt-3 block w-full text-center">
            Commencer gratuitement
          </a>
        </div>
      )}
    </header>
  );
}
