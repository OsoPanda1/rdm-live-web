/**
 * Sentry initialization (client).
 *
 * Wire the DSN as VITE_SENTRY_DSN. Init is a no-op when DSN is missing,
 * so the app degrades gracefully in dev/preview without credentials.
 *
 * Lazy-loaded to keep Sentry out of the initial bundle.
 */
import { clientEnv, isProd } from "@/lib/env";

let initialized = false;

export async function initSentry(): Promise<void> {
  if (initialized) return;
  const dsn = clientEnv.VITE_SENTRY_DSN;
  if (!dsn) return; // No DSN → silent no-op (dev/preview without secrets).
  initialized = true;

  try {
    const Sentry = await import("@sentry/react");
    Sentry.init({
      dsn,
      environment: clientEnv.VITE_APP_ENV,
      tracesSampleRate: isProd ? 0.1 : 1.0,
      replaysSessionSampleRate: isProd ? 0.05 : 0,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
      ],
      sendDefaultPii: false,
      beforeSend(event) {
        // Strip query strings that may carry tokens.
        if (event.request?.url) {
          event.request.url = event.request.url.split("?")[0];
        }
        return event;
      },
    });
    // Expose for the central logger to forward errors.
    (globalThis as { Sentry?: unknown }).Sentry = Sentry;
  } catch {
    // Package not installed yet; ignore.
    initialized = false;
  }
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  const Sentry = (globalThis as { Sentry?: { captureException?: (e: unknown, c?: unknown) => void } })
    .Sentry;
  Sentry?.captureException?.(error, { extra: context });
}
