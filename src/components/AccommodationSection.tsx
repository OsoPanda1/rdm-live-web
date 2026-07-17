import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Star,
  Wifi,
  Flame,
  Mountain as MountainIcon,
  CloudFog,
  ThermometerSun,
} from "lucide-react";
import hotelColonial from "@/assets/hotel-colonial.jpg";
import courtyardColonial from "@/assets/courtyard-colonial.jpg";

const HOTELS = [
  {
    name: "Hacienda de la Sierra",
    type: "Hotel Boutique",
    rating: 4.9,
    price: "Desde $1,800/noche",
    features: ["Chimenea", "Vista a la montaña", "Spa", "Desayuno local"],
    image: hotelColonial,
    tags: [
      { icon: MountainIcon, label: "2,700 msnm" },
      { icon: Flame, label: "Chimeneas activas" },
    ],
  },
  {
    name: "Patio de las Flores",
    type: "Casa Colonial",
    rating: 4.7,
    price: "Desde $1,200/noche",
    features: ["Jardín interior", "Cocina equipada", "Wi‑Fi rápido", "Pet‑friendly"],
    image: courtyardColonial,
    tags: [
      { icon: Wifi, label: "Wi‑Fi fibra" },
      { icon: CloudFog, label: "Clima fresco" },
    ],
  },
];

