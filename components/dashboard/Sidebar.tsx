"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { colors, fontFamily, getInitials } from "@/lib/dashboard-styles";

const navItems = [
  { label: "Leads", href: "/dashboard", icon: "🎯" },
  { label: "Paramètres", href: "/dashboard/settings", icon: "⚙️" },
];

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [logoutHover, setLogoutHover] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      style={{
        width: "260px",
        minWidth: "260px",
        background: colors.sidebar,
        minHeight: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        fontFamily,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "0 8px 24px",
          borderBottom: "1px solid #3a3a3a",
          marginBottom: "24px",
        }}
      >
        <img
          src="/logo.png"
          alt="LeadHunter AI"
          width={36}
          height={36}
          style={{ borderRadius: "8px", flexShrink: 0, background: "transparent" }}
        />
        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
            LeadHunter
          </span>
          <span
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: colors.accent,
            }}
          >
            AI
          </span>
        </div>
      </div>

      <p
        style={{
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          color: colors.navInactive,
          textTransform: "uppercase",
          padding: "0 12px",
          marginBottom: "8px",
        }}
      >
        Menu
      </p>

      <nav style={{ flex: 1 }}>
        {navItems.map((item) => {
          const active = pathname === item.href;
          const hovered = hoveredNav === item.href && !active;
          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHoveredNav(item.href)}
              onMouseLeave={() => setHoveredNav(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                marginBottom: "4px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
                color: active ? "#ffffff" : colors.navInactive,
                background: active ? colors.accent : hovered ? colors.navHover : "transparent",
                transition: "background 150ms ease, color 150ms ease",
              }}
            >
              <span style={{ fontSize: "16px", lineHeight: 1 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          borderTop: "1px solid #3a3a3a",
          paddingTop: "16px",
        }}
      >
        {email && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "12px",
              padding: "0 4px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: colors.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 700,
                color: "#ffffff",
                flexShrink: 0,
              }}
            >
              {getInitials(email)}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: colors.navInactive,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {email}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          onMouseEnter={() => setLogoutHover(true)}
          onMouseLeave={() => setLogoutHover(false)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #3a3a3a",
            background: logoutHover ? colors.navHover : "transparent",
            color: logoutHover ? "#ffffff" : colors.navInactive,
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            fontFamily,
            transition: "background 150ms ease, color 150ms ease",
          }}
        >
          <LogoutIcon />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
