import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getPlanFromPriceId, getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

async function updateUserPlan(
  userId: string,
  plan: string,
  leadsLimit: number,
  stripeCustomerId: string
) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("user_configs").upsert(
    {
      user_id: userId,
      plan,
      leads_limit: leadsLimit,
      stripe_customer_id: stripeCustomerId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    throw new Error(`Supabase update failed: ${error.message}`);
  }
}

async function resetUserPlan(stripeCustomerId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("user_configs")
    .update({
      plan: "free",
      leads_limit: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", stripeCustomerId);

  if (error) {
    throw new Error(`Supabase reset failed: ${error.message}`);
  }
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET manquante" }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id;

      if (!userId || !customerId) {
        console.error("checkout.session.completed: metadata manquante", session.id);
        return NextResponse.json({ received: true });
      }

      let plan = session.metadata?.plan ?? "starter";
      let leadsLimit = Number(session.metadata?.leads_limit ?? 0);

      if (!leadsLimit && session.line_items?.data?.[0]?.price?.id) {
        const priceId = session.line_items.data[0].price.id;
        const planInfo = getPlanFromPriceId(priceId);
        if (planInfo) {
          plan = planInfo.plan;
          leadsLimit = planInfo.leads_limit;
        }
      }

      if (!leadsLimit) {
        const planDefaults: Record<string, number> = {
          starter: 300,
          growth: 1000,
          agency: 999999,
        };
        leadsLimit = planDefaults[plan] ?? 0;
      }

      await updateUserPlan(userId, plan, leadsLimit, customerId);
      console.log(`Plan ${plan} activé pour user ${userId}`);
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id;

      if (customerId) {
        await resetUserPlan(customerId);
        console.log(`Abonnement annulé pour customer ${customerId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur webhook" },
      { status: 500 }
    );
  }
}
