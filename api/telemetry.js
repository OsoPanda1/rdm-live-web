// api/telemetry.js — Vercel Edge Function
// DOCUMENTO MAESTRO INTERCONECTADO DE SOBERANÍA DIGITAL — Capítulo IV
// Endpoint Perimetral de Telemetría del Nodo Cero
// Cabeceras defensivas: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, CORS
// Cache-Control: no-store, max-age=0, must-revalidate

/**
 * @param {Request} request
 */
export default async function handler(request) {
  // --- Cabeceras defensivas (Capítulo IV) ---
  const defensiveHeaders = {
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cache-Control": "no-store, max-age=0, must-revalidate",
    "Access-Control-Allow-Origin": "https://www.visitarealdelmonte.online",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  // Handle preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: defensiveHeaders });
  }

  try {
    // --- Determinar topology_state ---
    const netflowDbUrl = process.env.NETFLOW_DB_SUPABASE_URL;
    const topologyState = netflowDbUrl ? "FEDERATED_ACTIVE" : "STANDALONE_MODAL";

    // --- Construir respuesta soberana ---
    const payload = {
      infra_status: "operational",
      node_id: "nodo-cero-001",
      federation_schema_count: 7,
      topology_state: topologyState,
      edge_timestamp: new Date().toISOString(),
      service: "nodo-cero-telemetry",
    };

    if (request.method === "POST") {
      const body = await request.json();
      const requiredFields = [
        "flows_total", "packets_rx", "bytes_total",
        "cpu_percent", "memory_percent", "active_connections",
      ];
      for (const field of requiredFields) {
        if (body[field] === undefined) {
          return new Response(
            JSON.stringify({ error: `Missing required field: ${field}`, ...payload }),
            { status: 400, headers: defensiveHeaders },
          );
        }
      }

      // Store in Supabase if NETFLOW_DB_ credentials exist
      let stored = false;
      if (netflowDbUrl && process.env.NETFLOW_DB_SUPABASE_ANON_KEY) {
        try {
          const { createClient } = await import("@supabase/supabase-js");
          const supabase = createClient(netflowDbUrl, process.env.NETFLOW_DB_SUPABASE_ANON_KEY);
          const { error } = await supabase.from("telemetry_logs").insert({
            flows_total: body.flows_total,
            packets_rx: body.packets_rx,
            bytes_total: body.bytes_total,
            cpu_percent: body.cpu_percent,
            memory_percent: body.memory_percent,
            active_connections: body.active_connections,
            last_flow_ts: body.last_flow_ts || null,
            node_id: body.node_id || "nodo-cero-001",
            status: body.status || "operational",
          });
          if (!error) stored = true;
        } catch (_) {
          // Supabase no disponible — responder sin persistencia
        }
      }

      return new Response(
        JSON.stringify({ accepted: true, stored, ...payload }),
        { status: 200, headers: defensiveHeaders },
      );
    }

    // GET — health check
    return new Response(JSON.stringify(payload), { status: 200, headers: defensiveHeaders });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message, infra_status: "error", node_id: "nodo-cero-001" }),
      { status: 500, headers: defensiveHeaders },
    );
  }
}

export const config = {
  runtime: "edge",
};
