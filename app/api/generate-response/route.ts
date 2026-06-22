import { NextResponse } from "next/server";
import { hasActiveAccess } from "@/lib/access";
import { createClient } from "@/lib/supabase-server";
import { buildReplyPrompt, type ReplyConfig } from "@/lib/reply-prompt";

function buildFallbackResponse(
  title: string,
  subreddit: string | null,
  username: string | null
): string {
  const user = username ? `u/${username.replace(/^u\//i, "")}` : "là";
  const sub = subreddit ? `r/${subreddit.replace(/^r\//i, "")}` : "ce subreddit";

  return `Salut ${user} !

J'ai vu ton post sur ${sub}, "${title.slice(0, 80)}${title.length > 80 ? "…" : ""}"

On a développé LeadHunter AI exactement pour ça : l'outil scanne Reddit 24/7, score l'intention d'achat de chaque post, et génère une réponse personnalisée prête à envoyer.

Si tu veux tester, on offre 7 jours gratuits sans CB. Je peux t'envoyer le lien en DM si ça t'intéresse !`;
}

async function generateReplyWithClaude(
  lead: Parameters<typeof buildReplyPrompt>[0],
  config: ReplyConfig,
  prompt: string
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
      messages: [{ role: "user", content: prompt }],
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
    .select(
      "plan, trial_ends_at, product_description, target, product_name, response_goal, response_goal_other, response_link, response_closing_style, response_closing_other, response_link_frequency, offer_description, tone_avoid"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    !hasActiveAccess({
      plan: configRow?.plan ?? "free",
      trial_ends_at: configRow?.trial_ends_at ?? null,
    })
  ) {
    return NextResponse.json(
      { error: "Abonnement ou essai actif requis pour générer une réponse IA" },
      { status: 403 }
    );
  }

  const config: ReplyConfig = {
    product_description:
      configRow?.product_description ?? "outil de prospection B2B automatisé",
    target: configRow?.target ?? "founders, solopreneurs, agences marketing",
    product_name: configRow?.product_name ?? null,
    response_goal: configRow?.response_goal ?? null,
    response_goal_other: configRow?.response_goal_other ?? null,
    response_link: configRow?.response_link ?? null,
    response_closing_style: configRow?.response_closing_style ?? null,
    response_closing_other: configRow?.response_closing_other ?? null,
    response_link_frequency: configRow?.response_link_frequency ?? "if_relevant",
    offer_description: configRow?.offer_description ?? null,
    tone_avoid: configRow?.tone_avoid ?? null,
  };

  const title = lead.post_title ?? lead.title ?? "";
  const prompt = buildReplyPrompt(lead, config);

  console.log("[GENERATE-RESPONSE] config:", config);
  console.log("[GENERATE-RESPONSE] prompt:", prompt);

  const claudeResponse = await generateReplyWithClaude(lead, config, prompt);
  if (!claudeResponse) {
    console.warn("[GENERATE-RESPONSE] fallback used (Claude unavailable or empty response)");
  }

  const response =
    claudeResponse ??
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
