// rate-limit.ts — Rate limiter con soporte multi-key (user, IP, route)
// Tabla: rate_limits (key TEXT PK, window_start TIMESTAMPTZ, count INT)
// Tabla: rate_limit_config (categoria TEXT PK, max INT, window_sec INT)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export interface RateLimitConfig {
  max: number;
  windowSec: number;
}

const DEFAULTS: Record<string, RateLimitConfig> = {
  default: { max: 30, windowSec: 60 },
  ia_chat: { max: 30, windowSec: 60 },
  tts_cloud: { max: 10, windowSec: 60 },
  tts_local: { max: 60, windowSec: 60 },
  payments: { max: 5, windowSec: 60 },
  anonymous: { max: 5, windowSec: 60 },
};

/**
 * Build a compound key from category, userId and IP
 */
export function buildKey(category: string, userId: string | null, ip: string | null): string {
  const identity = userId || ip || "unknown";
  return `${category}:${identity}`;
}

/**
 * Extract client IP from request headers (works in Vercel, Supabase, Cloudflare)
 */
export function extractIp(req: Request): string | null {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || req.headers.get("cf-connecting-ip")
    || null;
}

/**
 * Check rate limit for a given key.
 * Returns { allowed: true } or { allowed: false, retryAfter: number }.
 */
export async function checkRateLimit(
  serviceKey: string,
  supabaseUrl: string,
  key: string,
  config?: RateLimitConfig,
): Promise<{ allowed: true } | { allowed: false; retryAfter: number }> {
  const admin = createClient(supabaseUrl, serviceKey);
  const now = new Date().toISOString();
  const effectiveConfig = config || DEFAULTS.default;

  const { data: row } = await admin
    .from("rate_limits")
    .select("key, window_start, count")
    .eq("key", key)
    .maybeSingle();

  if (!row) {
    await admin.from("rate_limits").insert({ key, window_start: now, count: 1 });
    return { allowed: true };
  }

  const windowStart = new Date(row.window_start).getTime();
  const elapsed = Date.now() - windowStart;

  if (elapsed > effectiveConfig.windowSec * 1000) {
    await admin.from("rate_limits").update({ window_start: now, count: 1 }).eq("key", key);
    return { allowed: true };
  }

  if (row.count >= effectiveConfig.max) {
    const retryAfter = Math.ceil((effectiveConfig.windowSec * 1000 - elapsed) / 1000);
    return { allowed: false, retryAfter };
  }

  await admin.from("rate_limits").update({ count: row.count + 1 }).eq("key", key);
  return { allowed: true };
}

/**
 * Shorthand: check rate limit by category, auto-building key from user/IP.
 * userId may be null (anonymous), ip may be null (server-side).
 */
export async function checkRateLimitForRequest(
  serviceKey: string,
  supabaseUrl: string,
  category: string,
  userId: string | null,
  ip: string | null,
): Promise<{ allowed: true } | { allowed: false; retryAfter: number }> {
  const effectiveCategory = userId ? category : "anonymous";
  const config = DEFAULTS[effectiveCategory] || DEFAULTS.default;
  const key = buildKey(effectiveCategory, userId, ip);
  return checkRateLimit(serviceKey, supabaseUrl, key, config);
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function jsonResponse(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function rateLimitResponse(retryAfter: number) {
  return new Response(JSON.stringify({ error: "rate_limit_exceeded", retryAfter }), {
    status: 429,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Retry-After": String(retryAfter),
    },
  });
}
