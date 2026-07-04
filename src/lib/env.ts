/**
 * Centralized, type-safe environment access.
 *
 * Rules:
 *  - Frontend code reads ONLY `clientEnv` (VITE_* prefixed).
 *  - Server-only code reads `serverEnv` from a *.server.ts file.
 *  - Never inline `process.env` or `import.meta.env` outside this module.
 */
import { z } from "zod";

const clientSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  VITE_SENTRY_DSN: z.string().url().optional(),
  VITE_POSTHOG_KEY: z.string().min(1).optional(),
  VITE_POSTHOG_HOST: z.string().url().optional(),
  VITE_APP_ENV: z.enum(["development", "preview", "production", "test"]).default("development"),
});

export type ClientEnv = z.infer<typeof clientSchema>;

function parseClient(): ClientEnv {
  const raw = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    VITE_POSTHOG_KEY: import.meta.env.VITE_POSTHOG_KEY,
    VITE_POSTHOG_HOST: import.meta.env.VITE_POSTHOG_HOST,
    VITE_APP_ENV: import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE,
  };
  const parsed = clientSchema.safeParse(raw);
  if (!parsed.success) {
    // Do not import the app logger here: logger imports this env module, so that
    // cycle can throw during module evaluation and leave the root completely
    // blank before React has a chance to render an error boundary.
    console.error("[env] Invalid client env", parsed.error.flatten().fieldErrors);
    return clientSchema.parse({});
  }
  return parsed.data;
}

export const clientEnv: ClientEnv = parseClient();

export const isProd = clientEnv.VITE_APP_ENV === "production";
export const isDev = clientEnv.VITE_APP_ENV === "development";
