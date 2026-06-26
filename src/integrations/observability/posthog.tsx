/**
 * PostHog Provider (React).
 *
 * Wire the project key as VITE_POSTHOG_KEY and (optional) VITE_POSTHOG_HOST.
 * Provider is a transparent passthrough when the key is missing.
 *
 * Lazy-loaded; no network calls until a key exists.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clientEnv } from "@/lib/env";
import { logger } from "@/lib/logger";

type PostHogLike = {
  capture: (event: string, props?: Record<string, unknown>) => void;
  identify: (id: string, props?: Record<string, unknown>) => void;
  reset: () => void;
  opt_out_capturing?: () => void;
};

const noop: PostHogLike = {
  capture: () => {},
  identify: () => {},
  reset: () => {},
};

const PostHogContext = createContext<PostHogLike>(noop);

export function PostHogProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<PostHogLike>(noop);

  useEffect(() => {
    const key = clientEnv.VITE_POSTHOG_KEY;
    if (!key) return; // No key → noop client.

    let cancelled = false;
    (async () => {
      try {
        const mod = await import("posthog-js");
        const posthog = mod.default;
        posthog.init(key, {
          api_host: clientEnv.VITE_POSTHOG_HOST ?? "https://us.i.posthog.com",
          person_profiles: "identified_only",
          capture_pageview: true,
          capture_pageleave: true,
          autocapture: false,
          disable_session_recording: true,
        });
        if (!cancelled) setClient(posthog as unknown as PostHogLike);
      } catch (error) {
        logger.warn("posthog: init skipped", { error: String(error) });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => client, [client]);
  return <PostHogContext.Provider value={value}>{children}</PostHogContext.Provider>;
}

export function usePostHog(): PostHogLike {
  return useContext(PostHogContext);
}

/** Convenience: track a single event without needing the hook. */
export function track(event: string, props?: Record<string, unknown>): void {
  const ph = (globalThis as { posthog?: PostHogLike }).posthog;
  ph?.capture?.(event, props);
}
