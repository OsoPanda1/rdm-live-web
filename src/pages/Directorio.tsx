import { RDMLayout } from "@/components/rdm/RDMLayout";
import { useState, useMemo } from "react";
import BusinessCard from "@/components/BusinessCard";
import GradientSeparator from "@/components/GradientSeparator";
import { SEOMeta, PAGE_SEO } from "@/components/SEOMeta";
import { AuroraBackground, TextReveal } from "@/components/VisualEffects";
import { motion } from "framer-motion";
import { Search, Store, Sparkles } from "lucide-react";

import pasteriasImg from "@/assets/pasterias.png";
import plateriasImg from "@/assets/platerias.png";
import artesaniasImg from "@/assets/artesanias.png";
import sanitariosImg from "@/assets/sanitarios.png";
import minaImg from "@/assets/mina-acosta.webp";
import callesImg from "@/assets/calles-colonial.webp";
import rdm1 from "@/assets/rdm1.jpeg";
import rdm2 from "@/assets/rdm2.jpeg";

const businesses = [
  { name: "Pastes El Portal", category: "Pastes", description: "Los pastes mas tradicionales desde 1985. Sabores clasicos y nuevas creaciones.", image: pasteriasImg, isPremium: true, rating: 4.9, phone: "771 123 4567" },
  { name: "Hotel Real de Minas", category: "Hospedaje", description: "Hotel boutique en casona colonial restaurada con vista a la montana.", image: callesImg, isPremium: true, rating: 4.7, phone: "771 234 5678" },
  { name: "Tours Mineros RDM", category: "Tours", description: "Recorridos guiados por las minas historicas con expertos en historia local.", image: minaImg, isPremium: false, rating: 4.5 },
  { name: "Cafe La Neblina", category: "Restaurante", description: "Cafe artesanal de altura con los mejores postres y vista al bosque.", image: rdm1, isPremium: false, rating: 4.4 },
  { name: "Artesanias del Monte", category: "Souvenir", description: "Artesanias locales, textiles y recuerdos autenticos hechos a mano.", image: artesaniasImg, isPremium: true, rating: 4.6, phone: "771 345 6789" },
  { name: "Platerías Artesanales", category: "Souvenir", description: "Joyería artesanal en plata, herencia minera de Real del Monte.", image: plateriasImg, isPremium: false, rating: 4.3 },
  { name: "Servicios Turísticos", category: "Tours", description: "Información turística, sanitarios y puntos de asistencia al visitante.", image: sanitariosImg, isPremium: false, rating: 4.2 },
  { name: "Restaurant Los Murmullos", category: "Restaurante", description: "Comida tradicional hidalguense con ingredientes locales frescos.", image: rdm2, isPremium: true, rating: 4.5 },
];

const categories = ["Todos", "Pastes", "Hospedaje", "Restaurante", "Tours", "Souvenir"];

const DirectorioPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((biz) => {
      const matchesSearch = searchQuery === "" ||
        biz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        biz.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "Todos" || biz.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <RDMLayout>
      <SEOMeta {...(PAGE_SEO.directorio ?? { title: "Directorio de Negocios | RDM Digital", description: "Comercios, hoteles, restaurantes y servicios de Real del Monte." })} />
      <div className="min-h-screen bg-background">

        {/* Immersive Hero */}
        <section className="relative overflow-hidden pt-24 pb-16">
          <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: `url(${callesImg})` }} />
          <div className="absolute inset-0 bg-gradient-to-b from-night-900/80 via-night-900/70 to-night-900" />
          <AuroraBackground />
          <div className="dust-particles" />

          <div className="relative mx-auto max-w-6xl px-6 py-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] backdrop-blur-sm">
                <Store className="h-3.5 w-3.5 text-gold-400" />
                <span>Negocios Verificados</span>
              </div>
              <h1 className="font-serif text-5xl md:text-7xl leading-tight">
                <span className="block">Directorio de</span>
                <span
                  className="block animate-gradient-text text-glow-gold"
                  style={{
                    backgroundImage: "linear-gradient(135deg, hsl(43,80%,55%) 0%, hsl(35,70%,65%) 25%, hsl(43,80%,55%) 50%, hsl(25,60%,50%) 75%, hsl(43,80%,55%) 100%)",
                    backgroundSize: "200% 200%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Negocios
                </span>
              </h1>
              <p className="max-w-2xl text-base text-silver-400 md:text-lg leading-relaxed">
                Comercios, hoteles, restaurantes y servicios recomendados por la comunidad de Real del Monte.
              </p>
            </motion.div>
          </div>
        </section>

        <GradientSeparator animated />

        {/* Search & Filters */}
        <section className="relative py-10">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-silver-500" />
                <input
                  type="text"
                  placeholder="Buscar negocios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-silver-200 placeholder:text-silver-500 backdrop-blur-sm focus:border-gold-400/40 focus:outline-none focus:ring-1 focus:ring-gold-400/20 transition-all duration-300"
                />
              </div>

              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-4 py-2 text-xs font-medium tracking-wide transition-all duration-300 ${
                      activeCategory === cat
                        ? "bg-gold-400/20 text-gold-400 border border-gold-400/30"
                        : "border border-white/10 bg-white/5 text-silver-400 hover:bg-white/10 hover:text-silver-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Results */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          {/* Results count */}
          <div className="flex items-center gap-2 mb-6 text-sm text-silver-500">
            <Sparkles className="h-3.5 w-3.5 text-gold-400/60" />
            <span>{filteredBusinesses.length} negocio{filteredBusinesses.length !== 1 ? "s" : ""} encontrado{filteredBusinesses.length !== 1 ? "s" : ""}</span>
          </div>

          {filteredBusinesses.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-white/10 bg-white/5">
              <Store className="h-12 w-12 text-silver-500 mx-auto mb-4" />
              <p className="text-silver-400 text-lg">No se encontraron negocios.</p>
              <p className="text-silver-500 text-sm mt-2">Intenta con otros terminos de busqueda o categoria.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredBusinesses.map((biz, i) => (
                <BusinessCard key={biz.name} {...biz} index={i} />
              ))}
            </div>
          )}
        </section>

      </div>
    </RDMLayout>
  );
};

export default DirectorioPage;