export function AccommodationSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Parallax layers
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const mistY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const headingY = useTransform(scrollYProgress, [0, 1], ["12%", "0%"]);
  const headingOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section
      id="hospedaje"
      ref={ref}
      className="relative isolate overflow-hidden bg-background"
    >
      {/* HERO INMERSIVO */}
      <div className="relative h-[60vh] min-h-[420px] overflow-hidden">
        {/* Fondo montaña */}
        <motion.img
          style={{ y: bgY }}
          src={hotelColonial}
          alt="Paisaje hotel en montaña"
          className="absolute inset-0 h-[120%] w-full object-cover brightness-[0.65] saturate-110"
        />

        {/* Capa de neblina / atmósfera */}
        <motion.div
          style={{ y: mistY }}
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-background/70 via-transparent to-transparent" />
          <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen">
            <div className="h-full w-full bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.08),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.10),transparent_55%)]" />
          </div>
        </motion.div>

        {/* Cinta superior contextual */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center pt-4 md:pt-6">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-3 rounded-full bg-background/70 px-4 py-2 text-xs font-medium tracking-[0.3em] uppercase text-muted-foreground/80 backdrop-blur-md"
          >
            <MountainIcon className="h-3.5 w-3.5 text-accent" />
            <span className="font-body">Hospedaje en altura · Real del Monte</span>
          </motion.div>
        </div>

        {/* Bloque principal de título */}
        <div className="absolute inset-x-0 bottom-0 pb-10 md:pb-16 lg:pb-20">
          <motion.div
            style={{ y: headingY, opacity: headingOpacity }}
            className="px-6 md:px-16 lg:px-24"
          >
            <div className="max-w-5xl">
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mb-3 text-[0.7rem] font-body uppercase tracking-[0.35em] text-accent/90"
              >
                Estancias que abrazan la montaña
              </motion.p>

              <motion.h2
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.05 }}
                className="font-display text-4xl leading-[0.9] text-foreground md:text-6xl lg:text-7xl"
              >
                Refugios que{" "}
                <span className="bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
                  se encienden
                </span>{" "}
                al caer la niebla
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
                className="mt-4 max-w-xl text-sm font-body text-muted-foreground/90 md:text-base"
              >
                Seleccionamos hospedajes que combinan arquitectura colonial, calor
                de chimenea y vistas al bosque. Cada espacio está curado para
                que tu noche en la montaña se sienta íntima, segura y memorables.
              </motion.p>

              {/* Mini badges contexto clima / amenities principales */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.25 }}
                className="mt-5 flex flex-wrap gap-3 text-[0.7rem] font-body"
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-muted-foreground/90 backdrop-blur">
                  <ThermometerSun className="h-3.5 w-3.5 text-accent" />
                  Noches frescas · 10–14°C
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-muted-foreground/90 backdrop-blur">
                  <Flame className="h-3.5 w-3.5 text-accent" />
                  Habitaciones con chimenea
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-muted-foreground/90 backdrop-blur">
                  <Wifi className="h-3.5 w-3.5 text-accent" />
                  Wi‑Fi listo para trabajar
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* LISTADO CURADO DE HOTELES */}
      <div className="relative bg-gradient-to-b from-background to-background/95">
        <div className="pointer-events-none absolute inset-x-12 top-0 h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-14 md:px-16 lg:px-24">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-body uppercase tracking-[0.3em] text-accent/80">
                Hospedaje seleccionado
              </p>
              <h3 className="mt-2 font-display text-2xl text-foreground md:text-3xl">
                Colonial, cálido y hecho a medida de tu visita
              </h3>
              <p className="mt-3 max-w-xl text-sm font-body text-muted-foreground">
                Desde casas con patios llenos de bugambilias hasta haciendas con
                spa enclavadas en la montaña, aquí empiezan tus noches en Real
                del Monte.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-[0.7rem] font-body text-muted-foreground">
              <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Disponibilidad verificada
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 backdrop-blur">
                <Star className="h-3.5 w-3.5 text-accent" />
                Basado en reseñas recientes
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {HOTELS.map((hotel, index) => (
              <motion.article
                key={hotel.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: index * 0.15, duration: 0.7, ease: "easeOut" }}
                className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur"
              >
                {/* Glow de enfoque */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-transparent to-accent/10 mix-blend-soft-light" />
                  <div className="absolute -inset-x-10 top-0 h-24 bg-gradient-to-b from-accent/25 via-transparent to-transparent blur-2xl" />
                </div>

                {/* Imagen con overlay y tag de rating */}
                <div className="relative h-[260px] overflow-hidden">
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    loading="lazy" className="h-full w-full transform object-cover transition-transform duration-900 group-hover:scale-110 group-hover:brightness-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/5 to-transparent" />

                  {/* Rating flotante */}
                  <div className="absolute right-4 top-4 flex flex-col items-end gap-1">
                    <div className="inline-flex items-center gap-1 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
                      <Star className="h-3.5 w-3.5 text-accent fill-accent" />
                      <span>{hotel.rating.toFixed(1)}</span>
                    </div>
                    <span className="rounded-full bg-background/70 px-2 py-[2px] text-[0.65rem] font-body uppercase tracking-[0.25em] text-muted-foreground backdrop-blur">
                      Curado por RDM Digital
                    </span>
                  </div>

                  {/* Etiquetas contextuales en la imagen */}
                  {hotel.tags && (
                    <div className="absolute left-4 bottom-4 flex flex-wrap gap-2">
                      {hotel.tags.map((tag) => (
                        <span
                          key={tag.label}
                          className="inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-[0.7rem] font-body text-muted-foreground backdrop-blur"
                        >
                          <tag.icon className="h-3.5 w-3.5 text-accent" />
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Contenido textual */}
                <div className="relative z-10 space-y-4 px-6 pb-5 pt-4">
                  <header className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-display text-xl font-bold text-foreground transition-colors group-hover:text-accent md:text-2xl">
                        {hotel.name}
                      </h4>
                      <p className="mt-1 text-xs font-body uppercase tracking-[0.18em] text-muted-foreground">
                        {hotel.type}
                      </p>
                    </div>
                    <div className="mt-1 flex flex-col items-end text-right text-[0.7rem] font-body text-muted-foreground">
                      <span className="rounded-full bg-background/80 px-2 py-1">
                        Estancia recomendada · 2–3 noches
                      </span>
                    </div>
                  </header>

                  <div className="flex flex-wrap gap-2">
                    {hotel.features.map((feature) => (
                      <span
                        key={feature}
                        className="inline-flex items-center rounded-full bg-muted/70 px-2.5 py-1 text-[0.7rem] font-body text-muted-foreground transition-colors group-hover:bg-muted/90"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <p className="font-display text-base font-semibold text-accent md:text-lg">
                      {hotel.price}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97, y: 0 }}
                      className="inline-flex items-center gap-2 rounded-full border border-accent/60 bg-accent/10 px-4 py-1.5 text-xs font-body uppercase tracking-[0.2em] text-accent hover:bg-accent/20"
                    >
                      Ver detalles
                      <span className="text-sm">↗</span>
                    </motion.button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Nota de confianza / contexto debajo de la grilla */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="mt-10 flex flex-col gap-3 text-xs font-body text-muted-foreground md:flex-row md:items-center md:justify-between"
          >
            <p>
              Todos los espacios listados han sido visitados y fotografiados por
              nuestro equipo en Real del Monte, para asegurar una experiencia
              coherente con lo que ves en esta guía.
            </p>
            <p className="text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground/80">
              Hospedaje · Curaduría local RDM Digital
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
