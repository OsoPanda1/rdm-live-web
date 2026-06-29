// Activa la membresía minera RDM (129 MXN/mes).
// Modo manual/dev: activa de inmediato por 30 días. Cuando se conecte un
// proveedor de pagos real (MERCHANT_PAYMENT_PROVIDER), aquí se redirige al checkout.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const PRICE_MXN = 129;

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Auth required" }, 401);

    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: auth } } });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Invalid session" }, 401);
    const userId = userData.user.id;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);

    const { data: membership, error } = await admin
      .from("game_memberships")
      .upsert(
        {
          user_id: userId,
          status: "active",
          price_mxn: PRICE_MXN,
          current_period_end: periodEnd.toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select()
      .single();
    if (error) return json({ error: error.message }, 500);

    // Bono de bienvenida: energía llena
    await admin
      .from("mineral_balances")
      .upsert({ user_id: userId, energy: 100, energy_updated_at: new Date().toISOString() }, { onConflict: "user_id" });

    return json({ membership, price_mxn: PRICE_MXN });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
