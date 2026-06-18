import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

type UserConfig = {
  product_description: string;
  target: string;
  product_name: string | null;
};

type LeadRow = {
  post_title?: string | null;
  title?: string | null;
  post_body?: string | null;
  subreddit?: string | null;
  author?: string | null;
  username?: string | null;
};

function buildReplyPrompt(lead: LeadRow, config: UserConfig): string {
  const title = lead.post_title ?? lead.title ?? "";
  const body = lead.post_body ?? "";
  const subreddit = lead.subreddit ? `r/${lead.subreddit}` : "ce subreddit";
  const author = lead.author ?? lead.username ?? "l'auteur";
  const productName = config.product_name?.trim() || "LeadHunter AI";

  return `Tu es un expert en prospection Reddit B2B.

Produit : ${config.product_description}
Cible : ${config.target}
Nom du produit : ${productName}

Post Reddit à commenter :
- Titre : ${title}
- Contenu : ${body || "(pas de contenu)"}
- Subreddit : ${subreddit}
- Auteur : u/${author.replace(/^u\//i, "")}

Rédige une réponse courte, naturelle et en français, prête à poster en commentaire Reddit.
Ton amical et utile, pas vendeur agressif. Mentionne le produit seulement si c'est pertinent.

RÈGLES DE FORMAT :
- N'utilise JAMAIS de tirets ("-") dans ta réponse, ni en début de ligne ni en milieu de phrase comme séparateur.
- Reformule avec des virgules, des points, ou des phrases complètes à la place.
- Pas de markdown, pas de listes à puces, pas de guillemets autour de la réponse.

Réponds UNIQUEMENT avec le texte de la réponse, sans préambule.`;
}

function buildFallbackResponse(
  title: string,
  subreddit: string | null,
  username: string | null
): string {
  const user = username ? `u/${username.replace(/^u\//i, "")}` : "là";
  const sub = subreddit ? `r/${subreddit}` : "ce subreddit";

  return `Salut ${user} !

J'ai vu ton post sur ${sub}, "${title.slice(0, 80)}${title.length > 80 ? "…" : ""}"

On a développé LeadHunter AI exactement pour ça : l'outil scanne Reddit 24/7, score l'intention d'achat de chaque post, et génère une réponse personnalisée prête à envoyer.

Si tu veux tester, on offre 7 jours gratuits sans CB. Je peux t'envoyer le lien en DM si ça t'intéresse !`;
}

async function generateReplyWithClaude(
  lead: LeadRow,
  config: UserConfig
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: buildReplyPrompt(lead, config) }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("CLAUDE REPLY ERROR:", {
      status: response.status,
      bodyPreview: errText.slice(0, 300),
    });
    return null;
  }

  const data = await response.json();
  const text = String(data.content?.[0]?.text ?? "").trim();
  return text || null;
}

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const leadId = body.lead_id as string | undefined;

  if (!leadId) {
    return NextResponse.json({ error: "lead_id requis" }, { status: 400 });
  }

  const { data: lead, error: fetchError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !lead) {
    return NextResponse.json({ error: "Lead introuvable" }, { status: 404 });
  }

  const { data: configRow } = await supabase
    .from("user_configs")
    .select("product_description, target, product_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const config: UserConfig = {
    product_description:
      configRow?.product_description ?? "outil de prospection B2B automatisé",
    target: configRow?.target ?? "founders, solopreneurs, agences marketing",
    product_name: configRow?.product_name ?? null,
  };

  const title = lead.post_title ?? lead.title ?? "";
  const response =
    (await generateReplyWithClaude(lead, config)) ??
    buildFallbackResponse(title, lead.subreddit, lead.author ?? lead.username);

  const { error: updateError } = await supabase
    .from("leads")
    .update({ ai_response: response })
    .eq("id", leadId)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ response });
}
