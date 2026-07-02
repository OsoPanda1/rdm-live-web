// @ts-nocheck
import { useEffect, useState } from "react";
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Alert = {
  id: string;
  severity: "info" | "warning" | "critical";
  federation_key: string | null;
  title: string;
  message: string;
  acknowledged: boolean;
  created_at: string;
};

const ICON = { info: Info, warning: AlertTriangle, critical: AlertCircle };
const STYLE = {
  info: "border-electric/30 bg-electric/10 text-electric",
  warning: "border-amber-400/40 bg-amber-500/10 text-amber-300",
  critical: "border-red-500/40 bg-red-500/10 text-red-300",
};

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      // trigger engine then read
      await supabase.functions.invoke("alerts-engine").catch(() => {});
      const { data } = await supabase
        .from("system_alerts")
        .select("*")
        .eq("acknowledged", false)
        .order("created_at", { ascending: false })
        .limit(8);
      if (!cancel) setAlerts((data as Alert[]) ?? []);
    };
    load();
    const id = setInterval(load, 20000);
    return () => { cancel = true; clearInterval(id); };
  }, []);

  return (
    <div className="glass-card rounded-2xl p-5 border border-border/20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Centro de Alertas · Umbrales en vivo</h2>
        <span className="text-[10px] font-mono text-muted-foreground/60">latencia &gt; 500ms · integrity &lt; 0.70 · offline &gt; 0</span>
      </div>
      {alerts.length === 0 ? (
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
          <CheckCircle2 className="h-4 w-4" /> Todos los umbrales dentro del rango soberano.
        </div>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => {
            const Icon = ICON[a.severity];
            return (
              <li key={a.id} className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 ${STYLE[a.severity]}`}>
                <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs font-display font-semibold truncate">{a.title}</p>
                    {a.federation_key && <span className="text-[9px] font-mono uppercase tracking-wider opacity-70">{a.federation_key}</span>}
                  </div>
                  <p className="text-[11px] opacity-80 line-clamp-2">{a.message}</p>
                </div>
                <span className="text-[9px] font-mono opacity-60 shrink-0">{new Date(a.created_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}