import { motion } from "framer-motion";
import { Clock, Zap, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface Package {
  id: string;
  slug: string;
  name: string;
  type: string;
  description?: string | null;
  duration_hours?: number | null;
  intensity?: string | null;
  price_from?: number | null;
  hero_image?: string | null;
}

const TYPE_COLORS: Record<string, string> = {
  aventurero: "bg-emerald-500/10 text-emerald-700",
  cultural: "bg-primary/10 text-primary",
  romantico: "bg-rose-500/10 text-rose-700",
  gastronomico: "bg-accent/10 text-accent",
  relajacion: "bg-sky-500/10 text-sky-700",
};

export function PackageCard({ pkg }: { pkg: Package }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Link to={`/paquetes/${pkg.slug}`}>
        <Card className="overflow-hidden rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-1 group cursor-pointer">
          {pkg.hero_image && (
            <div className="h-48 overflow-hidden relative">
              <img src={pkg.hero_image} alt={pkg.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <Badge className={`absolute bottom-3 left-3 ${TYPE_COLORS[pkg.type] ?? TYPE_COLORS.cultural}`}>
                {pkg.type}
              </Badge>
            </div>
          )}
          <CardContent className="p-5 space-y-3">
            <h3 className="font-display text-xl text-foreground">{pkg.name}</h3>
            {pkg.description && <p className="text-sm text-muted-foreground line-clamp-2">{pkg.description}</p>}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {pkg.duration_hours && (
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{pkg.duration_hours}h</span>
              )}
              {pkg.intensity && (
                <span className="inline-flex items-center gap-1"><Zap className="h-3 w-3" />{pkg.intensity}</span>
              )}
              {pkg.price_from != null && pkg.price_from > 0 && (
                <span className="inline-flex items-center gap-1"><DollarSign className="h-3 w-3" />Desde ${pkg.price_from}</span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
