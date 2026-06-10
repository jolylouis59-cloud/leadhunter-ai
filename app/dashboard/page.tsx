"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const MOCK_LEADS = [
  { platform: "Reddit", score: 98, text: "Je cherche un outil de prospection B2B sur Reddit…", time: "il y a 4 min" },
  { platform: "X", score: 87, text: "Alternative à Octolens pour monitorer les mentions ?", time: "il y a 12 min" },
  { platform: "LinkedIn", score: 76, text: "Quel outil utilisez-vous pour la prospection sociale ?", time: "il y a 1h" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("lh_user");
    if (!user) {
      router.replace("/");
      return;
    }
    setEmail(user);
  }, [router]);

  function logout() {
    localStorage.removeItem("lh_user");
    router.replace("/");
  }

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-400">
        Chargement…
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <span className="font-bold text-gray-900">LeadHunter AI</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{email}</span>
            <button
              type="button"
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">Tes leads détectés aujourd&apos;hui</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-3xl font-bold text-gray-900">3</p>
            <p className="text-sm text-gray-500">Leads chauds</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-3xl font-bold text-gray-900">98%</p>
            <p className="text-sm text-gray-500">Intent max</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500">Réponses envoyées</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {MOCK_LEADS.map((lead) => (
            <div
              key={lead.text}
              className="rounded-lg border border-gray-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{lead.platform}</span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  {lead.score}%
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{lead.text}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">{lead.time}</span>
                <button
                  type="button"
                  className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Générer réponse IA
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
