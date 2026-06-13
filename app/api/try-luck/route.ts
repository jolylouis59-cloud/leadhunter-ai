import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { source, problem, name, email, phone } = body;

    if (!source?.trim() || !problem?.trim() || !name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "source, problem, name et email sont requis" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from("try_luck_entries").insert({
      source: source.trim(),
      problem: problem.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
    });

    if (error) {
      console.error("try-luck insert error:", error);
      return NextResponse.json(
        { error: "Impossible d'enregistrer la candidature" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("try-luck API error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Erreur serveur",
      },
      { status: 500 }
    );
  }
}
