import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Zap,
  Database,
  Clock,
  TrendingUp,
  MapPin,
  Utensils,
  Mountain,
  Landmark,
  Bed,
  Palette,
} from "lucide-react";
import { getSystemMetrics, getAllPlaces } from "@/lib/kernel";

const INTENT_ICONS: Record<string, React.ElementType> = {
  gastronomia: Utensils,
  aventura: Mountain,
  historia: Landmark,
  hospedaje: Bed,
  cultura: Palette,
};

const WEATHER = {
  temp: 14,
  condition: "Bruma",
  humidity: 78,
  altitude: 2700,
};

const card = "bg-card border border-border rounded-xl p-4";
const cardTitle = "text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3";

export function DashboardView() {
  const [metrics, setMetrics] = useState(getSystemMetrics());
  const places = getAllPlaces();

  useEffect(() => {
    const interval = setInterval(() => setMetrics(getSystemMetrics()), 5000);
    return () => clearInterval(interval);
  }, []);

  const categoryCounts = places.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold tracking-tight">
          Control Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real del Monte — Sistema operativo territorial en tiempo real
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Usuarios Activos", value: metrics.activeUsers, icon: Users, color: "text-success" },
          { label: "Latencia Kernel", value: `${metrics.kernelLatency}ms`, icon: Zap, color: "text-accent" },
          { label: "Lugares Indexados", value: metrics.placesIndexed, icon: Database, color: "text-secondary" },
          { label: "Uptime", value: `${metrics.uptime}%`, icon: Clock, color: "text-success" },
          { label: "Intents Procesados", value: metrics.intentsProcessed, icon: TrendingUp, color: "text-accent" },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.15 }}
            className={card}
          >
            <metric.icon className={`w-4 h-4 ${metric.color} mb-2`} />
            <p className="text-xl font-semibold font-body">{metric.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Weather Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={card}
        >
          <p className={cardTitle}>Clima en Tiempo Real</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-display font-light">{WEATHER.temp}°</p>
              <p className="text-sm text-muted-foreground">{WEATHER.condition}</p>
            </div>
            <div className="text-right text-xs text-muted-foreground space-y-1">
              <p>Humedad: {WEATHER.humidity}%</p>
              <p>Altitud: {WEATHER.altitude}m</p>
            </div>
          </div>
        </motion.div>

        {/* Intent Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={card}
        >
          <p className={cardTitle}>Distribución por Categoría</p>
          <div className="space-y-2">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const Icon = INTENT_ICONS[cat] || MapPin;
              return (
                <div key={cat} className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-secondary" />
                  <span className="text-sm capitalize flex-1">{cat}</span>
                  <span className="text-xs text-muted-foreground">{count}</span>
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${(count / places.length) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* System Architecture */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={card}
        >
          <p className={cardTitle}>Arquitectura del Sistema</p>
          <div className="space-y-2 text-xs font-mono">
            {[
              { layer: "Experience Layer", status: "ACTIVE", color: "bg-success" },
              { layer: "Cognitive Kernel", status: "RUNNING", color: "bg-accent" },
              { layer: "Data Orchestration", status: "SYNCED", color: "bg-success" },
              { layer: "Infrastructure", status: "ONLINE", color: "bg-success" },
            ].map((item) => (
              <div key={item.layer} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-foreground">{item.layer}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${item.color} status-live`} />
                  <span className="text-muted-foreground">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Places Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className={card}
      >
        <p className={cardTitle}>Directorio de Lugares</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 text-xs text-muted-foreground font-medium">Nombre</th>
                <th className="pb-2 text-xs text-muted-foreground font-medium">Categoría</th>
                <th className="pb-2 text-xs text-muted-foreground font-medium">Rating</th>
                <th className="pb-2 text-xs text-muted-foreground font-medium hidden md:table-cell">Coordenadas</th>
              </tr>
            </thead>
            <tbody>
              {places.map((place) => {
                const Icon = INTENT_ICONS[place.category] || MapPin;
                return (
                  <tr key={place.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-2.5 font-medium">{place.name}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3 h-3 text-secondary" />
                        <span className="capitalize text-muted-foreground">{place.category}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-accent">★ {place.rating}</td>
                    <td className="py-2.5 text-muted-foreground text-xs font-mono hidden md:table-cell">
                      {place.lat.toFixed(3)}, {place.lng.toFixed(3)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
