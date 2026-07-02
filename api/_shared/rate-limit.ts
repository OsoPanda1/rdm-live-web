// api/_shared/rate-limit.ts — Rate limiting para Vercel Serverless/Edge Functions
// In-memory sliding window rate limiter (funciona sin DB para functions individuales)

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
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

export interface RateLimitConfig {
  windowMs: number;    // Ventana de tiempo en ms
  maxRequests: number; // Máximo de requests por ventana
  keyPrefix?: string;  // Prefijo para la key
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Determina la IP del cliente desde headers de proxy.
 */
function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

/**
 * Check rate limit para un request. Retorna resultado y headers para la response.
 */
export function checkRateLimit(
  request: Request,
  config: RateLimitConfig,
): RateLimitResult & { headers: Record<string, string> } {
  cleanup();

  const ip = getClientIp(request);
  const key = `${config.keyPrefix || "api"}:${ip}`;
  const now = Date.now();
  const resetAt = now + config.windowMs;

  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // New window
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

  // Existing window
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
    resetAt: entry.resetAt,
    headers: {
      "X-RateLimit-Limit": String(config.maxRequests),
      "X-RateLimit-Remaining": String(config.maxRequests - entry.count),
      "X-RateLimit-Reset": String(Math.ceil(entry.resetAt / 1000)),
    },
  };
}

/**
 * Preset de rate limits por tipo de endpoint.
 */
export const RATE_LIMITS = {
  /** IA chat endpoints: 20 requests/min */
  ai: { windowMs: 60_000, maxRequests: 20, keyPrefix: "ai" },
  /** TTS endpoints: 30 requests/min */
  tts: { windowMs: 60_000, maxRequests: 30, keyPrefix: "tts" },
  /** Health check: 60 requests/min */
  health: { windowMs: 60_000, maxRequests: 60, keyPrefix: "health" },
  /** Model router: 10 requests/min */
  model: { windowMs: 60_000, maxRequests: 10, keyPrefix: "model" },
  /** Telemetry: 30 requests/min */
  telemetry: { windowMs: 60_000, maxRequests: 30, keyPrefix: "telemetry" },
  /** Default: 60 requests/min */
  default: { windowMs: 60_000, maxRequests: 60, keyPrefix: "default" },
} as const;
