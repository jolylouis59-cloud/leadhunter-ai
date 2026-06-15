import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { scanRedditForUser } from "@/lib/reddit-scan";

export async function POST() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: "Non autorisé" },
      { status: 401 }
    );
  }

  const result = await scanRedditForUser(supabase, user.id);

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}
