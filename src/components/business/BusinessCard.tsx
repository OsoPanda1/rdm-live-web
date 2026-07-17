import { motion } from "framer-motion";
import { MapPin, Phone, Globe, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/StarRating";

interface Business {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  price_range?: string | null;
  images?: string[];
  rating?: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  GASTRONOMIA: "🍽️", HOSPEDAJE: "🏨", ARTESANIA: "🎨", PLATERIA: "💍",
  BAR: "🍺", COMERCIO: "🏪", SERVICIOS: "🔧", TURISMO: "🗺️", OTROS: "📦",
};

const PRICE_LABELS: Record<string, string> = {
  ECONOMICO: "$", MODERADO: "$$", CARO: "$$$", LUJO: "$$$$",
};

export function BusinessCard({ business }: { business: Business }) {
  const heroImg = business.images?.[0];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="overflow-hidden rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-1">
        {heroImg && (
          <div className="h-44 overflow-hidden">
            <img src={heroImg} alt={business.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
        )}
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground tracking-widest uppercase mb-1">
                {CATEGORY_ICONS[business.category] ?? "📦"} {business.category}
              </p>
              <h3 className="font-display text-lg text-foreground leading-tight">{business.name}</h3>
            </div>
            {business.price_range && (
              <Badge variant="secondary" className="text-xs font-mono shrink-0">
                {PRICE_LABELS[business.price_range] ?? business.price_range}
              </Badge>
            )}
          </div>

          {business.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{business.description}</p>
          )}

          {business.rating !== undefined && (
            <StarRating rating={business.rating} size="sm" />
          )}

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
            {business.address && (
              <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{business.address}</span>
            )}
            {business.phone && (
              <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{business.phone}</span>
            )}
            {business.website && (
              <a href={business.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-accent transition-colors">
                <Globe className="h-3 w-3" />Web
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
