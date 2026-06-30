// api/telemetry.js — Vercel Edge Function for Nodo Cero telemetry ingestion
// Receives telemetry POSTs from node-core/server_core.py and stores in Supabase

/**
 * @param {Request} request
 */
export default async function handler(request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    if (request.method === "POST") {
      const body = await request.json();

      // Validate required fields
      const requiredFields = ["flows_total", "packets_rx", "bytes_total", "cpu_percent", "memory_percent", "active_connections"];
      for (const field of requiredFields) {
        if (body[field] === undefined) {
          return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // Store in Supabase if URL/key exist
      let stored = false;
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        try {
          const { createClient } = await import("@supabase/supabase-js");
          const supabase = createClient(supabaseUrl, supabaseKey);

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
        } catch (dbError) {
          // Supabase not available — return telemetry without persistence
        }
      }

      return new Response(JSON.stringify({
        accepted: true,
        stored,
        timestamp: new Date().toISOString(),
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (request.method === "GET") {
      // Return latest telemetry or health status
      return new Response(JSON.stringify({
        service: "nodo-cero-telemetry",
        status: "operational",
        timestamp: new Date().toISOString(),
        docs: "POST telemetry data or GET health",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

export const config = {
  runtime: "edge",
};
