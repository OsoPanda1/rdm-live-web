/**
 * Centralized structured logger.
 *
 * - JSON output in production (machine-parseable, Sentry friendly).
 * - Pretty output in dev.
 * - Forwards errors to Sentry if available on window/globalThis.
 *
 * Replace all `console.log` / `console.error` with `logger.*`.
 */
import { clientEnv } from "./env";

type Level = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

type LogInput = LogContext | string | number | boolean | Error | null | undefined | unknown;

function normalizeCtx(input?: LogInput, extra?: LogInput): LogContext | undefined {
  if (input == null && extra == null) return undefined;
  const out: LogContext = {};
  if (input instanceof Error) out.error = input;
  else if (typeof input === "object" && input !== null) Object.assign(out, input as LogContext);
  else if (input !== undefined) out.detail = input;
  if (extra !== undefined) {
    if (typeof extra === "object" && extra !== null && !(extra instanceof Error)) {
      Object.assign(out, extra as LogContext);
    } else {
      out.extra = extra;
    }
  }
  return out;
}

const LEVEL_ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

function getMinLevel(): Level {
  try {
    return clientEnv?.VITE_APP_ENV === "production" ? "info" : "debug";
  } catch {
    return "debug";
  }
}

function shouldEmit(level: Level): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[getMinLevel()];
}

interface SentryLike {
  captureException?: (e: unknown, ctx?: unknown) => void;
  captureMessage?: (m: string, ctx?: unknown) => void;
}

function getSentry(): SentryLike | undefined {
  if (typeof globalThis === "undefined") return undefined;
  return (globalThis as { Sentry?: SentryLike }).Sentry;
}

function emit(level: Level, message: string, ctxInput?: LogInput, extra?: LogInput): void {
  if (!shouldEmit(level)) return;
  const context = normalizeCtx(ctxInput, extra);

  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    env: clientEnv.VITE_APP_ENV,
    ...(context ?? {}),
  };

  const isProd = clientEnv.VITE_APP_ENV === "production";
  const payload = isProd ? JSON.stringify(entry) : entry;

  const sink = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  sink(payload);

  if (level === "error") {
    const sentry = getSentry();
    const err = context?.error;
    if (err instanceof Error) {
      sentry?.captureException?.(err, { extra: context });
    } else {
      sentry?.captureMessage?.(message, { extra: context });
    }
  }
}

export const logger = {
  debug: (msg: string, ctx?: LogInput, extra?: LogInput) => emit("debug", msg, ctx, extra),
  info: (msg: string, ctx?: LogInput, extra?: LogInput) => emit("info", msg, ctx, extra),
  warn: (msg: string, ctx?: LogInput, extra?: LogInput) => emit("warn", msg, ctx, extra),
  error: (msg: string, ctx?: LogInput, extra?: LogInput) => emit("error", msg, ctx, extra),
};
