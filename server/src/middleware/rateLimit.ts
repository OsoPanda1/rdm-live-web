import type { NextFunction, Request, Response } from "express";
import { sendError } from "./http.js";

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
}

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

function getClientIp(req: Request) {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function sweepExpiredBuckets(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function createRateLimiter(maxRequests: number, windowMs: number, keyPrefix = "api") {
  return createHardenedRateLimiter({ maxRequests, windowMs, keyPrefix });
}

export function createHardenedRateLimiter({ maxRequests, windowMs, keyPrefix = "api" }: RateLimiterOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    sweepExpiredBuckets(now);

    const key = `${keyPrefix}:${getClientIp(req)}:${req.baseUrl}${req.path}`;
    const existing = buckets.get(key);
    const bucket = !existing || existing.resetAt <= now ? { count: 0, resetAt: now + windowMs } : existing;

    bucket.count += 1;
    buckets.set(key, bucket);

    const remaining = Math.max(maxRequests - bucket.count, 0);
    const resetSeconds = Math.ceil((bucket.resetAt - now) / 1000);

    res.setHeader("RateLimit-Limit", String(maxRequests));
    res.setHeader("RateLimit-Remaining", String(remaining));
    res.setHeader("RateLimit-Reset", String(resetSeconds));

    if (bucket.count > maxRequests) {
      res.setHeader("Retry-After", String(resetSeconds));
      return sendError(res, 429, "RATE_LIMIT_EXCEEDED", "Too many requests", {
        maxRequests,
        windowMs,
      });
    }

    return next();
  };
}
