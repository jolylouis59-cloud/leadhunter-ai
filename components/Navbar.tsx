"use client";

import { useState } from "react";
import Logo from "./Logo";

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
        <a href="#" className="shrink-0">
          <Logo />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
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

        <a href="#hero" className="btn-primary hidden px-5 py-3 md:inline-block">
          Commencer gratuitement
        </a>

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
          <a href="#hero" className="btn-primary mt-3 block w-full text-center">
            Commencer gratuitement
          </a>
        </div>
      )}
    </header>
  );
}
