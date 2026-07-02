import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { merchantPaymentSchema } from "../_shared/validation.ts";
import { checkRateLimit, jsonResponse, corsHeaders } from "../_shared/rate-limit.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const rateKey = `merchant-payment:${req.headers.get("x-forwarded-for") || "unknown"}`;
    const rl = await checkRateLimit(SERVICE_KEY, SUPABASE_URL, rateKey, { max: 5, windowSec: 60 });
    if (!rl.allowed) {
      return jsonResponse({ error: "Demasiadas solicitudes", retryAfter: rl.retryAfter }, 429);
    }

    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const auth = req.headers.get("Authorization");
    if (!auth) return jsonResponse({ error: "Auth required" }, 401);

    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: auth } } });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return jsonResponse({ error: "Invalid session" }, 401);
    const user = userData.user;

    const parsed = merchantPaymentSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonResponse({ error: "Datos inválidos", detail: parsed.error.flatten() }, 400);
    }

    const body = parsed.data;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: category, error: catErr } = await admin
      .from("merchant_categories")
      .select("id, fee_mxn, name, active")
      .eq("id", body.category_id)
      .maybeSingle();
    if (catErr || !category || !category.active) return jsonResponse({ error: "Categoría inválida" }, 400);

    const slug =
      body.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
        .slice(0, 60) + "-" + crypto.randomUUID().slice(0, 6);

    const { data: merch, error: mErr } = await admin
      .from("merchant_registrations")
      .insert({
        owner_id: user.id,
        category_id: category.id,
        name: body.name,
        slug,
        description: body.description,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        phone: body.phone ?? null,
        website: body.website || null,
        main_image: body.main_image || null,
        tags: body.tags ?? [],
        status: "awaiting_payment",
      })
      .select()
      .single();
    if (mErr) return jsonResponse({ error: mErr.message }, 500);

    const provider = Deno.env.get("MERCHANT_PAYMENT_PROVIDER") ?? "manual";
    const sessionId = crypto.randomUUID();

    const { data: payment, error: pErr } = await admin
      .from("merchant_payments")
      .insert({
        merchant_id: merch.id,
        owner_id: user.id,
        provider,
        provider_session_id: sessionId,
        amount_mxn: category.fee_mxn,
        currency: "mxn",
        status: "pending",
      })
      .select()
      .single();
    if (pErr) return jsonResponse({ error: pErr.message }, 500);

    const baseUrl = req.headers.get("origin") ?? "https://example.com";
    const checkoutUrl = `${baseUrl}/comercios/checkout?session=${sessionId}&merchant=${merch.id}`;

    return jsonResponse({
      merchant_id: merch.id,
      payment_id: payment.id,
      session_id: sessionId,
      amount_mxn: category.fee_mxn,
      category: category.name,
      checkout_url: checkoutUrl,
      provider,
    });
  } catch (e) {
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
