import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sanitizeLeadTitle } from "@/lib/landing-pii";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let supabase;
    try {
      supabase = createAdminClient();
    } catch (e) {
      console.error("LANDING RECENT LEADS ERROR: admin client", e);
      return NextResponse.json({ leads: [] }, { status: 200 });
    }

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("leads")
      .select("post_title, subreddit, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("LANDING RECENT LEADS ERROR:", error.message, error);
      return NextResponse.json({ leads: [] }, { status: 200 });
    }

    const rows = data ?? [];
    if (rows.length === 0) {
      return NextResponse.json({ leads: [] }, { status: 200 });
    }

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

    return NextResponse.json({ leads }, { status: 200 });
  } catch (e) {
    console.error("LANDING RECENT LEADS ERROR:", e);
    return NextResponse.json({ leads: [] }, { status: 200 });
  }
}
