import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { scanRedditForUser } from "@/lib/reddit-scan";

export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();

    const { data: users, error } = await admin
      .from("user_configs")
      .select("user_id")
      .eq("auto_scan", true);

    if (error) {
      console.error("Cron scan-all: failed to fetch users", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const activeUsers = users ?? [];
    let scanned = 0;

    for (const row of activeUsers) {
      const userId = row.user_id as string;
      const result = await scanRedditForUser(admin, userId);
      console.log(`Cron scan user ${userId}:`, {
        success: result.success,
        leads_inserted: result.leads_inserted ?? 0,
        mode: result.mode,
        error: result.error,
      });
      scanned++;
    }

    console.log(`Cron scan-all complete: ${scanned} user(s) scanned`);

    return NextResponse.json({ success: true, scanned });
  } catch (err) {
    console.error("Cron scan-all error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Cron scan failed" },
      { status: 500 }
    );
  }
}
