import Sidebar from "@/components/dashboard/Sidebar";
import { colors, fontFamily } from "@/lib/dashboard-styles";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        minHeight: "100vh",
        width: "100%",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <Sidebar />
      <main
        style={{
          marginLeft: "260px",
          flex: 1,
          background: colors.bg,
          minHeight: "100vh",
          padding: "40px 48px",
          width: "calc(100% - 260px)",
          fontFamily,
        }}
      >
        {children}
      </main>
    </div>
  );
}
