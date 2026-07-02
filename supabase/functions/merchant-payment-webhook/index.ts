// Webhook universal para confirmar pago de comercios.
// Marca merchant_payments.status='succeeded' -> el trigger publica el comercio.
// Auth: header X-Webhook-Secret debe coincidir con MERCHANT_WEBHOOK_SECRET.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const expected = Deno.env.get("MERCHANT_WEBHOOK_SECRET");
  const provided = req.headers.get("x-webhook-secret");
  if (expected && provided !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  let payload: any = {};
  try { payload = await req.json(); } catch { /* ignore */ }

  const sessionId: string | undefined =
    payload.session_id ?? payload.data?.session_id ?? payload.checkout?.id;
  const status: string = (payload.status ?? payload.event_type ?? "succeeded").toString();
  const providerPaymentId: string | undefined =
    payload.payment_id ?? payload.data?.transaction_id ?? payload.id;

  if (!sessionId) {
    return new Response(JSON.stringify({ error: "session_id missing" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const newStatus = /succe|paid|completed/i.test(status) ? "succeeded"
    : /fail|cancel/i.test(status) ? "failed"
    : /refund/i.test(status) ? "refunded"
    : "pending";

  const { data, error } = await admin
    .from("merchant_payments")
    .update({
      status: newStatus,
      provider_payment_id: providerPaymentId ?? null,
      webhook_payload: payload,
    })
    .eq("provider_session_id", sessionId)
    .select()
    .maybeSingle();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, status: newStatus, payment: data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
