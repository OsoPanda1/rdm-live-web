import { RDMLayout } from "@/components/rdm/RDMLayout";
import { RDMHero } from "@/components/rdm/RDMHero";
import { RDMExperienceGrid } from "@/components/rdm/RDMExperienceGrid";
import { RDMInteractiveMap } from "@/components/rdm/RDMInteractiveMap";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Pickaxe, Utensils, TreePine, MapPin, Compass, Car, Calendar, Users, Star } from "lucide-react";
import { SEOMeta } from "@/components/SEOMeta";
import { RUTAS_TEMATICAS, FICHA_TECNICA } from "@/data/rdm-territorial";

const QUICK_ACCESS = [
  { icon: MapPin, label: "Mapa", desc: "Puntos de interés", to: "/mapa", color: "hsl(var(--rdm-amber))" },
  { icon: Pickaxe, label: "Historia", desc: "500 años de minería", to: "/historia", color: "hsl(var(--rdm-blue))" },
  { icon: Utensils, label: "Gastronomía", desc: "Pastes y más", to: "/gastronomia", color: "hsl(var(--rdm-green))" },
  { icon: TreePine, label: "Naturaleza", desc: "Sierra y bosque", to: "/ecoturismo", color: "hsl(var(--rdm-green))" },
  { icon: Compass, label: "Rutas", desc: "5 recorridos", to: "/rutas", color: "hsl(var(--rdm-purple))" },
  { icon: Car, label: "Cómo llegar", desc: "Estacionamiento", to: "/estacionamientos", color: "hsl(var(--rdm-red))" },
  { icon: Calendar, label: "Eventos", desc: "Agenda cultural", to: "/eventos", color: "hsl(var(--rdm-blue))" },
  { icon: Users, label: "Directorio", desc: "Negocios locales", to: "/directorio", color: "hsl(var(--rdm-amber))" },
];

