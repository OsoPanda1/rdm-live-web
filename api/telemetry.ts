import { corsPreflightResponse, corsJsonResponse } from "./_shared/cors.js";
import { checkRateLimit, RATE_LIMITS } from "./_shared/rate-limit.js";
import { storeTelemetry, isFederated } from "./_shared/telemetry-service";
import type { TelemetryPayload } from "./types";

const NODE_ID = "nodo-cero-001";
const FEDERATION_SCHEMA_COUNT = 7;

export default async function handler(request: Request): Promise<Response> {
  // 0. Preflight CORS
  if (request.method === "OPTIONS") {
    return corsPreflightResponse(request);
  }

  // 1. Rate limiting (edge‑safe)
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const clientIp =
    forwardedFor.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const rateLimit = checkRateLimit(
    `telemetry:${clientIp}`,
    RATE_LIMITS.telemetry.limit,
    RATE_LIMITS.telemetry.windowMs
  );

  if (!rateLimit.allowed) {
    const retrySeconds = Math.max(
      1,
      Math.ceil((rateLimit.retryAfter ?? 0) / 1000)
    );

    return corsJsonResponse(
      request,
      {
        error: "Rate limit exceeded",
        node_id: NODE_ID,
        infra_status: "operational",
        service: "nodo-cero-telemetry",
        edge_timestamp: new Date().toISOString(),
      },
      429,
      {
        "Retry-After": String(retrySeconds),
      }
    );
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
    // 2. GET / HEAD → solo estado del nodo
    if (request.method !== "POST") {
      return corsJsonResponse(request, baseResponse);
    }

    // 3. Parseo robusto de JSON
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return corsJsonResponse(
        request,
        { error: "Invalid JSON", ...baseResponse },
        400
      );
    }

    if (typeof body !== "object" || body === null) {
      return corsJsonResponse(
        request,
        { error: "Invalid payload shape", ...baseResponse },
        400
      );
    }

    const payload = body as Partial<TelemetryPayload>;

    // 4. Validación mínima (puedes reemplazar con Zod)
    const required: (keyof TelemetryPayload)[] = [
      "flows_total",
      "packets_rx",
      "bytes_total",
      "cpu_percent",
      "memory_percent",
      "active_connections",
    ];

    for (const field of required) {
      if (payload[field] === undefined || payload[field] === null) {
        return corsJsonResponse(
          request,
          { error: `Missing ${field}`, ...baseResponse },
          400
        );
      }
    }

    // 5. Persistencia
    const { stored, error } = await storeTelemetry(
      payload as TelemetryPayload,
      NODE_ID
    );

    if (error) {
      console.warn("Telemetry DB error:", error);
      return corsJsonResponse(
        request,
        {
          error: "Telemetry storage error",
          stored: false,
          ...baseResponse,
          infra_status: "error",
        },
        500
      );
    }

    return corsJsonResponse(request, {
      accepted: true,
      stored,
      ...baseResponse,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal Error";

    return corsJsonResponse(
      request,
      {
        error: message,
        ...baseResponse,
        infra_status: "error",
      },
      500
    );
  }
}

export const config = { runtime: "edge" };
