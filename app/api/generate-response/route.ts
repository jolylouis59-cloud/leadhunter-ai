import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

function buildResponse(
  title: string,
  subreddit: string | null,
  username: string | null
): string {
  const user = username ? `u/${username}` : "là";
  const sub = subreddit ? `r/${subreddit}` : "ce subreddit";

  return `Salut ${user} !

J'ai vu ton post sur ${sub} — "${title.slice(0, 80)}${title.length > 80 ? "…" : ""}"

On a développé LeadHunter AI exactement pour ça : l'outil scanne Reddit 24/7, score l'intention d'achat de chaque post, et génère une réponse personnalisée prête à envoyer.

Si tu veux tester, on offre 7 jours gratuits sans CB. Je peux t'envoyer le lien en DM si ça t'intéresse !`;
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

  const response = buildResponse(lead.title, lead.subreddit, lead.username);

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
