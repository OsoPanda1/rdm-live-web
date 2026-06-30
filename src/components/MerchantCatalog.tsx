import { motion } from "framer-motion";
import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { Link } from "react-router-dom";

interface MerchantData {
  id: string;
  slug: string;
  name: string;
  category: string;
  immersionLevel: number;
  description: string;
  priceRange: string;
  address: string;
  location: { lat: number; lng: number } | null;
  phone: string | null;
  tags: string[];
  isActive: boolean;
}

const categories = [
  { type: "Hoteles", price: 500, tier: "L1", icon: "🏨", category: "LODGING" },
  { type: "Camiones Rojos", price: 500, tier: "L1", icon: "🚌", category: "TRANSPORT" },
  { type: "Racers", price: 500, tier: "L1", icon: "🏎️", category: "TRANSPORT" },
  { type: "Pasterías", price: 400, tier: "L2", icon: "🥟", category: "FOOD" },
  { type: "Cuatrimotos", price: 400, tier: "L2", icon: "🏍️", category: "ACTIVITY" },
  { type: "Platerías", price: 350, tier: "L2", icon: "💎", category: "HANDCRAFTS" },
  { type: "Bares", price: 350, tier: "L2", icon: "🍸", category: "BAR" },
  { type: "Restaurantes", price: 300, tier: "L2", icon: "🍽️", category: "FOOD" },
  { type: "Artesanías", price: 300, tier: "L2", icon: "🎨", category: "HANDCRAFTS" },
  { type: "Recorridos Teatrales", price: 300, tier: "L2", icon: "🎭", category: "ACTIVITY" },
  { type: "Abarrotes / Misceláneas", price: 250, tier: "L3", icon: "🏪", category: "RETAIL" },
  { type: "Góndolas (Semifijo)", price: 150, tier: "L3", icon: "🛒", category: "RETAIL" },
];

const extras = [
  { label: "Publicidad en todas las unidades (Camiones Rojos)", price: "Incluido" },
  { label: "Publicidad personalizada en camión específico", price: "+$150 MXN" },
];

const tierColors: Record<string, string> = {
  L1: "from-secondary to-yellow-300",
  L2: "from-primary to-cyan-300",
  L3: "from-muted-foreground to-foreground/40",
};

const MerchantCatalog = () => {
  const [filter, setFilter] = useState<string | null>(null);
  const { data: apiMerchants } = useApi<MerchantData[]>("/api/merchants");

  const filtered = filter ? categories.filter((c) => c.tier === filter) : categories;
  const activeMerchants = apiMerchants?.filter((m) => m.isActive) ?? [];

  return (
    <section id="comercios" className="relative py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <span className="font-mono text-xs uppercase tracking-widest text-secondary mb-3 block">
            Catálogo Soberano · Gemelo Digital
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase">
            Únete a la <span className="text-gradient-gold">Federación</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl">
            Registra tu negocio en el ecosistema digital de Real del Monte.
            Solo los comercios verificados aparecen en el Gemelo Digital y reciben recomendaciones de Realito AI.
          </p>
        </motion.div>

        {/* Active merchants from API */}
        {activeMerchants.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h3 className="font-mono text-xs uppercase tracking-widest text-primary mb-4">
              Comercios Activos en el Gemelo Digital ({activeMerchants.length})
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeMerchants.slice(0, 6).map((merchant, i) => (
                <motion.div
                  key={merchant.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-surface p-5 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-primary">
                      L{merchant.immersionLevel} · {merchant.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{merchant.priceRange}</span>
                  </div>
                  <h4 className="text-sm font-semibold tracking-tight mb-2">{merchant.name}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {merchant.description}
                  </p>
                  {merchant.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {merchant.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            {activeMerchants.length > 6 && (
              <div className="mt-4 text-center">
                <Link to="/catalogo" className="font-mono text-xs text-primary hover:text-foreground transition-colors">
                  Ver todos los comercios →
                </Link>
              </div>
            )}
          </motion.div>
        )}

        {/* Tier filters */}
        <div className="flex gap-3 mb-8 font-mono text-xs uppercase tracking-widest">
          {[null, "L1", "L2", "L3"].map((tier) => (
            <button
              key={tier ?? "all"}
              onClick={() => setFilter(tier)}
              className={`px-4 py-2 rounded-lg transition-all border border-border ${
                filter === tier
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {tier ?? "Todos"}
            </button>
          ))}
        </div>

        {/* Pricing cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((cat, i) => (
            <motion.div
              key={cat.type}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              whileHover={{ y: -5 }}
              className="relative p-6 glass-surface overflow-hidden group cursor-pointer"
            >
              <div
                className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${tierColors[cat.tier]} opacity-60 group-hover:opacity-100 transition-opacity`}
              />
              <div className="text-2xl mb-3">{cat.icon}</div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
                Nivel {cat.tier}
              </span>
              <h3 className="text-lg font-semibold tracking-tight mt-1 mb-4">{cat.type}</h3>
              <div className="flex justify-between items-center">
                <Link to="/catalogo">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-sovereign bg-foreground text-background text-[10px] px-4 py-2 inline-block"
                  >
                    Registrar
                  </motion.span>
                </Link>
                <span className="font-mono text-[10px] text-muted-foreground">
                  ${cat.price} MXN / mes
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Extras */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 glass-surface p-6"
        >
          <h4 className="font-mono text-xs uppercase tracking-widest text-secondary mb-4">
            Servicios adicionales
          </h4>
          <div className="space-y-3">
            {extras.map((extra) => (
              <div key={extra.label} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{extra.label}</span>
                <span className="font-mono text-xs text-foreground">{extra.price}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MerchantCatalog;
