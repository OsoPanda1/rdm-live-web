interface Bucket {
  tokens: number;
  lastRefill: number;
}

interface RateLimitConfig {
  maxTokens: number;
  refillRate: number;
  refillIntervalMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxTokens: 60,
  refillRate: 1,
  refillIntervalMs: 1000,
};

const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string, config: Partial<RateLimitConfig> = {}): { allowed: boolean; remaining: number; resetMs: number } {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket) {
    bucket = { tokens: cfg.maxTokens, lastRefill: now };
    buckets.set(key, bucket);
  }

  const elapsed = now - bucket.lastRefill;
  const refillTokens = Math.floor(elapsed / cfg.refillIntervalMs) * cfg.refillRate;
  if (refillTokens > 0) {
    bucket.tokens = Math.min(cfg.maxTokens, bucket.tokens + refillTokens);
    bucket.lastRefill = now;
  }

  if (bucket.tokens > 0) {
    bucket.tokens--;
    return { allowed: true, remaining: bucket.tokens, resetMs: cfg.refillIntervalMs };
  }

  return { allowed: false, remaining: 0, resetMs: cfg.refillIntervalMs - (now - bucket.lastRefill) };
}

export function createRateLimitMiddleware(config?: Partial<RateLimitConfig>) {
  return (key: string): Response | null => {
    const result = checkRateLimit(key, config);
    if (!result.allowed) {
      return new Response(JSON.stringify({ success: false, error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil(result.resetMs / 1000)),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + result.resetMs),
        },
      });
    }
    return null;
  };
}

const CLEANUP_INTERVAL = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now - bucket.lastRefill > CLEANUP_INTERVAL) {
      buckets.delete(key);
    }
  }
}, CLEANUP_INTERVAL);
