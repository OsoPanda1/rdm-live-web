import { corsPreflightResponse, corsJsonResponse } from "./_shared/cors";
import { checkRateLimit, RATE_LIMITS } from "./_shared/rate-limit";
import { storeTelemetry, isFederated } from "./_shared/telemetry-service";
import { TelemetryPayload } from "./types";

const NODE_ID = "nodo-cero-001";
const FEDERATION_SCHEMA_COUNT = 7;

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return corsPreflightResponse(request);

  // 1. Rate Limiting
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rateLimit = checkRateLimit(`telemetry:${clientIp}`, RATE_LIMITS.telemetry.limit, RATE_LIMITS.telemetry.windowMs);
  
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: { "Retry-After": String(Math.ceil((rateLimit.retryAfter ?? 0) / 1000)) }
    });
  }

  const baseResponse = {
    infra_status: "operational" as const,
    node_id: NODE_ID,
    federation_schema_count: FEDERATION_SCHEMA_COUNT,
    topology_state: isFederated ? "FEDERATED_ACTIVE" : "STANDALONE_MODAL",
    edge_timestamp: new Date().toISOString(),
    service: "nodo-cero-telemetry",
  };

  try {
    if (request.method !== "POST") return corsJsonResponse(request, baseResponse);

    const body = await request.json().catch(() => null);
    if (!body) return corsJsonResponse(request, { error: "Invalid JSON", ...baseResponse }, 400);

    // 2. Validación simple (puedes usar Zod aquí para mayor robustez)
    const required: (keyof TelemetryPayload)[] = ["flows_total", "packets_rx", "bytes_total", "cpu_percent", "memory_percent", "active_connections"];
    for (const field of required) {
      if (body[field] === undefined) {
        return corsJsonResponse(request, { error: `Missing ${field}`, ...baseResponse }, 400);
      }
    }

    // 3. Persistencia
    const { stored, error } = await storeTelemetry(body as TelemetryPayload, NODE_ID);
    if (error) console.warn("DB Log:", error);

    return corsJsonResponse(request, { accepted: true, stored, ...baseResponse });

  } catch (err) {
    return corsJsonResponse(request, { error: err instanceof Error ? err.message : "Internal Error", ...baseResponse, infra_status: "error" }, 500);
  }
}

export const config = { runtime: "edge" };
