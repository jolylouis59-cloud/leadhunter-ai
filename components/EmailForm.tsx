"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { landingColors, landingFont, primaryBtnStyle } from "@/lib/landing-styles";

type EmailFormProps = {
  variant?: "hero" | "hero-dark" | "cta";
  buttonLabel?: string;
};

export default function EmailForm({
  variant = "hero",
  buttonLabel = "Commencer gratuitement",
}: EmailFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">(
    "idle"
  );
  const [isDesktop, setIsDesktop] = useState(false);

  const isCta = variant === "cta";
  const isDark = variant === "hero-dark";

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!value) return;

    setStatus("loading");

    const { error } = await supabase.from("users").insert({ email: value });

    if (error) {
      setStatus(error.code === "23505" ? "duplicate" : "error");
      return;
    }

    setStatus("success");
    setEmail("");
  }

  return (
    <div style={{ width: "100%", fontFamily: landingFont }}>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: isCta || !isDesktop ? "column" : "row",
          gap: "12px",
        }}
      >
        <input
          type="email"
          required
          placeholder="ton@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle" && status !== "loading") setStatus("idle");
          }}
          style={{
            flex: 1,
            boxSizing: "border-box",
            borderRadius: "12px",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.2)" : landingColors.border}`,
            background: isDark ? "rgba(255,255,255,0.08)" : landingColors.white,
            color: isDark ? landingColors.white : landingColors.text,
            padding: "14px 16px",
            fontSize: "14px",
            outline: "none",
            fontFamily: landingFont,
          }}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            ...primaryBtnStyle,
            width: isCta || !isDesktop ? "100%" : "auto",
            flexShrink: 0,
            opacity: status === "loading" ? 0.7 : 1,
            cursor: status === "loading" ? "wait" : "pointer",
          }}
        >
          {status === "loading" ? "Inscription…" : buttonLabel}
        </button>
      </form>

      {status === "success" && (
        <p
          style={{
            margin: "12px 0 0",
            fontSize: "14px",
            fontWeight: 500,
            color: landingColors.accent,
            textAlign: isCta ? "center" : "left",
          }}
        >
          ✅ Tu es sur la liste ! On te contacte en priorité.
        </p>
      )}
      {status === "duplicate" && (
        <p
          style={{
            margin: "12px 0 0",
            fontSize: "14px",
            color: "#DC2626",
            textAlign: isCta ? "center" : "left",
          }}
        >
          Cet email est déjà inscrit.
        </p>
      )}
      {status === "error" && (
        <p
          style={{
            margin: "12px 0 0",
            fontSize: "14px",
            color: "#DC2626",
            textAlign: isCta ? "center" : "left",
          }}
        >
          Erreur lors de l&apos;inscription. Réessaie.
        </p>
      )}
    </div>
  );
}
