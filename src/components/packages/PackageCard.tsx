/**
 * ============================================================================
 * RDM Digital OS — PackageCard Component (Versión Robusta y Accesible)
 * Tarjeta interactiva para visualización de paquetes turísticos del ecosistema.
 * ============================================================================
 */

import { FC, memo } from "react";
import { motion } from "framer-motion";
import { Clock, Zap, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export interface Package {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly type: string;
  readonly description?: string | null;
  readonly duration_hours?: number | null;
  readonly intensity?: string | null;
  readonly price_from?: number | null;
  readonly hero_image?: string | null;
}

interface PackageCardProps {
  readonly pkg: Package;
}

const TYPE_COLORS: Record<string, string> = {
  aventurero: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  cultural: "bg-primary/10 text-primary",
  romantico: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  gastronomico: "bg-accent/10 text-accent",
  relajacion: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
} as const;

const DEFAULT_TYPE_COLOR = "bg-primary/10 text-primary";

export const PackageCard: FC<PackageCardProps> = memo(({ pkg }) => {
  const badgeClass = TYPE_COLORS[pkg.type.toLowerCase()] ?? DEFAULT_TYPE_COLOR;
  const formattedPrice = pkg.price_from != null ? pkg.price_from.toLocaleString() : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Link 
        to={`/paquetes/${pkg.slug}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
        aria-label={`Ver detalles del paquete: ${pkg.name}`}
      >
        <Card className="overflow-hidden rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-1 group cursor-pointer">
          {pkg.hero_image && (
            <div className="h-48 overflow-hidden relative" aria-hidden="true">
              <img 
                src={pkg.hero_image} 
                alt="" 
                loading="lazy" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <Badge className={`absolute bottom-3 left-3 capitalize ${badgeClass}`}>
                {pkg.type}
              </Badge>
            </div>
          )}
          
          <CardContent className="p-5 space-y-3">
            <h3 className="font-display text-xl text-foreground font-semibold tracking-tight group-hover:text-primary transition-colors">
              {pkg.name}
            </h3>

            {pkg.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {pkg.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
              {pkg.duration_hours != null && pkg.duration_hours > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  <span>{pkg.duration_hours}h</span>
                </span>
              )}

              {pkg.intensity && (
                <span className="inline-flex items-center gap-1 capitalize">
                  <Zap className="h-3 w-3" aria-hidden="true" />
                  <span>{pkg.intensity}</span>
                </span>
              )}

              {formattedPrice != null && pkg.price_from! > 0 && (
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  <DollarSign className="h-3 w-3 text-primary" aria-hidden="true" />
                  <span>Desde ${formattedPrice}</span>
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
});

PackageCard.displayName = "PackageCard";
