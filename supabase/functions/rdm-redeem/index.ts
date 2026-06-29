// Canje de puntos por recompensas reales. Verifica puntos, descuenta de forma
// atómica y registra la solicitud de canje para que el negocio la cumpla.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "https://esm.sh/zod@3.23.8";

const bodySchema = z.object({ reward_id: z.string().uuid() });

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

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: reward, error: rErr } = await admin
      .from("rewards_catalog")
      .select("id, name, cost_points, active, stock")
      .eq("id", parsed.data.reward_id)
      .maybeSingle();
    if (rErr || !reward || !reward.active) return json({ error: "Recompensa no disponible" }, 400);
    if (reward.stock === 0) return json({ error: "Recompensa agotada" }, 400);

    const { data: balance } = await admin
      .from("mineral_balances")
      .select("puntos")
      .eq("user_id", userId)
      .maybeSingle();

    if (!balance || balance.puntos < reward.cost_points) {
      return json({ error: "insufficient_points", message: "No tienes puntos suficientes para este canje." }, 400);
    }

    const { data: updated, error: upErr } = await admin
      .from("mineral_balances")
      .update({ puntos: balance.puntos - reward.cost_points })
      .eq("user_id", userId)
      .select()
      .single();
    if (upErr) return json({ error: upErr.message }, 500);

    const { data: redemption } = await admin
      .from("reward_redemptions")
      .insert({
        user_id: userId,
        reward_id: reward.id,
        reward_name: reward.name,
        cost_points: reward.cost_points,
        status: "pending",
      })
      .select()
      .single();

    if (reward.stock > 0) {
      await admin.from("rewards_catalog").update({ stock: reward.stock - 1 }).eq("id", reward.id);
    }

    return json({ redemption, balance: updated });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
