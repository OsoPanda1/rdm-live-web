import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, Wifi, Cpu, HardDrive, BarChart3 } from "lucide-react";

// 1. Tipado estricto
interface TelemetryData {
  requests: number;
  avgLatency: number;
  meshNodes: number;
  meshOnline: number;
  cpuUsage: number;
  memoryUsage: number;
  bandwidth: number;
}

// 2. Lógica separada: Hook para gestión de estado
function useTelemetryData(intervalMs = 3000) {
  const [data, setData] = useState<TelemetryData>({
    requests: 0, avgLatency: 0, meshNodes: 12, meshOnline: 12,
    cpuUsage: 0, memoryUsage: 0, bandwidth: 0
  });

  useEffect(() => {
    const update = () => setData({
      requests: Math.floor(Math.random() * 120) + 80,
      avgLatency: Math.floor(Math.random() * 90) + 60,
      meshNodes: 12,
      meshOnline: Math.floor(Math.random() * 4) + 9,
      cpuUsage: Math.floor(Math.random() * 30) + 15,
      memoryUsage: Math.floor(Math.random() * 35) + 30,
      bandwidth: Math.floor(Math.random() * 36) + 12,
    });

    update();
    const interval = setInterval(update, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return data;
}

export function TelemetryView() {
  const data = useTelemetryData();
  
  // 3. Memoización de logs para evitar parpadeo y mejorar rendimiento
  const logs = useMemo(() => [
    `[${new Date().toLocaleTimeString()}] kernel.intent → gastronomia (conf: 0.94)`,
    `[${new Date().toLocaleTimeString()}] mesh.node.N-03 → heartbeat OK`,
    `[${new Date().toLocaleTimeString()}] api.places.query → 10 results (${data.avgLatency}ms)`,
  ], [data.avgLatency]);

  const cardStyle = "bg-card border border-border rounded-xl p-4 shadow-sm";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold tracking-tight">Telemetría</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitoreo de infraestructura y red territorial mesh
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Requests/min", value: data.requests, icon: BarChart3, color: "text-accent" },
          { label: "Latencia Avg", value: `${data.avgLatency}ms`, icon: Activity, color: "text-success" },
          { label: "CPU", value: `${data.cpuUsage}%`, icon: Cpu, color: "text-secondary" },
          { label: "Memoria", value: `${data.memoryUsage}%`, icon: HardDrive, color: "text-accent" },
        ].map((item, i) => (
          <motion.div key={item.label} className={cardStyle} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <item.icon className={`w-4 h-4 ${item.color} mb-2`} />
            <p className="text-xl font-semibold">{item.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{item.label}</p>
          </motion.div>
        ))}
      </div>

      <div className={cardStyle}>
        <div className="flex items-center gap-2 mb-4">
          <Wifi className="w-4 h-4 text-accent" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Red Mesh Territorial — {data.meshOnline}/{data.meshNodes} nodos online
          </p>
        </div>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
          {Array.from({ length: data.meshNodes }).map((_, i) => (
            <div key={i} className={`h-8 rounded border flex items-center justify-center ${i < data.meshOnline ? "bg-success/10 border-success/30" : "bg-muted border-border"}`}>
              <Wifi className={`w-3 h-3 ${i < data.meshOnline ? "text-success" : "text-muted-foreground"}`} />
            </div>
          ))}
        </div>
      </div>

      <div className={cardStyle}>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Log en Tiempo Real</p>
        <div className="bg-primary/5 rounded-lg p-3 font-mono text-xs text-muted-foreground space-y-1 max-h-48 overflow-y-auto">
          {logs.map((log, i) => <p key={i}>{log}</p>)}
        </div>
      </div>
    </div>
  );
}
