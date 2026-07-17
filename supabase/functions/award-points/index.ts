import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { awardPointsSchema } from "../_shared/validation.ts";
import { checkRateLimit, jsonResponse, corsHeaders } from "../_shared/rate-limit.ts";

const POINTS: Record<string, number> = {
  daily_login: 5,
  visit_place: 10,
  share_post: 25,
  upload_photo: 30,
  review_business: 40,
  complete_route: 75,
  attend_event: 50,
  refer_friend: 100,
  register_business: 200,
  memory_game_complete: 20,
  trivia_game_score_50: 15,
  trivia_game_score_80: 35,
  trivia_game_perfect: 75,
  daily_mining_strike: 10,
  mining_milestone_100: 30,
  mining_milestone_500: 80,
};

const COOLDOWN_SEC: Record<string, number> = {
  daily_login: 60 * 60 * 20,
  visit_place: 60,
  share_post: 30,
  upload_photo: 30,
  review_business: 60,
  complete_route: 300,
  attend_event: 600,
  refer_friend: 86400,
  register_business: 86400,
  memory_game_complete: 300,
  trivia_game_score_50: 300,
  trivia_game_score_80: 300,
  trivia_game_perfect: 86400,
  daily_mining_strike: 86400,
  mining_milestone_100: 86400,
  mining_milestone_500: 86400,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const rateKey = `award-points:${req.headers.get("x-forwarded-for") || "unknown"}`;
    const rl = await checkRateLimit(serviceKey, supabaseUrl, rateKey, { max: 60, windowSec: 60 });
    if (!rl.allowed) {
      return jsonResponse({ error: "Demasiadas solicitudes", retryAfter: rl.retryAfter }, 429);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "missing_auth" }, 401);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return jsonResponse({ error: "invalid_user" }, 401);
    }
    const userId = userData.user.id;

    const parsed = awardPointsSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonResponse({ error: "invalid_action", detail: parsed.error.flatten() }, 400);
    }

    const { action, metadata } = parsed.data;
    const points = POINTS[action];
    const admin = createClient(supabaseUrl, serviceKey);

    const cooldown = COOLDOWN_SEC[action] ?? 30;
    const since = new Date(Date.now() - cooldown * 1000).toISOString();
    const { data: recent } = await admin
      .from("point_transactions")
      .select("id")
      .eq("user_id", userId)
      .eq("action", action)
      .gte("created_at", since)
      .limit(1);

    if (recent && recent.length > 0) {
      return jsonResponse({ error: "cooldown" }, 429);
    }

    const { error: rpcErr } = await admin.rpc("award_points", {
      _user_id: userId,
      _action: action,
      _points: points,
      _metadata: metadata,
    });
    if (rpcErr) {
      return jsonResponse({ error: rpcErr.message }, 500);
    }

    return jsonResponse({ ok: true, action, points });
  } catch (e) {
    return jsonResponse({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});
