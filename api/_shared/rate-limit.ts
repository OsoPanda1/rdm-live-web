const hits = new Map<string, { count: number; resetAt: number }>();

export const RATE_LIMITS = {
  SCE_INGEST: { limit: 120, windowMs: 60000 },
  SCE_QUERY: { limit: 300, windowMs: 60000 },
  TAMV_ECONOMY: { limit: 60, windowMs: 60000 },
  ISABELLA_INFERENCE: { limit: 30, windowMs: 60000 },
  YUNBE_JOURNAL: { limit: 60, windowMs: 60000 },
  TELEMETRY_INGEST: { limit: 60, windowMs: 60000 },
  model: { limit: 60, windowMs: 60000 },
  telemetry: { limit: 120, windowMs: 60000 },
} as const;

export function checkRateLimit(
  key: string,
  limit = 60,
  windowMs = 60_000,
): { allowed: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  entry.count++;
  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    retryAfter: entry.count > limit ? Math.max(0, entry.resetAt - now) : undefined,
  };
}
