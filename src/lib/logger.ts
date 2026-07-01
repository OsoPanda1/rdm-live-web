/**
 * Centralized structured logger.
 *
 * - JSON output in production (machine-parseable, Cloudflare/Sentry friendly).
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

const MIN_LEVEL: Level = clientEnv.VITE_APP_ENV === "production" ? "info" : "debug";

function shouldEmit(level: Level): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[MIN_LEVEL];
}

interface SentryLike {
  captureException?: (e: unknown, ctx?: unknown) => void;
  captureMessage?: (m: string, ctx?: unknown) => void;
}

function getSentry(): SentryLike | undefined {
  if (typeof globalThis === "undefined") return undefined;
  return (globalThis as { Sentry?: SentryLike }).Sentry;
}

function emit(level: Level, message: string, context?: LogContext): void {
  if (!shouldEmit(level)) return;

  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    env: clientEnv.VITE_APP_ENV,
    ...context,
  };

  const isProd = clientEnv.VITE_APP_ENV === "production";
  const payload = isProd ? JSON.stringify(entry) : entry;

  // eslint-disable-next-line no-console
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
  debug: (msg: string, ctx?: LogContext) => emit("debug", msg, ctx),
  info: (msg: string, ctx?: LogContext) => emit("info", msg, ctx),
  warn: (msg: string, ctx?: LogContext) => emit("warn", msg, ctx),
  error: (msg: string, ctx?: LogContext) => emit("error", msg, ctx),
};
