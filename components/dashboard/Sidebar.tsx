"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { PLAN_BADGE_STYLES } from "@/lib/plan-limits";
import { colors, fontFamily, getInitials } from "@/lib/dashboard-styles";

const navItems = [
  { label: "Leads", href: "/dashboard", icon: "🎯" },
  { label: "Paramètres", href: "/dashboard/settings", icon: "⚙️" },
];

type SidebarProps = {
  isMobile?: boolean;
  open?: boolean;
  onClose?: () => void;
};

export default function Sidebar({ isMobile = false, open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [plan, setPlan] = useState("free");
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [logoutHover, setLogoutHover] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);

      if (user) {
        const { data } = await supabase
          .from("user_configs")
          .select("plan")
          .eq("user_id", user.id)
          .maybeSingle();
        if (data?.plan) setPlan(data.plan);
      }
    }
    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const planBadge = PLAN_BADGE_STYLES[plan] ?? PLAN_BADGE_STYLES.free;

  const hiddenOnMobile = isMobile && !open;

  return (
    <aside
      style={{
        width: "260px",
        minWidth: "260px",
        background: colors.sidebar,
        minHeight: "100vh",
        position: "fixed",
        left: hiddenOnMobile ? "-280px" : 0,
        top: 0,
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        fontFamily,
        transition: "left 250ms ease",
        boxShadow: isMobile && open ? "4px 0 20px rgba(0,0,0,0.2)" : "none",
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
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>LeadHunter</span>
          <span style={{ fontSize: "16px", fontWeight: 700, color: colors.accent }}>AI</span>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {navItems.map((item) => {
          const active = pathname === item.href;
          const hovered = hoveredNav === item.href && !active;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
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
                transition: "background 150ms ease",
              }}
            >
              <span style={{ fontSize: "16px", lineHeight: 1 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop: "1px solid #3a3a3a", paddingTop: "16px" }}>
        {email && (
          <div style={{ marginBottom: "12px", padding: "0 4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
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
            <Link
              href="/dashboard/settings?tab=billing"
              onClick={onClose}
              style={{
                display: "inline-block",
                padding: "4px 10px",
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: 700,
                background: planBadge.bg,
                color: planBadge.color,
                textDecoration: "none",
              }}
            >
              {planBadge.label}
            </Link>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          onMouseEnter={() => setLogoutHover(true)}
          onMouseLeave={() => setLogoutHover(false)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #3a3a3a",
            background: logoutHover ? colors.navHover : "transparent",
            color: logoutHover ? "#ffffff" : colors.navInactive,
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            fontFamily,
          }}
        >
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
