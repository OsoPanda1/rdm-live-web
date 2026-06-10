export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = {
  module: string;
  federation?: string;
  route?: string;
  userType?: "anon" | "visitor" | "merchant" | "admin";
  correlationId?: string;
  [key: string]: unknown;
};

export function log(
  level: LogLevel,
  message: string,
  ctx: LogContext = { module: "unknown" },
  extra?: unknown,
) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...ctx,
    extra,
  };

  console.log(JSON.stringify(payload));
}

export const logger = {
  debug: (msg: string, ctx?: LogContext, extra?: unknown) => log("debug", msg, ctx, extra),
  info: (msg: string, ctx?: LogContext, extra?: unknown) => log("info", msg, ctx, extra),
  warn: (msg: string, ctx?: LogContext, extra?: unknown) => log("warn", msg, ctx, extra),
  error: (msg: string, ctx?: LogContext, extra?: unknown) => log("error", msg, ctx, extra),
};
