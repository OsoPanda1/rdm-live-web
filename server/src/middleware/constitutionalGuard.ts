import type { NextFunction, Request, Response } from "express";
import { emitMsrEvent } from "../services/audit.service.js";

/**
 * Constitutional middleware: gates every mutation (POST/PUT/PATCH/DELETE)
 * against a domain allowlist. Read operations (GET/HEAD/OPTIONS) pass through.
 *
 * Decisions are appended to the MSR audit trail with a SHA-256-friendly
 * payload so the Decision Engine can rehydrate them later.
 */
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Domains that explicitly opt-in to mutations from authenticated clients.
 * Anything outside this list returns 403 with a constitutional reason.
 */
const ALLOWED_MUTATION_DOMAINS = new Set([
  "auth",
  "profiles",
  "users",
  "donations",
  "merchants",
  "businesses",
  "social",
  "economy",
  "protocols",
  "experience",
  "realito",
  "ai",
  "geolocation",
  "tamv",
  "tenochtitlan",
  "audit",
]);

export function constitutionalGuard(req: Request, res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method)) return next();

  // /api/<domain>/...
  const segments = req.path.split("/").filter(Boolean);
  const domain = segments[0] ?? "unknown";

  if (!ALLOWED_MUTATION_DOMAINS.has(domain)) {
    emitMsrEvent({
      layer: "L5",
      category: "constitutional.denied",
      summary: `Mutación bloqueada en dominio no permitido: ${domain}`,
      payload: { method: req.method, path: req.path },
    });
    return res.status(403).json({
      code: "CONSTITUTIONAL_VIOLATION",
      message: `Domain '${domain}' is not authorized for ${req.method} operations`,
      policy: "domain-allowlist@v1",
    });
  }

  emitMsrEvent({
    layer: "L5",
    category: "constitutional.allowed",
    summary: `Mutación permitida en ${domain}`,
    payload: { method: req.method, path: req.path },
  });

  return next();
}
