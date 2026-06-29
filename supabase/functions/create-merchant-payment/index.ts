// Crea un registro de comercio en estado awaiting_payment y devuelve URL de checkout.
// Provider-agnostic: si MERCHANT_PAYMENT_PROVIDER_URL está configurado, lo usa;
// si no, devuelve un checkout interno (modo dev/manual).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  category_id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  main_image?: string;
  tags?: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Auth required" }, 401);

    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: auth } } });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Invalid session" }, 401);
    const user = userData.user;

    const body: Body = await req.json();
    const required = ["category_id", "name", "description", "address", "latitude", "longitude"];
    for (const k of required) {
      if (body[k as keyof Body] === undefined || body[k as keyof Body] === "") {
        return json({ error: `Falta el campo ${k}` }, 400);
      }
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: category, error: catErr } = await admin
      .from("merchant_categories")
      .select("id, fee_mxn, name, active")
      .eq("id", body.category_id)
      .maybeSingle();
    if (catErr || !category || !category.active) return json({ error: "Categoría inválida" }, 400);

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
        website: body.website ?? null,
        main_image: body.main_image ?? null,
        tags: body.tags ?? [],
        status: "awaiting_payment",
      })
      .select()
      .single();
    if (mErr) return json({ error: mErr.message }, 500);

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
    if (pErr) return json({ error: pErr.message }, 500);

    // checkout_url: en modo manual devolvemos página interna; cuando se conecte Stripe/Paddle,
    // aquí se hace fetch al proveedor con amount = category.fee_mxn * 100.
    const baseUrl = req.headers.get("origin") ?? "https://example.com";
    const checkoutUrl = `${baseUrl}/comercios/checkout?session=${sessionId}&merchant=${merch.id}`;

    return json({
      merchant_id: merch.id,
      payment_id: payment.id,
      session_id: sessionId,
      amount_mxn: category.fee_mxn,
      category: category.name,
      checkout_url: checkoutUrl,
      provider,
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }

  function json(obj: unknown, status = 200) {
    return new Response(JSON.stringify(obj), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
