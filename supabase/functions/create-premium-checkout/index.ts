import { createStripe, safeError } from "../_shared/stripe.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { premiumCheckoutSchema } from "../_shared/validation.ts";
import { checkRateLimit, jsonResponse, corsHeaders } from "../_shared/rate-limit.ts";

const TIERS: Record<string, { name: string; desc: string; amount: number }> = {
  "99":  { name: "Veta Soberana · Básico",  desc: "Acceso a minería digital y bolsa de premios", amount: 9900 },
  "129": { name: "Veta Soberana · Minero",  desc: "Minería remota, multiplicadores x2 y misiones avanzadas", amount: 12900 },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const parsed = premiumCheckoutSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonResponse({ error: "Datos inválidos", detail: parsed.error.flatten() }, 400);
    }
    const { tier } = parsed.data;
    const plan = TIERS[tier];

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const rateKey = `premium-checkout:${req.headers.get("x-forwarded-for") || "unknown"}`;
    const rl = await checkRateLimit(serviceKey, supabaseUrl, rateKey, { max: 10, windowSec: 60 });
    if (!rl.allowed) {
      return jsonResponse({ error: "Demasiadas solicitudes", retryAfter: rl.retryAfter }, 429);
    }

    const stripe = createStripe();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user?.email) throw new Error("Not authenticated");

    const origin = req.headers.get("origin") || Deno.env.get("PRODUCTION_ORIGIN") || "https://visitarealdelmonte.online";

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data[0]?.id;
    if (!customerId) {
      const c = await stripe.customers.create({ email: user.email, metadata: { user_id: user.id } });
      customerId = c.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{
        price_data: {
          currency: "mxn",
          product_data: { name: plan.name, description: plan.desc },
          unit_amount: plan.amount,
          recurring: { interval: "month" },
        },
        quantity: 1,
      }],
      metadata: { user_id: user.id, kind: "premium", tier },
      subscription_data: { metadata: { user_id: user.id, kind: "premium", tier } },
      success_url: `${origin}/game?premium=success`,
      cancel_url: `${origin}/game?premium=cancel`,
    });

    return jsonResponse({ url: session.url });
  } catch (e) {
    if (e instanceof Response) return e;
    return safeError(e);
  }
});
