import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiTileProps {
  label: string;
  value: string | number;
  delta?: number;
  icon?: string;
  accent?: "gold" | "teal" | "copper" | "electric";
}

const accentMap = {
  gold: "from-gold/20 to-gold/5 border-gold/30 text-gold",
  teal: "from-teal/20 to-teal/5 border-teal/30 text-teal",
  copper: "from-copper/20 to-copper/5 border-copper/30 text-copper",
  electric: "from-electric/20 to-electric/5 border-electric/30 text-electric",
} as const;

export function KpiTile({ label, value, delta, icon = "📊", accent = "gold" }: KpiTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border bg-gradient-to-br ${accentMap[accent]} p-5 backdrop-blur-sm overflow-hidden`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-display font-bold tracking-tight">{value}</p>
        </div>
        <span className="text-2xl opacity-80">{icon}</span>
      </div>
      {delta !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-[11px] font-mono">
          {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span>{delta >= 0 ? "+" : ""}{delta}% vs ayer</span>
        </div>
      )}
    </motion.div>
  );
}
