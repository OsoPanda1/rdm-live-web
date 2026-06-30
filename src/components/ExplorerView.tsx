import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import { getAllPlaces } from "@/lib/kernel";

export function ExplorerView() {
  const places = getAllPlaces();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold tracking-tight">Explorer</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Mapa geoespacial de Real del Monte — Vista territorial
        </p>
      </div>

      {/* Map Placeholder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full h-[400px] rounded-xl bg-primary overflow-hidden border border-border"
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(hsl(var(--secondary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--secondary)) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        {/* Center marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
          <Navigation className="w-8 h-8 text-accent" />
          <div className="glass px-3 py-1.5 rounded-lg">
            <p className="text-xs text-primary-foreground font-mono">20.138°N, 98.671°W</p>
            <p className="text-[10px] text-primary-foreground/60 text-center">Real del Monte, Hgo.</p>
          </div>
        </div>

        {/* Place markers */}
        {places.map((place, i) => {
          const offsetX = ((place.lng + 98.675) * 8000) + 50;
          const offsetY = ((20.142 - place.lat) * 8000) + 50;
          return (
            <motion.div
              key={place.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring" }}
              className="absolute group"
              style={{ left: `${Math.min(Math.max(offsetX, 5), 95)}%`, top: `${Math.min(Math.max(offsetY, 5), 95)}%` }}
            >
              <div className="w-3 h-3 rounded-full bg-accent border-2 border-accent-foreground cursor-pointer hover:scale-150 transition-transform" />
              <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 glass px-2 py-1 rounded-md whitespace-nowrap z-10">
                <p className="text-[10px] text-primary-foreground font-medium">{place.name}</p>
              </div>
            </motion.div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-3 right-3 glass px-3 py-2 rounded-lg">
          <p className="text-[10px] text-primary-foreground/80 font-medium mb-1">Capa Territorial</p>
          <div className="flex items-center gap-3 text-[10px] text-primary-foreground/60">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accent" /> Lugares
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success" /> Rutas
            </span>
          </div>
        </div>
      </motion.div>

      {/* Places Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {places.map((place, i) => (
          <motion.div
            key={place.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-card border border-border rounded-xl p-4 hover:border-accent/30 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold">{place.name}</p>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">{place.category}</p>
              </div>
              <span className="text-xs text-accent font-medium">★ {place.rating}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{place.description}</p>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-secondary font-mono">
              <MapPin className="w-3 h-3" />
              {place.lat.toFixed(3)}, {place.lng.toFixed(3)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
