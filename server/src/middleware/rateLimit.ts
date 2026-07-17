import rateLimit, { type Options } from "express-rate-limit";
import type { Request } from "express";

const baseOptions: Partial<Options> = {
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { ok: false, error: { code: "rate_limited", message: "Too many requests" } },
  keyGenerator: (req: Request) => {
    const userId = (req as Request & { user?: { id?: string } }).user?.id;
    return userId ?? req.ip ?? "anonymous";
  },
};

export const limiters = {
  read: rateLimit({ ...baseOptions, windowMs: 15 * 60_000, max: 300 }),
  write: rateLimit({ ...baseOptions, windowMs: 15 * 60_000, max: 60 }),
  auth: rateLimit({ ...baseOptions, windowMs: 15 * 60_000, max: 10 }),
  heavy: rateLimit({ ...baseOptions, windowMs: 60 * 60_000, max: 30 }),
  serverless: rateLimit({ ...baseOptions, windowMs: 60_000, max: 120 }),
} as const;

export type LimiterName = keyof typeof limiters;
