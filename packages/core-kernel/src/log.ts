// packages/core-kernel/src/log.ts

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = {
  module: string; // ej: "ai-core", "territorial-twin"
  federation?: string; // ej: "economy", "culture"
  route?: string; // ej: "/api/places"
  userType?: "anon" | "visitor" | "merchant" | "admin";
  correlationId?: string;
  // Permite campos adicionales (ej: ids, métricas puntuales).
  [key: string]: unknown;
};

const DEFAULT_CONTEXT: LogContext = { module: "unknown" };

// Campos que nunca deben loguearse en claro
const SENSITIVE_KEYS = [
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "apiKey",
  "creditCard",
  "cardNumber",
];

/**
 * Sanitiza objetos para evitar que se escriban secretos en logs.[web:676][web:678]
 */
function sanitize(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map(sanitize);
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const clone: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (SENSITIVE_KEYS.includes(k)) {
        clone[k] = "***redacted***";
      } else {
        clone[k] = sanitize(v);
      }
    }
    return clone;
  }

  return value;
}

export function log(
  level: LogLevel,
  message: string,
  ctx?: LogContext,
  extra?: unknown,
) {
  const mergedCtx = ctx ?? DEFAULT_CONTEXT;

  const sanitizedCtx = sanitize(mergedCtx) as Record<string, unknown>;
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...sanitizedCtx,
    extra: sanitize(extra),
  };

  // En producción podrías enrutar esto a un collector en lugar de console.log.
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload));
}

export const logger = {
  debug: (msg: string, ctx?: LogContext, extra?: unknown) =>
    log("debug", msg, ctx, extra),
  info: (msg: string, ctx?: LogContext, extra?: unknown) =>
    log("info", msg, ctx, extra),
  warn: (msg: string, ctx?: LogContext, extra?: unknown) =>
    log("warn", msg, ctx, extra),
  error: (msg: string, ctx?: LogContext, extra?: unknown) =>
    log("error", msg, ctx, extra),
};
