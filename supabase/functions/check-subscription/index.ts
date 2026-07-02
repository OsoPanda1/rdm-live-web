import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-12-18.acacia" });
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) throw new Error("Not authenticated");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id;

    let isPremium = false;
    if (customerId) {
      const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 10 });
      for (const sub of subs.data) {
        const kind = sub.metadata?.kind;
        const expires_at = new Date(sub.current_period_end * 1000).toISOString();
        const amount = (sub.items.data[0]?.price.unit_amount ?? 0) / 100;
        if (kind === "premium") {
          isPremium = true;
          await admin.from("subscriptions_premium").upsert({
            user_id: user.id, status: "activa", amount, expires_at,
            stripe_customer_id: customerId, stripe_subscription_id: sub.id,
          }, { onConflict: "user_id" });
        } else if (kind === "commerce" && sub.metadata?.business_id) {
          await admin.from("commerce_subscriptions").upsert({
            business_id: sub.metadata.business_id, user_id: user.id,
            plan: sub.metadata.plan === "trimestral" ? "trimestral" : "mensual",
            status: "activa", amount, expires_at,
            stripe_customer_id: customerId, stripe_subscription_id: sub.id,
          }, { onConflict: "stripe_subscription_id" });
          await admin.from("businesses").update({ is_subscribed: true, owner_id: user.id }).eq("id", sub.metadata.business_id);
        }
      }
    }
    await admin.from("profiles").update({ is_premium: isPremium }).eq("user_id", user.id);

    return new Response(JSON.stringify({ is_premium: isPremium }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("check-subscription error:", msg);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
