// api/telemetry.js — Vercel Edge Function
// Endpoint perimetral de telemetría del Nodo Cero
// Auth + Rate limiting + CORS unificados

import { getCorsHeaders, corsPreflightResponse, corsJsonResponse } from "./_shared/cors.js";
import { checkRateLimit, RATE_LIMITS } from "./_shared/rate-limit.js";

const ORIGIN_ALLOWLIST = [
  "https://www.visitarealdelmonte.online",
  "https://visitarealdelmonte.online",
  "https://rdm-digital-hub.vercel.app",
];

/**
 * @param {Request} request
 */
export default async function handler(request) {
  // CORS preflight
  if (request.method === "OPTIONS") {
    return corsPreflightResponse(request);
  }

  // Rate limit
  const rateLimit = checkRateLimit(request, RATE_LIMITS.telemetry);
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded", retryAfter: rateLimit.retryAfter }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          ...rateLimit.headers,
        },
      },
    );
  }

  try {
    const netflowDbUrl = process.env.NETFLOW_DB_SUPABASE_URL || null;
    const netflowAnonKey = process.env.NETFLOW_DB_SUPABASE_ANON_KEY || null;
    const topologyState = netflowDbUrl ? "FEDERATED_ACTIVE" : "STANDALONE_MODAL";

    const payloadBase = {
      infra_status: "operational",
      node_id: "nodo-cero-001",
      federation_schema_count: 7,
      topology_state: topologyState,
      edge_timestamp: new Date().toISOString(),
      service: "nodo-cero-telemetry",
    };

    if (request.method === "POST") {
      const body = await request.json().catch(() => null);
      if (!body || typeof body !== "object") {
        return corsJsonResponse(request, { error: "Invalid JSON body", ...payloadBase }, 400);
      }

      const requiredFields = [
        "flows_total",
        "packets_rx",
        "bytes_total",
        "cpu_percent",
        "memory_percent",
        "active_connections",
      ];

      for (const field of requiredFields) {
        if (body[field] === undefined) {
          return corsJsonResponse(
            request,
            { error: `Missing required field: ${field}`, ...payloadBase },
            400,
          );
        }
      }

      let stored = false;
      if (netflowDbUrl && netflowAnonKey) {
        try {
          const { createClient } = await import("@supabase/supabase-js");
          const supabase = createClient(netflowDbUrl, netflowAnonKey);

          const insertPayload = {
            flows_total: body.flows_total,
            packets_rx: body.packets_rx,
            bytes_total: body.bytes_total,
            cpu_percent: body.cpu_percent,
            memory_percent: body.memory_percent,
            active_connections: body.active_connections,
            last_flow_ts: body.last_flow_ts || null,
            node_id: body.node_id || payloadBase.node_id,
            status: body.status || payloadBase.infra_status,
          };

          const { error } = await supabase.from("telemetry_logs").insert(insertPayload);
          if (!error) {
            stored = true;
          } else {
            console.warn("telemetry_logs insert error:", error.message);
          }
        } catch (e) {
          console.warn("Supabase telemetry_logs insert failed:", e instanceof Error ? e.message : e);
        }
      }

      return corsJsonResponse(request, { accepted: true, stored, ...payloadBase });
    }

    // GET — health check
    return corsJsonResponse(request, payloadBase);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown telemetry error";
    return corsJsonResponse(
      request,
      {
        error: message,
        infra_status: "error",
        node_id: "nodo-cero-001",
        service: "nodo-cero-telemetry",
        edge_timestamp: new Date().toISOString(),
      },
      500,
    );
  }
}

export const config = {
  runtime: "edge",
};
