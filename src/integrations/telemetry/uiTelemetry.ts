import { logger } from "@/lib/logger";
/**
 * UI Telemetry — structured error & event logging for RDM Digital Hub.
 *
 * Lightweight wrapper that:
 * - Writes structured JSON to console in development.
 * - Can be wired to Sentry or PostHog in production by swapping the transport.
 */

export type UIErrorLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface UIErrorPayload {
  level: UIErrorLevel
  source: string
  message: string
  route?: string
  userId?: string
  details?: Record<string, unknown>
  timestamp?: string
}

type Transport = (payload: UIErrorPayload) => void

let _transport: Transport | null = null

/** Override the transport (e.g. Sentry) before the app mounts. */
export function setUITelemetryTransport(transport: Transport): void {
  _transport = transport
}

/**
 * Log a UI-level error / event.
 * In development: logs to console with colour coding.
 * In production: delegates to the registered transport (if any).
 */
export function logUIError(payload: UIErrorPayload): void {
  const enriched: UIErrorPayload = {
    ...payload,
    timestamp: payload.timestamp ?? new Date().toISOString(),
  }

  if (_transport) {
    try {
      _transport(enriched)
    } catch {
      // swallow transport errors to avoid cascading failures
    }
  }

  // Always log to console in dev; never in production unless no transport.
  if (import.meta.env.DEV || !_transport) {
    const tag = `[rdm:telemetry:${enriched.level}]`
    const msg = `${tag} [${enriched.source}] ${enriched.message}`
    switch (enriched.level) {
      case 'fatal':
      case 'error':
        logger.error(msg, enriched.details)
        break
      case 'warn':
        logger.warn(msg, enriched.details)
        break
      case 'info':
        logger.info(msg, enriched.details)
        break
      default:
        logger.debug(msg, enriched.details)
    }
  }
}

/** Convenience helpers */
export const uiTelemetry = {
  debug: (source: string, message: string, details?: Record<string, unknown>) =>
    logUIError({ level: 'debug', source, message, details }),
  info: (source: string, message: string, details?: Record<string, unknown>) =>
    logUIError({ level: 'info', source, message, details }),
  warn: (source: string, message: string, details?: Record<string, unknown>) =>
    logUIError({ level: 'warn', source, message, details }),
  error: (source: string, message: string, details?: Record<string, unknown>) =>
    logUIError({ level: 'error', source, message, details }),
}

export default uiTelemetry
