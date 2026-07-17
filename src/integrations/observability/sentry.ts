/**
 * Sentry initialization (client).
 *
 * Wire the DSN as VITE_SENTRY_DSN. Init is a no-op when DSN is missing,
 * so the app degrades gracefully in dev/preview without credentials.
 *
 * Loaded via CDN to avoid broken Sentry npm packages with missing ESM builds.
 */
import { clientEnv, isProd } from "@/lib/env";

type SentryGlobal = {
  init: (opts: Record<string, unknown>) => void;
  browserTracingIntegration?: () => Record<string, unknown>;
  replayIntegration?: (opts?: Record<string, unknown>) => Record<string, unknown>;
  captureException?: (e: unknown, c?: unknown) => void;
};

declare const Sentry: SentryGlobal | undefined;

let initialized = false;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

export async function initSentry(): Promise<void> {
  if (initialized) return;
  const dsn = clientEnv.VITE_SENTRY_DSN;
  if (!dsn) return;
  initialized = true;

  try {
    await loadScript("https://browser.sentry-cdn.com/10.62.0/bundle.tracing.replay.min.js");
    const SentryGlobal = globalThis as { Sentry?: SentryGlobal };
    SentryGlobal.Sentry?.init({
      dsn,
      environment: clientEnv.VITE_APP_ENV,
      tracesSampleRate: isProd ? 0.1 : 1.0,
      replaysSessionSampleRate: isProd ? 0.05 : 0,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        SentryGlobal.Sentry.browserTracingIntegration?.(),
        SentryGlobal.Sentry.replayIntegration?.({ maskAllText: true, blockAllMedia: true }),
      ].filter(Boolean),
      sendDefaultPii: false,
      beforeSend(event) {
        if (event.request?.url) {
          event.request.url = event.request.url.split("?")[0];
        }
        return event;
      },
    });
  } catch {
    initialized = false;
  }
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  const S = (globalThis as { Sentry?: SentryGlobal }).Sentry;
  S?.captureException?.(error, { extra: context });
}
