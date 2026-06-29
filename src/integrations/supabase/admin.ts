/**
 * DEPRECATED — DO NOT IMPORT.
 *
 * The service-role Supabase client now lives in `admin.server.ts`, which is
 * blocked from the client bundle. This shim throws at import time to surface
 * any lingering frontend references during build/dev.
 *
 * Migration:
 *   - Frontend: use `client.ts` (publishable key).
 *   - Server / Edge Functions: import { getSupabaseAdmin } from "./admin.server";
 */
throw new Error(
  "[supabase/admin] This module is server-only and has moved to admin.server.ts. " +
    "Frontend code must NEVER import the service-role client.",
);
