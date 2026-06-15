import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { webhookUrl } = await req.json();

    if (!webhookUrl?.trim()?.startsWith("https://hooks.slack.com/")) {
      return NextResponse.json({ error: "URL webhook Slack invalide" }, { status: 400 });
    }

    const res = await fetch(webhookUrl.trim(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "✅ LeadHunter AI — Test de connexion Slack réussi !",
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Échec de l'envoi au webhook Slack" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Slack test error:", err);
    return NextResponse.json({ error: "Erreur lors du test Slack" }, { status: 500 });
  }
}
