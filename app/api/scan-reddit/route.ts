import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

const MOCK_LEADS = [
  {
    title:
      "Je cherche un outil de prospection B2B qui trouve mes clients sur Reddit automatiquement. Des alternatives à Octolens ?",
    subreddit: "SaaS",
    username: "founder_marc",
    intent_score: 94,
    post_created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    title:
      "Quel outil utilisez-vous pour monitorer Reddit et trouver des leads qualifiés pour votre startup ?",
    subreddit: "entrepreneur",
    username: "startup_sarah",
    intent_score: 78,
    post_created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    title:
      "Besoin d'un outil pour scanner les posts Reddit et identifier les prospects chauds. Recommandations ?",
    subreddit: "startups",
    username: "growth_tom",
    intent_score: 62,
    post_created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    title:
      "Discussion générale : comment trouvez-vous vos premiers clients B2B en 2026 ?",
    subreddit: "marketing",
    username: "marketer_lisa",
    intent_score: 35,
    post_created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    title:
      "URGENT : je dois trouver 10 clients cette semaine, quel canal social marche le mieux pour le B2B SaaS ?",
    subreddit: "SaaS",
    username: "hustle_alex",
    intent_score: 88,
    post_created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
];

export async function POST() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const leadsToInsert = MOCK_LEADS.map((lead) => ({
    user_id: user.id,
    platform: "reddit",
    title: lead.title,
    subreddit: lead.subreddit,
    username: lead.username,
    intent_score: lead.intent_score,
    status: "new",
    post_created_at: lead.post_created_at,
  }));

  const { data, error } = await supabase.from("leads").insert(leadsToInsert).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leads: data, count: data?.length ?? 0 });
}
