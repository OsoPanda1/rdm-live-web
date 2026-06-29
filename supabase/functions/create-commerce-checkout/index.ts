import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { business_id, plan } = await req.json();
    if (!business_id || !["mensual", "trimestral"].includes(plan)) {
      return new Response(JSON.stringify({ error: "business_id y plan (mensual|trimestral) requeridos" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY missing");
    const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) throw new Error("Not authenticated");

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data[0]?.id;
    if (!customerId) {
      const c = await stripe.customers.create({ email: user.email, metadata: { user_id: user.id } });
      customerId = c.id;
    }

    const isQuarterly = plan === "trimestral";
    const origin = req.headers.get("origin") || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{
        price_data: {
          currency: "mxn",
          product_data: {
            name: isQuarterly ? "Comercio Federado · Trimestral" : "Comercio Federado · Mensual",
            description: "Suscripción de comercio en RDM Digital",
          },
          unit_amount: isQuarterly ? 129900 : 49900,
          recurring: { interval: "month", interval_count: isQuarterly ? 3 : 1 },
        },
        quantity: 1,
      }],
      metadata: { user_id: user.id, business_id, plan, kind: "commerce" },
      subscription_data: { metadata: { user_id: user.id, business_id, plan, kind: "commerce" } },
      success_url: `${origin}/comercios?sub=success`,
      cancel_url: `${origin}/comercios?sub=cancel`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("create-commerce-checkout error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
