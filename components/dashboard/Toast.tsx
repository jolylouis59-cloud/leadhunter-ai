"use client";

import { useEffect } from "react";
import { colors, fontFamily } from "@/lib/dashboard-styles";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
};

export default function Toast({
  message,
  type = "info",
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  const bg =
    type === "error" ? "#DC2626" : type === "success" ? colors.accent : colors.text;

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 200,
        bottom: "24px",
        right: "24px",
        left: "24px",
        maxWidth: "420px",
        marginLeft: "auto",
        background: bg,
        color: "#FFFFFF",
        padding: "14px 20px",
        borderRadius: "10px",
        fontSize: "14px",
        fontWeight: 500,
        boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
        fontFamily,
      }}
    >
      {message}
    </div>
  );
}
