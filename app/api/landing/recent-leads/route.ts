import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sanitizeLeadTitle } from "@/lib/landing-pii";

export const dynamic = "force-dynamic";

type LeadRow = {
  post_title: string | null;
  subreddit: string | null;
};

async function fetchLeadsForDays(days: number): Promise<LeadRow[]> {
  const supabase = createAdminClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("leads")
    .select("post_title, subreddit")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return data ?? [];
}

function mapLeads(rows: LeadRow[]) {
  const seen = new Set<string>();
  const leads: { title: string; subreddit: string }[] = [];

  for (const row of rows) {
    const title = sanitizeLeadTitle(row.post_title);
    if (!title) continue;

    const sub = (row.subreddit || "reddit").replace(/^r\//i, "");
    const key = `${title}|${sub}`;
    if (seen.has(key)) continue;
    seen.add(key);

    leads.push({ title, subreddit: sub });
    if (leads.length >= 10) break;
  }

  return leads;
}

export async function GET() {
  try {
    let rows = await fetchLeadsForDays(7);
    let leads = mapLeads(rows);

    if (leads.length < 5) {
      rows = await fetchLeadsForDays(30);
      leads = mapLeads(rows);
    }

    return NextResponse.json({ leads });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur serveur";
    console.error("LANDING RECENT LEADS ERROR:", message, e);
    return NextResponse.json({ leads: [], error: message }, { status: 200 });
  }
}
