"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { colors, fontFamily } from "@/lib/dashboard-styles";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%", fontFamily }}>
      {isMobile && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Ouvrir le menu"
          style={{
            position: "fixed",
            top: "16px",
            left: "16px",
            zIndex: 30,
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            border: `1px solid ${colors.border}`,
            background: colors.card,
            fontSize: "20px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          ☰
        </button>
      )}

      <Sidebar
        isMobile={isMobile}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 15,
          }}
        />
      )}

      <main
        style={{
          marginLeft: isMobile ? 0 : "260px",
          flex: 1,
          background: colors.bg,
          minHeight: "100vh",
          padding: isMobile ? "64px 16px 32px" : "40px 48px",
          width: isMobile ? "100%" : "calc(100% - 260px)",
          fontFamily,
          boxSizing: "border-box",
        }}
      >
        {children}
      </main>
    </div>
  );
}
