import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" });

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } }
);

function mapStatus(s: string): "activa" | "pendiente" | "cancelada" | "vencida" {
  if (s === "active" || s === "trialing") return "activa";
  if (s === "past_due" || s === "unpaid") return "vencida";
  if (s === "canceled" || s === "incomplete_expired") return "cancelada";
  return "pendiente";
}

async function syncSubscription(sub: Stripe.Subscription) {
  const md = sub.metadata || {};
  const kind = md.kind;
  const userId = md.user_id;
  const status = mapStatus(sub.status);
  const expires_at = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;
  const amount = (sub.items.data[0]?.price.unit_amount ?? 0) / 100;

  if (kind === "premium" && userId) {
    await admin.from("subscriptions_premium").upsert({
      user_id: userId,
      status,
      amount,
      expires_at,
      stripe_customer_id: sub.customer as string,
      stripe_subscription_id: sub.id,
      started_at: new Date(sub.start_date * 1000).toISOString(),
    }, { onConflict: "user_id" });
    await admin.from("profiles").update({ is_premium: status === "activa" }).eq("user_id", userId);
  } else if (kind === "commerce" && md.business_id) {
    await admin.from("commerce_subscriptions").upsert({
      business_id: md.business_id,
      user_id: userId ?? null,
      plan: md.plan === "trimestral" ? "trimestral" : "mensual",
      status,
      amount,
      expires_at,
      stripe_customer_id: sub.customer as string,
      stripe_subscription_id: sub.id,
    }, { onConflict: "stripe_subscription_id" });
    await admin.from("businesses").update({
      is_subscribed: status === "activa",
      owner_id: userId ?? null,
    }).eq("id", md.business_id);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Webhook verification failed:", msg);
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          // Merge session metadata into subscription if missing
          if (!sub.metadata?.kind && session.metadata?.kind) {
            await stripe.subscriptions.update(sub.id, { metadata: session.metadata });
            sub.metadata = session.metadata;
          }
          await syncSubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        if (inv.subscription) {
          const sub = await stripe.subscriptions.retrieve(inv.subscription as string);
          await syncSubscription(sub);
        }
        break;
      }
      default:
        console.log("Unhandled event:", event.type);
    }
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Handler error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
