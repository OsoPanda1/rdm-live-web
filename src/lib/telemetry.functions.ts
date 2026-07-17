import { createServerFn } from "@tanstack/react-start";

export const getTelemetryPulses = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("telemetry_pulses")
    .select("id, federation, pulse_type, value, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return { pulses: [] as Array<{ id: string; federation: string; pulse_type: string; value: number; created_at: string }> };
  return { pulses: data ?? [] };
});
