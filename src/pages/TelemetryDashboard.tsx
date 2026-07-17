import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity, Cpu, Database, Shield, Radio, AlertTriangle, TrendingUp, Users, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FedStatus {
  key: string; name: string; status: "online" | "degraded" | "offline";
  latency_ms: number; metric: string; detail: string;
}

interface HealthSummary {
  online: number; degraded: number; offline: number; total: number;
  avg_latency_ms: number; integrity: number;
}

interface KPI {
  places_active: number; businesses_verified: number; events_upcoming: number;
  premium_active: number; commerce_active: number;
  tracking_events_24h: number; redemptions_24h: number;
}

export default function TelemetryDashboard() {
  const [federations, setFederations] = useState<FedStatus[]>([]);
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [kpis, setKpis] = useState<KPI | null>(null);
  const [alerts, setAlerts] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [healthRes, metricsRes, alertsRes] = await Promise.all([
        supabase.functions.invoke("federation-health"),
        supabase.functions.invoke("metrics-aggregates"),
        supabase.from("system_alerts").select("id", { count: "exact", head: true }).eq("acknowledged", false),
      ]);
      if (healthRes.data) {
        setFederations(healthRes.data.federations ?? []);
        setSummary(healthRes.data.summary ?? null);
      }
      if (metricsRes.data?.kpis) setKpis(metricsRes.data.kpis);
      setAlerts(alertsRes.count ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const statusColor = (s: string) =>
    s === "online" ? "bg-emerald-500" : s === "degraded" ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Radio className="h-8 w-8 text-gold" />
              Telemetría del Nodo Cero
            </h1>
            <p className="text-muted-foreground mt-1">Monitoreo en tiempo real de las 7 federaciones TAMV</p>
          </div>
          <Button variant="outline" onClick={fetchAll} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="glass-gold">
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-emerald-400">{summary.online}</p>
                <p className="text-xs text-muted-foreground">Federaciones Online</p>
              </CardContent>
            </Card>
            <Card className="glass-gold">
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-amber-400">{summary.degraded}</p>
                <p className="text-xs text-muted-foreground">Degradadas</p>
              </CardContent>
            </Card>
            <Card className="glass-gold">
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-red-400">{summary.offline}</p>
                <p className="text-xs text-muted-foreground">Offline</p>
              </CardContent>
            </Card>
            <Card className="glass-gold">
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold">{summary.avg_latency_ms}ms</p>
                <p className="text-xs text-muted-foreground">Latencia Promedio</p>
              </CardContent>
            </Card>
            <Card className="glass-gold">
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-cyan-400">{(summary.integrity * 100).toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Integridad I_TAMV</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-gold">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-electric" />
                Federaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {federations.map((fed) => (
                <div key={fed.key} className="flex items-center justify-between p-3 rounded-lg bg-background/40">
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${statusColor(fed.status)}`} />
                    <div>
                      <p className="text-sm font-medium">{fed.name}</p>
                      <p className="text-xs text-muted-foreground">{fed.metric}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={
                      fed.status === "online" ? "border-emerald-500/30 text-emerald-400" :
                      fed.status === "degraded" ? "border-amber-500/30 text-amber-400" :
                      "border-red-500/30 text-red-400"
                    }>
                      {fed.latency_ms}ms
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-1">{fed.detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {kpis && (
            <Card className="glass-gold">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-electric" />
                  KPIs — Últimas 24h
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: MapPin, label: "Lugares activos", value: kpis.places_active },
                    { icon: Users, label: "Comercios verificados", value: kpis.businesses_verified },
                    { icon: Shield, label: "Premium activas", value: kpis.premium_active },
                    { icon: Database, label: "Eventos tracking", value: kpis.tracking_events_24h },
                  ].map((k) => (
                    <div key={k.label} className="p-3 rounded-lg bg-background/40">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <k.icon className="h-3.5 w-3.5" />
                        <span className="text-xs">{k.label}</span>
                      </div>
                      <p className="text-xl font-bold">{k.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {alerts > 0 && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <span className="text-amber-400 font-medium">{alerts} alerta(s) activa(s) sin reconocer</span>
          </div>
        )}
      </div>
    </div>
  );
}
