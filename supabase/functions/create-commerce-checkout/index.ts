import { createStripe, safeError } from "../_shared/stripe.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { commerceCheckoutSchema } from "../_shared/validation.ts";
import { checkRateLimit, jsonResponse, corsHeaders } from "../_shared/rate-limit.ts";

const COMMERCE_TIERS: Record<string, { name: string; desc: string; amount: number }> = {
  "199": { name: "Comercio Federado · Básico", desc: "Catálogo digital, mapa interactivo, analytics básicos", amount: 19900 },
  "299": { name: "Comercio Federado · Premium", desc: "Catálogo premium, nodo de energía para jugadores, métricas avanzadas, prioridad en bolsa de premios", amount: 29900 },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const parsed = commerceCheckoutSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonResponse({ error: "Datos inválidos", detail: parsed.error.flatten() }, 400);
    }
    const { business_id, tier } = parsed.data;
    const plan = COMMERCE_TIERS[tier];

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const rateKey = `commerce-checkout:${req.headers.get("x-forwarded-for") || "unknown"}`;
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) throw new Error("Not authenticated");

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data[0]?.id;
    if (!customerId) {
      const c = await stripe.customers.create({ email: user.email, metadata: { user_id: user.id } });
      customerId = c.id;
    }

    const origin = req.headers.get("origin") || Deno.env.get("PRODUCTION_ORIGIN") || "https://visitarealdelmonte.online";

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
      metadata: { user_id: user.id, business_id, tier, kind: "commerce" },
      subscription_data: { metadata: { user_id: user.id, business_id, tier, kind: "commerce" } },
      success_url: `${origin}/comercios?sub=success`,
      cancel_url: `${origin}/comercios?sub=cancel`,
    });

    return jsonResponse({ url: session.url });
  } catch (e) {
    if (e instanceof Response) return e;
    return safeError(e);
  }
});
