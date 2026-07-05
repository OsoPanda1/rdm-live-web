const hits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  limit = 60,
  windowMs = 60_000,
): { allowed: boolean; remaining: number } {
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
  };
}
