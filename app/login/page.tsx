"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

type Tab = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const credentials = { email: email.trim(), password };

    const { data, error: authError } =
      tab === "login"
        ? await supabase.auth.signInWithPassword(credentials)
        : await supabase.auth.signUp(credentials);

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (tab === "signup" && data.user && !data.session) {
      setError("Vérifie ta boîte mail pour confirmer ton compte.");
      return;
    }

    router.push(tab === "signup" ? "/pricing" : "/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-oatmeal px-6 py-12">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src="/logo.png"
            alt="LeadHunter AI"
            width={48}
            height={48}
            style={{ borderRadius: "8px", background: "transparent" }}
          />
          <h1 className="mt-4 text-2xl font-bold text-brand-text">LeadHunter AI</h1>
          <p className="mt-1 text-sm text-brand-muted">Trouve tes clients B2B automatiquement</p>
        </div>

        <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setError(null);
            }}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
              tab === "login" ? "bg-white text-brand-text shadow-sm" : "text-brand-muted"
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("signup");
              setError(null);
            }}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
              tab === "signup" ? "bg-white text-brand-text shadow-sm" : "text-brand-muted"
            }`}
          >
            Créer un compte
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-brand-text">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              className="w-full rounded-lg border border-brand-border px-4 py-3 text-sm text-brand-text outline-none transition-shadow placeholder:text-gray-400 focus:border-brand-cta focus:ring-2 focus:ring-brand-cta/20"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-brand-text">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={tab === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-brand-border px-4 py-3 text-sm text-brand-text outline-none transition-shadow placeholder:text-gray-400 focus:border-brand-cta focus:ring-2 focus:ring-brand-cta/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-cta py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-cta-hover hover:shadow-lg disabled:opacity-60"
          >
            {loading
              ? "Chargement…"
              : tab === "login"
                ? "Se connecter"
                : "Créer mon compte"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}
      </div>
    </main>
  );
}
