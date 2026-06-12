import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getPlanFromPriceId, getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { priceId, userId, userEmail } = await req.json();

    if (!priceId || !userId || !userEmail) {
      return NextResponse.json(
        { error: "priceId, userId et userEmail sont requis" },
        { status: 400 }
      );
    }

    const planInfo = getPlanFromPriceId(priceId);
    if (!planInfo) {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }

    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const stripe = getStripe();
    const origin = new URL(req.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?upgraded=true`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        user_id: userId,
        plan: planInfo.plan,
        leads_limit: String(planInfo.leads_limit),
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          plan: planInfo.plan,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur checkout Stripe" },
      { status: 500 }
    );
  }
}
