import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { checkRateLimit, jsonResponse, corsHeaders } from "../_shared/rate-limit.ts";

const ENERGY_MAX = 100;
const ENERGY_COST = 5;
const ENERGY_REGEN_SECONDS = 30;

const MINERALS = [
  { key: "carbon", weight: 50, min: 2, max: 6, points: 1 },
  { key: "cuarzo", weight: 28, min: 1, max: 4, points: 3 },
  { key: "plata", weight: 16, min: 1, max: 3, points: 10 },
  { key: "oro", weight: 6, min: 1, max: 2, points: 25 },
] as const;

function pickMineral() {
  const total = MINERALS.reduce((s, m) => s + m.weight, 0);
  let r = Math.random() * total;
  for (const m of MINERALS) {
    if (r < m.weight) return m;
    r -= m.weight;
  }
  return MINERALS[0];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const rateKey = `rdm-mine:${req.headers.get("x-forwarded-for") || "unknown"}`;
    const rl = await checkRateLimit(SERVICE_KEY, SUPABASE_URL, rateKey, { max: 30, windowSec: 60 });
    if (!rl.allowed) {
      return jsonResponse({ error: "Demasiadas solicitudes de minería", retryAfter: rl.retryAfter }, 429);
    }

    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const auth = req.headers.get("Authorization");
    if (!auth) return jsonResponse({ error: "Auth required" }, 401);

    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: auth } } });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return jsonResponse({ error: "Invalid session" }, 401);
    const userId = userData.user.id;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: membership } = await admin
      .from("game_memberships")
      .select("status, current_period_end")
      .eq("user_id", userId)
      .maybeSingle();

    const active =
      membership?.status === "active" &&
      membership?.current_period_end &&
      new Date(membership.current_period_end) > new Date();

    if (!active) {
      return jsonResponse({ error: "membership_required", message: "Activa tu membresía minera (129 MXN/mes) para minar." }, 402);
    }

    let { data: balance } = await admin
      .from("mineral_balances")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!balance) {
      const { data: created } = await admin
        .from("mineral_balances")
        .insert({ user_id: userId })
        .select()
        .single();
      balance = created;
    }

    const now = Date.now();
    const last = new Date(balance.energy_updated_at).getTime();
    const regen = Math.floor((now - last) / 1000 / ENERGY_REGEN_SECONDS);
    let energy = Math.min(ENERGY_MAX, balance.energy + Math.max(0, regen));

    if (energy < ENERGY_COST) {
      return jsonResponse({
        error: "no_energy",
        message: "Sin energía. Espera a que se regenere el pico.",
        energy,
        energy_max: ENERGY_MAX,
      }, 429);
    }

    const m = pickMineral();
    const amount = Math.floor(Math.random() * (m.max - m.min + 1)) + m.min;
    const pointsGained = amount * m.points;
    energy -= ENERGY_COST;

    const update: Record<string, unknown> = {
      energy,
      energy_updated_at: new Date().toISOString(),
      puntos: balance.puntos + pointsGained,
      total_mined: balance.total_mined + amount,
    };
    update[m.key] = Number(balance[m.key]) + amount;

    const { data: updated, error: upErr } = await admin
      .from("mineral_balances")
      .update(update)
      .eq("user_id", userId)
      .select()
      .single();
    if (upErr) return jsonResponse({ error: upErr.message }, 500);

    await admin.from("mining_events").insert({
      user_id: userId,
      mineral: m.key,
      amount,
      points: pointsGained,
    });

    return jsonResponse({
      mined: { mineral: m.key, amount, points: pointsGained },
      balance: updated,
      energy_max: ENERGY_MAX,
    });
  } catch (e) {
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
