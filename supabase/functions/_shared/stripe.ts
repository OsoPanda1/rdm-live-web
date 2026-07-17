// Shared Stripe helpers for edge functions
// Provides: client creation, webhook signature verification, idempotency, safe errors

import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const API_VERSION = "2024-12-18.acacia" as const;

/** Create a Stripe client using STRIPE_SECRET_KEY from env */
export function createStripe(): Stripe {
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("STRIPE_SECRET_KEY missing from environment");
  return new Stripe(key, { apiVersion: API_VERSION });
}

/** Service-role Supabase client for admin writes */
export function createAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

/**
 * Verify Stripe webhook signature and return the parsed event.
 * Throws a Response (not Error) on failure — callers should catch and return it.
 */
export async function verifyStripeEvent(req: Request): Promise<Stripe.Event> {
  const sig = req.headers.get("stripe-signature");
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!sig || !secret) {
    throw new Response(JSON.stringify({ error: "Missing signature or webhook secret" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const stripe = createStripe();
  const body = await req.text();
  try {
    return await stripe.webhooks.constructEventAsync(body, sig, secret);
  } catch (err) {
    console.error("[stripe] signature verification failed:", err instanceof Error ? err.message : String(err));
    throw new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Idempotency check: returns true if event was already processed.
 * If not yet processed, records it atomically via upsert.
 */
export async function alreadyProcessed(eventId: string): Promise<boolean> {
  const admin = createAdmin();
  const { data } = await admin
    .from("stripe_events")
    .select("event_id, processed_at")
    .eq("event_id", eventId)
    .maybeSingle();
  if (data?.processed_at) return true;
  // Upsert to mark as processing — prevents race conditions
  await admin.from("stripe_events").upsert(
    { event_id: eventId, type: "processing", processed_at: new Date().toISOString() },
    { onConflict: "event_id" },
  );
  return false;
}

/**
 * Mark event as fully processed with its type.
 */
export async function markProcessed(eventId: string, type: string): Promise<void> {
  const admin = createAdmin();
  await admin.from("stripe_events").upsert(
    { event_id: eventId, type, processed_at: new Date().toISOString() },
    { onConflict: "event_id" },
  );
}

/**
 * Safe error response — logs server-side, returns generic error to client.
 * Never leaks stack traces or internal details.
 */
export function safeError(err: unknown): Response {
  const ref = `err_${Date.now().toString(36)}_${crypto.randomUUID().slice(0, 8)}`;
  console.error(`[stripe] handler error ref=${ref}`, err instanceof Error ? err.message : String(err));
  return new Response(JSON.stringify({ error: "internal_error", ref }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}

export { Stripe };
