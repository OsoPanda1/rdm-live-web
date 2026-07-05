import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHero } from "@/components/site/PageHero";
import {
  getUnifiedFederationHealth,
  initEventBusBridge,
} from "@/core/yun/event-bus-bridge";
import { federationBus } from "@/federaciones/FederationBus";
import {
  runHealthCheck,
} from "@/core/yun/observability";
import {
  Shield,
  Activity,
  Zap,
  Globe,
  Database,
  Cpu,
  Heart,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/federacion")({
  head: () => ({
    meta: [{ title: "Federaciones · RDM Digital Hub" }],
  }),
  component: FederacionDashboard,
});

interface FederationStatus {
  tamvId: string;
  yunFederation: string;
  name: string;
  status: string;
  health: number;
  specialty: string;
}

interface SystemHealth {
  eventBus: boolean;
  rateLimiter: boolean;
  circuitBreakers: boolean;
  logging: boolean;
}

const FEDERATION_ICONS: Record<string, React.ReactNode> = {
  DEKATEOTL: <Database className="w-5 h-5" />,
  ANUBIS: <Cpu className="w-5 h-5" />,
  BOOKPI_DATAGIT: <Shield className="w-5 h-5" />,
  PHOENIX: <Activity className="w-5 h-5" />,
  MDD_TAMV: <Zap className="w-5 h-5" />,
  KAOS_HYPERRENDER: <Globe className="w-5 h-5" />,
  CHRONOS: <Heart className="w-5 h-5" />,
};

const FEDERATION_COLORS: Record<string, string> = {
  DEKATEOTL: "from-violet-500 to-purple-600",
  ANUBIS: "from-amber-500 to-orange-600",
  BOOKPI_DATAGIT: "from-emerald-500 to-teal-600",
  PHOENIX: "from-rose-500 to-pink-600",
  MDD_TAMV: "from-sky-500 to-blue-600",
  KAOS_HYPERRENDER: "from-fuchsia-500 to-purple-600",
  CHRONOS: "from-lime-500 to-green-600",
};

function FederacionDashboard() {
  const [federations, setFederations] = useState<FederationStatus[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    eventBus: false,
    rateLimiter: false,
    circuitBreakers: false,
    logging: false,
  });
  const [stats, setStats] = useState({
    totalEvents: 0,
    pipelineProcessed: 0,
    uptime: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadHealth = useCallback(async () => {
    initEventBusBridge();
    const health = getUnifiedFederationHealth();
    setFederations(health);

    try {
      const yunHealth = await runHealthCheck();
      const checksMap = new Map(yunHealth.checks.map(c => [c.name, c.status]));
      setSystemHealth({
        eventBus: checksMap.get('event_bus') === 'ok',
        rateLimiter: checksMap.get('rate_limiter') === 'ok',
        circuitBreakers: checksMap.get('circuit_breakers') === 'ok',
        logging: checksMap.get('log_buffer') === 'ok' || checksMap.get('log_buffer') === 'warn',
      });
    } catch {
      // Health check may fail in certain environments
    }

    const busHealth = federationBus.getHealth();
    setStats({
      totalEvents: busHealth.totalEvents,
      pipelineProcessed: 0,
      uptime: Math.floor(Date.now() / 1000),
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 30_000);
    return () => clearInterval(interval);
  }, [loadHealth]);

  const healthyCount = federations.filter((f) => f.status === "ACTIVE").length;
  const degradedCount = federations.filter((f) => f.status === "DEGRADED").length;
  const overallHealth = federations.length > 0
    ? federations.reduce((sum, f) => sum + f.health, 0) / federations.length
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        eyebrow="YUN Architecture"
        title="Sistema Heptafederado"
        highlight="Federaciones"
        description="7 Federaciones · 5 Dominios · 1 Gateway — Arquitectura Madre del Nodo Cero"
      />

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{healthyCount}/7</p>
                <p className="text-sm text-muted-foreground">Federaciones Activas</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{degradedCount}</p>
                <p className="text-sm text-muted-foreground">Degradadas</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(overallHealth * 100).toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">Salud Global</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
                <p className="text-sm text-muted-foreground">Eventos Totales</p>
              </div>
            </div>
          </div>
        </div>

        {/* YUN System Health */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Salud del Sistema YUN
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(systemHealth).map(([key, healthy]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${healthy ? "bg-emerald-500" : "bg-red-500"}`} />
                <span className="text-sm capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Federation Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Heptafederaciones TAMV</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {federations.map((fed) => (
              <div
                key={fed.tamvId}
                className="rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className={`bg-gradient-to-r ${FEDERATION_COLORS[fed.tamvId] ?? "from-gray-500 to-gray-600"} p-4 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {FEDERATION_ICONS[fed.tamvId] ?? <Globe className="w-5 h-5" />}
                      <span className="font-semibold">{fed.tamvId}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      fed.status === "ACTIVE"
                        ? "bg-white/20"
                        : fed.status === "DEGRADED"
                          ? "bg-amber-500/30"
                          : "bg-red-500/30"
                    }`}>
                      {fed.status}
                    </span>
                  </div>
                  <p className="text-sm mt-1 opacity-90">{fed.name}</p>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-sm text-muted-foreground">{fed.specialty}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Salud:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            fed.health > 0.8
                              ? "bg-emerald-500"
                              : fed.health > 0.5
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${fed.health * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono">{(fed.health * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    YUN Domain: {fed.yunFederation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture Info */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Arquitectura YUN</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-medium mb-2">Dominios (5)</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>Identity → Supabase Postgres</li>
                <li>Commerce → Supabase Postgres</li>
                <li>Knowledge → Supabase Postgres</li>
                <li>Telemetry → Supabase Postgres</li>
                <li>Gameplay → Supabase + Cache</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Componentes</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>Gateway YUN (Rate Limit + Circuit Breaker)</li>
                <li>Data Fabric (Saga + Cross-Domain)</li>
                <li>Event Bus (Constitutional)</li>
                <li>Observability Stack (Metrics + Logs + Traces)</li>
                <li>Federation Coordinator</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Constitución YUN</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>Verdad única por dominio</li>
                <li>Evento antes que acoplamiento</li>
                <li>Secreto fuera del código</li>
                <li>Sin acceso directo entre dominios</li>
                <li>Gobernanza formal (ADRs)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