const Index = () => {
  return (
    <RDMLayout hideNav>
      <SEOMeta
        title="RDM Digital — Guía Turística de Real del Monte"
        description="Descubre Real del Monte, Pueblo Mágico de Hidalgo. Guía turística digital con mapa interactivo, rutas, gastronomía, historia minera y eventos culturales."
      />
      <RDMHero />

      {/* Quick Access Grid */}
      <section className="py-16 px-6 md:px-16 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-sm tracking-[0.3em] uppercase text-[hsl(var(--rdm-amber))] mb-3" style={{ fontFamily: "var(--font-body)" }}>
              ¿Qué quieres hacer?
            </p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              Tu visita empieza aquí
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {QUICK_ACCESS.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={item.to}
                  className="block rdm-glass rounded-xl p-4 text-center hover:shadow-md transition-all group"
                >
                  <div
                    className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                    style={{ background: `${item.color}15` }}
                  >
                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <h3 className="font-semibold text-sm mb-0.5 group-hover:text-[hsl(var(--rdm-amber))] transition-colors" style={{ fontFamily: "var(--font-display)" }}>
                    {item.label}
                  </h3>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]" style={{ fontFamily: "var(--font-body)" }}>
                    {item.desc}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <RDMExperienceGrid />

      {/* History Preview */}
      <section className="py-20 px-6 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-sm tracking-[0.3em] uppercase text-[hsl(var(--rdm-amber))] mb-4" style={{ fontFamily: "var(--font-body)" }}>
              Memoria de Alta Fidelidad
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>
              500 años de <span className="text-[hsl(var(--rdm-amber))]">historia minera</span>
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] leading-relaxed mb-6" style={{ fontFamily: "var(--font-body)" }}>
              Real del Monte guarda la memoria de la migración cornish que trajo consigo técnicas mineras,
              el futbol y los pastes. Un legado que vive en cada callejón empedrado y en cada bocado.
            </p>
            <Link
              to="/historia"
              className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--rdm-amber))] hover:underline"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <Pickaxe className="w-4 h-4" /> Explorar la historia completa
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden h-[350px]"
            style={{ background: "linear-gradient(135deg, hsl(24 40% 25%), hsl(218 24% 15%))" }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <Pickaxe className="w-24 h-24 text-[hsl(var(--rdm-amber)/0.3)]" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Rutas Temáticas Preview */}
      <section className="py-20 px-6 md:px-16 lg:px-24 bg-[hsl(var(--muted)/0.3)]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-sm tracking-[0.3em] uppercase text-[hsl(var(--rdm-amber))] mb-3" style={{ fontFamily: "var(--font-body)" }}>
              Recorridos Guiados
            </p>
            <h2 className="text-3xl md:text-5xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              5 rutas <span className="text-[hsl(var(--rdm-amber))]">temáticas</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {RUTAS_TEMATICAS.slice(0, 3).map((ruta, i) => (
              <motion.div
                key={ruta.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rdm-glass rounded-xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: ruta.color }} />
                  <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]" style={{ fontFamily: "var(--font-body)" }}>
                    {ruta.dificultad} · {ruta.duracion}
                  </span>
                </div>
                <h3 className="font-semibold text-base mb-2" style={{ fontFamily: "var(--font-display)" }}>{ruta.nombre}</h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed mb-3" style={{ fontFamily: "var(--font-body)" }}>
                  {ruta.descripcion}
                </p>
                <div className="flex flex-wrap gap-1">
                  {ruta.paradas.slice(0, 3).map((p) => (
                    <span key={p} className="px-2 py-0.5 rounded-full bg-[hsl(var(--muted))] text-[10px]" style={{ fontFamily: "var(--font-body)" }}>
                      {p}
                    </span>
                  ))}
                  {ruta.paradas.length > 3 && (
                    <span className="px-2 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">+{ruta.paradas.length - 3}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/rutas"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[hsl(var(--rdm-amber))] text-white text-sm font-semibold hover:scale-105 transition-transform"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <Compass className="w-4 h-4" /> Ver todas las rutas
            </Link>
          </div>
        </div>
      </section>

      <RDMInteractiveMap />

      {/* Datos rápidos */}
      <section className="py-16 px-6 md:px-16 lg:px-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              Real del Monte en <span className="text-[hsl(var(--rdm-amber))]">números</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: FICHA_TECNICA.altitud, label: "Altitud" },
              { value: FICHA_TECNICA.temperatura, label: "Temperatura media" },
              { value: FICHA_TECNICA.fundacion, label: "Fundación" },
              { value: FICHA_TECNICA.designacion, label: "Desde" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rdm-glass rounded-xl p-5 text-center"
              >
                <p className="text-2xl font-bold text-[hsl(var(--rdm-amber))]" style={{ fontFamily: "var(--font-display)" }}>{stat.value}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1" style={{ fontFamily: "var(--font-body)" }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Star className="w-8 h-8 mx-auto text-[hsl(var(--rdm-amber))] mb-4" />
          <h2 className="text-4xl md:text-6xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>
            Tu aventura <span className="text-[hsl(var(--rdm-amber))]">comienza aquí</span>
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] max-w-md mx-auto mb-8" style={{ fontFamily: "var(--font-body)" }}>
            Real del Monte te espera con 500 años de historia, sabores únicos y la magia de la Sierra de Pachuca.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/mapa"
              className="inline-flex items-center gap-3 bg-[hsl(var(--rdm-amber))] text-white px-10 py-4 rounded-full font-semibold text-sm hover:scale-105 transition-transform"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <MapPin className="w-4 h-4" /> Explorar Mapa
            </Link>
            <Link
              to="/rutas"
              className="inline-flex items-center gap-3 border-2 border-[hsl(var(--rdm-amber))] text-[hsl(var(--rdm-amber))] px-10 py-4 rounded-full font-semibold text-sm hover:bg-[hsl(var(--rdm-amber)/0.1)] transition-colors"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <Compass className="w-4 h-4" /> Ver Rutas
            </Link>
          </div>
        </motion.div>
      </section>
    </RDMLayout>
  );
};

export default Index;
