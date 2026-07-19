import { createClient } from "@supabase/supabase-js";
import { TelemetryPayload } from "./types";

const netflowDbUrl = process.env.NETFLOW_DB_SUPABASE_URL;
const netflowAnonKey = process.env.NETFLOW_DB_SUPABASE_ANON_KEY;

export const isFederated = !!(netflowDbUrl && netflowAnonKey);

export async function storeTelemetry(data: TelemetryPayload, defaultNodeId: string) {
  if (!isFederated) return { stored: false };

  const supabase = createClient(netflowDbUrl!, netflowAnonKey!);
  
  const { error } = await supabase.from("telemetry_logs").insert({
    ...data,
    node_id: data.node_id || defaultNodeId,
    status: data.status || "operational",
  });

  return { stored: !error, error: error?.message };
}
