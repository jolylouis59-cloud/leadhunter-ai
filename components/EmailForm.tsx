"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

type EmailFormProps = {
  variant?: "hero" | "cta";
  buttonLabel?: string;
};

export default function EmailForm({
  variant = "hero",
  buttonLabel = "Commencer gratuitement",
}: EmailFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");

  const isCta = variant === "cta";

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
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className={`flex gap-3 ${isCta ? "flex-col" : "flex-col md:flex-row"}`}
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
          className="flex-1 rounded-xl border border-brand-border bg-white px-4 py-3.5 text-sm text-brand-text outline-none transition-shadow placeholder:text-gray-400 focus:border-brand-cta focus:ring-2 focus:ring-brand-cta/20"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={`btn-primary shrink-0 ${isCta ? "w-full" : "w-full md:w-auto"}`}
        >
          {status === "loading" ? "Inscription…" : buttonLabel}
        </button>
      </form>

      {status === "success" && (
        <p className={`mt-3 text-sm font-medium text-brand-cta ${isCta ? "text-center" : ""}`}>
          ✅ Tu es sur la liste ! On te contacte en priorité.
        </p>
      )}
      {status === "duplicate" && (
        <p className={`mt-3 text-sm text-red-600 ${isCta ? "text-center" : ""}`}>
          Cet email est déjà inscrit.
        </p>
      )}
      {status === "error" && (
        <p className={`mt-3 text-sm text-red-600 ${isCta ? "text-center" : ""}`}>
          Erreur lors de l&apos;inscription. Réessaie.
        </p>
      )}
    </div>
  );
}
