import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, Star, Utensils, Flame, Coffee, ChefHat, Sparkles } from "lucide-react";
import { RDMLayout } from "@/components/rdm/RDMLayout";
import { PAGE_SEO, SEOMeta } from "@/components/SEOMeta";
import { AuroraBackground, TextReveal, StaggerContainer, StaggerItem } from "@/components/VisualEffects";
import GradientSeparator from "@/components/GradientSeparator";
import pasteImg from "@/assets/paste.webp";
import rdm1 from "@/assets/rdm1.jpeg";
import rdm2 from "@/assets/rdm2.jpeg";

const GASTRO_IMAGES = [
  "/images/gastronomia-pastes.jpg",
  "/images/gastronomia-paste.jpg",
  "/images/gastronomia-festival.jpg",
];
import { logger } from "@/lib/logger";

interface Business {
  id: string;
  name: string;
  category: string;
  description: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

const culinaryHighlights = [
  {
    icon: ChefHat,
    title: "Pastes Tradicionales",
    description: "Herencia culinaria cornish desde 1850, con mas de 50 variedades que van desde el tradicional de papa con carne hasta creaciones contemporaneas.",
    color: "text-gold-400",
    bgColor: "bg-gold-400/10",
  },
  {
    icon: Coffee,
    title: "Cafe de Altura",
    description: "Cafeterias artesanales que sirven cafe de olla y especialidades preparadas con granos selectos a 2,700 metros de altitud.",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  {
    icon: Flame,
    title: "Cocina de Montana",
    description: "Trucha fresca, barbacoa de hoyo, mixiotes y platillos hidalguenses con ingredientes locales y tecnicas ancestrales.",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
  },
];

export default function GastronomiaPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/businesses?category=GASTRONOMIA`);
        if (!response.ok) {
          throw new Error("No se pudo cargar la categoría de gastronomía");
        }
        const data = await response.json();
        setBusinesses(data.data ?? []);
      } catch (error) {
        logger.error("Error loading gastronomía:", error);
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  return (
    <RDMLayout>
      <SEOMeta {...PAGE_SEO.gastronomia} />
      <div className="min-h-screen bg-background text-foreground">

        {/* Immersive Hero */}
        <section className="relative overflow-hidden pt-24 min-h-[70vh] flex items-center">
          <div className="absolute inset-0 bg-cover bg-center opacity-25 ken-burns" style={{ backgroundImage: `url(${pasteImg})` }} />
          <div className="absolute inset-0 bg-gradient-to-b from-night-900/80 via-night-900/60 to-night-900" />
          <div className="absolute inset-0 bg-gradient-to-r from-night-900/50 via-transparent to-night-900/50" />
          <AuroraBackground />
          <div className="dust-particles" />

          <div className="relative mx-auto max-w-6xl px-6 py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] backdrop-blur-sm">
                <Utensils className="h-3.5 w-3.5 text-gold-400" />
                <span>Sabores del Pueblo Magico</span>
              </div>
              <h1 className="font-serif text-5xl md:text-7xl leading-tight">
                <span className="block">Gastronomia de</span>
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
                  Real del Monte
                </span>
              </h1>
              <p className="max-w-2xl text-base text-silver-400 md:text-lg leading-relaxed">
                Descubre pastes centenarios, cafeterias artesanales y experiencias culinarias unicas
                en el corazon de la Sierra de Pachuca.
              </p>
            </motion.div>
          </div>
        </section>

        <GradientSeparator animated />

        {/* Culinary Highlights */}
        <section className="relative overflow-hidden py-20">
          <div className="mx-auto max-w-6xl px-6">
            <TextReveal>
              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] mb-6">
                  <Sparkles className="h-3.5 w-3.5 text-gold-400" />
                  Tradicion Culinaria
                </div>
                <h2 className="font-serif text-3xl md:text-4xl text-silver-200 mb-4">
                  Sabores que cuentan historia
                </h2>
                <p className="text-silver-400 max-w-xl mx-auto">
                  Una fusion unica entre la cocina mexicana y la herencia britanica que define la identidad gastronomica de Real del Monte.
                </p>
              </div>
            </TextReveal>

            <StaggerContainer className="grid md:grid-cols-3 gap-6">
              {culinaryHighlights.map((item) => (
                <StaggerItem key={item.title}>
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-400 hover:border-white/20 hover:bg-white/8 card-glow-hover"
                  >
                    <div className={`w-14 h-14 rounded-2xl ${item.bgColor} flex items-center justify-center mb-6`}>
                      <item.icon className={`h-7 w-7 ${item.color}`} />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-silver-200 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-sm text-silver-400 leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Gallery Strip — Expanded */}
        <section className="relative overflow-hidden py-12">
          <div className="mx-auto max-w-6xl px-6">
            <div className="rdm-mosaic" style={{ gridAutoRows: "200px" }}>
              {[
                { src: pasteImg, label: "Pastes tradicionales", tall: true },
                { src: rdm1, label: "Gastronomia local" },
                { src: rdm2, label: "Sabores de la sierra" },
                { src: GASTRO_IMAGES[0], label: "Festival del Paste" },
                { src: GASTRO_IMAGES[1], label: "Cocina cornish" },
                { src: GASTRO_IMAGES[2], label: "Gastronomia en vivo", wide: true },
              ].map((photo, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`relative rounded-2xl overflow-hidden group rdm-img-hover ${
                    photo.tall ? "rdm-mosaic-tall" : photo.wide ? "rdm-mosaic-wide" : ""
                  }`}
                >
                  <img
                    src={photo.src}
                    alt={photo.label}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-night-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 z-10">
                    <p className="text-white text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>{photo.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <GradientSeparator />

        {/* Dynamic Businesses Section */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <TextReveal>
            <div className="mb-10">
              <h2 className="font-serif text-3xl md:text-4xl text-silver-200 mb-3">
                Recomendaciones de la Comunidad
              </h2>
              <p className="text-silver-400 max-w-lg">
                Establecimientos verificados y recomendados por visitantes y locales.
              </p>
            </div>
          </TextReveal>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-5 animate-pulse">
                  <div className="h-5 bg-white/10 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-white/5 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : businesses.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-white/10 bg-white/5">
              <Utensils className="h-12 w-12 text-silver-500 mx-auto mb-4" />
              <p className="text-silver-400 text-lg">Aun no hay recomendaciones publicadas.</p>
              <p className="text-silver-500 text-sm mt-2">Se el primero en recomendar un lugar.</p>
            </div>
          ) : (
            <StaggerContainer className="grid gap-4 md:grid-cols-2">
              {businesses.map((business, index) => (
                <StaggerItem key={business.id}>
                  <motion.article
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-white/20 hover:bg-white/8 transition-all duration-300 card-glow-hover"
                  >
                    <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-silver-200">
                      <Utensils className="h-4 w-4 text-gold-400" />
                      {business.name}
                    </h2>
                    <p className="mb-3 text-sm text-silver-500 leading-relaxed">{business.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-silver-400">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5"><Star className="h-3.5 w-3.5 text-gold-400" />{business.category}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5"><Clock className="h-3.5 w-3.5" />Horario variable</span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5"><MapPin className="h-3.5 w-3.5" />Centro historico</span>
                    </div>
                  </motion.article>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </section>

      </div>
    </RDMLayout>
  );
}
