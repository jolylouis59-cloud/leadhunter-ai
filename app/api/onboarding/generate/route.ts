import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export type OnboardingProfile = {
  productName: string;
  productDescription: string;
  targetAudience: string;
  painPoint: string;
  competitors?: string;
  websiteUrl?: string;
  targetPricing?: string;
};

export type GeneratedConfig = {
  keywords: string[];
  subreddits: string[];
};

function buildPrompt(profile: OnboardingProfile): string {
  return `Tu es un expert en prospection Reddit B2B.

À partir de ce profil produit, génère des mots-clés et subreddits pour trouver des prospects qui cherchent activement une solution.

PROFIL :
- Nom du produit : ${profile.productName}
- Description : ${profile.productDescription}
- Cible : ${profile.targetAudience}
- Douleur principale : ${profile.painPoint}
${profile.competitors ? `- Concurrents : ${profile.competitors}` : ""}
${profile.websiteUrl ? `- Site web : ${profile.websiteUrl}` : ""}
${profile.targetPricing ? `- Budget/pricing cible des prospects : ${profile.targetPricing}` : ""}

RÈGLES :
- Génère 15 à 20 mots-clés Reddit variés, en formulations naturelles (ce que de vrais utilisateurs tapent quand ils galèrent ou cherchent une solution)
- Génère 8 à 10 subreddits pertinents (sans le préfixe r/)
- Pas de doublons, pas de hashtags
- Mélange français et anglais si pertinent pour la cible

Réponds UNIQUEMENT avec ce JSON strict, sans texte autour :
{"keywords":["..."],"subreddits":["..."]}`;
}

export async function POST(req: Request) {
  console.log("API KEY PRESENT:", !!process.env.ANTHROPIC_API_KEY);

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY manquante" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as OnboardingProfile;

    if (!body.productName?.trim() || !body.productDescription?.trim()) {
      return NextResponse.json(
        { error: "Nom et description du produit requis" },
        { status: 400 }
      );
    }
    if (!body.targetAudience?.trim() || !body.painPoint?.trim()) {
      return NextResponse.json(
        { error: "Cible et douleur principale requises" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{ role: "user", content: buildPrompt(body) }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Erreur Claude: ${errText.slice(0, 200)}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Réponse Claude invalide (pas de JSON)" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]) as GeneratedConfig;
    const keywords = (parsed.keywords ?? [])
      .map((k) => String(k).trim())
      .filter(Boolean);
    const subreddits = (parsed.subreddits ?? [])
      .map((s) => String(s).trim().replace(/^r\//i, ""))
      .filter(Boolean);

    if (keywords.length === 0 || subreddits.length === 0) {
      return NextResponse.json(
        { error: "Génération incomplète (keywords ou subreddits vides)" },
        { status: 500 }
      );
    }

    return NextResponse.json({ keywords, subreddits });
  } catch (error) {
    console.error("ONBOARDING GENERATE ERROR:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
