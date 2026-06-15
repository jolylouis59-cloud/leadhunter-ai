import { colors, fontFamily } from "@/lib/dashboard-styles";

export default function LeadSkeleton() {
  return (
    <div
      style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: "12px",
        padding: "20px 24px",
        marginBottom: "12px",
        fontFamily,
      }}
    >
      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        .skel { animation: skeletonPulse 1.5s ease-in-out infinite; background: #E5E7EB; border-radius: 6px; }
      `}</style>
      <div className="skel" style={{ width: "72px", height: "24px" }} />
      <div className="skel" style={{ width: "80%", height: "18px", marginTop: "14px" }} />
      <div className="skel" style={{ width: "60%", height: "14px", marginTop: "10px" }} />
      <div className="skel" style={{ width: "40%", height: "36px", marginTop: "18px" }} />
    </div>
  );
}
