export const config = { runtime: "edge" };

import { getCorsHeaders, handleCors } from "../_shared/cors";
import { checkRateLimit } from "../_shared/rate-limit";

export default async function handler(req: Request): Promise<Response> {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = checkRateLimit(`health:${ip}`, 30, 60_000);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers: { "content-type": "application/json", ...getCorsHeaders(req.headers.get("origin")) },
    });
  }

  const federations = ["ANUBIS", "MDD_TAMV", "BOOKPI", "PHOENIX", "KAOS", "CHRONOS", "DEKATEOTL"];

  return new Response(
    JSON.stringify({
      ok: true,
      message: "RDM Digital Hub — LTOS health-check alive",
      timestamp: new Date().toISOString(),
      federations: federations.length,
      version: "1.0.0",
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
        ...getCorsHeaders(req.headers.get("origin")),
      },
    },
  );
}
