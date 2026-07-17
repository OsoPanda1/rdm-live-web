// api/_shared/rate-limit.js — Rate limiting para Vercel Serverless/Edge Functions
// In-memory sliding window rate limiter (funciona sin DB para functions individuales)

const store = new Map();

const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}

function getClientIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function checkRateLimit(request, config) {
  cleanup();

  const ip = getClientIp(request);
  const key = `${config.keyPrefix || "api"}:${ip}`;
  const now = Date.now();
  const resetAt = now + config.windowMs;

  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
      headers: {
        "X-RateLimit-Limit": String(config.maxRequests),
        "X-RateLimit-Remaining": String(config.maxRequests - 1),
        "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
      },
    };
  }

  entry.count++;

  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter,
      headers: {
        "X-RateLimit-Limit": String(config.maxRequests),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(entry.resetAt / 1000)),
        "Retry-After": String(retryAfter),
      },
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt,
    headers: {
      "X-RateLimit-Limit": String(config.maxRequests),
      "X-RateLimit-Remaining": String(config.maxRequests - entry.count),
      "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
    },
  };
}

export const RATE_LIMITS = {
  ai: { windowMs: 60_000, maxRequests: 20, keyPrefix: "ai" },
  tts: { windowMs: 60_000, maxRequests: 30, keyPrefix: "tts" },
  health: { windowMs: 60_000, maxRequests: 60, keyPrefix: "health" },
  model: { windowMs: 60_000, maxRequests: 10, keyPrefix: "model" },
  telemetry: { windowMs: 60_000, maxRequests: 30, keyPrefix: "telemetry" },
  default: { windowMs: 60_000, maxRequests: 60, keyPrefix: "default" },
};
