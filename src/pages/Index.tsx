import { RDMLayout } from "@/components/rdm/RDMLayout";
import { RDMHero } from "@/components/rdm/RDMHero";
import { RDMInteractiveMap } from "@/components/rdm/RDMInteractiveMap";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Pickaxe, Utensils, TreePine, MapPin, Compass, Car, Calendar, Users, Star, Camera, Heart, Lightbulb, Bed, Palette, Store } from "lucide-react";
import { SEOMeta } from "@/components/SEOMeta";
import { RUTAS_TEMATICAS, FICHA_TECNICA } from "@/data/rdm-territorial";
import { EVENTOS_RDM, DATOS_CURIOSOS, SABIAS_QUE } from "@/data/rdm-events";
import { RDM_IMAGES, GALLERY_SECTIONS } from "@/data/rdm-images";
import { useState, useEffect } from "react";

const QUICK_ACCESS = [
  { icon: MapPin, label: "Mapa", desc: "Puntos de interés", to: "/mapa", color: "hsl(var(--rdm-amber))" },
  { icon: Pickaxe, label: "Historia", desc: "500 años de minería", to: "/historia", color: "hsl(var(--rdm-blue))" },
  { icon: Utensils, label: "Gastronomía", desc: "Pastes y más", to: "/gastronomia", color: "hsl(var(--rdm-green))" },
  { icon: TreePine, label: "Naturaleza", desc: "Sierra y bosque", to: "/ecoturismo", color: "hsl(var(--rdm-green))" },
  { icon: Compass, label: "Rutas", desc: "5 recorridos", to: "/rutas", color: "hsl(var(--rdm-purple))" },
  { icon: Car, label: "Cómo llegar", desc: "Estacionamiento", to: "/estacionamientos", color: "hsl(var(--rdm-red))" },
  { icon: Calendar, label: "Eventos", desc: "Agenda cultural", to: "/eventos", color: "hsl(var(--rdm-blue))" },
  { icon: Store, label: "Registra tu Negocio", desc: "Únete al directorio", to: "/registro-comercio", color: "hsl(var(--rdm-amber))" },
];

const EXPERIENCIAS = [
  { id: "historia", title: "Historia Minera", subtitle: "500 años de plata", icon: Pickaxe, to: "/historia", span: "col-span-2 row-span-2", image: RDM_IMAGES.minaEntrance },
  { id: "gastronomia", title: "Gastronomía", subtitle: "Pastes & tradición", icon: Utensils, to: "/gastronomia", span: "col-span-1 row-span-1", image: RDM_IMAGES.pastesTraditional },
  { id: "aventura", title: "Aventura", subtitle: "Sierra salvaje", icon: TreePine, to: "/ecoturismo", span: "col-span-1 row-span-1", image: RDM_IMAGES.penasCargadas },
  { id: "plata", title: "Platerías", subtitle: "Artesanía en plata", icon: Palette, to: "/arte", span: "col-span-1 row-span-1", image: RDM_IMAGES.artesaniasPlata },
  { id: "hospedaje", title: "Hospedaje", subtitle: "Cabañas de montaña", icon: Bed, to: "/directorio", span: "col-span-1 row-span-1", image: RDM_IMAGES.hospedajeCabana },
];

const Index = () => {
  const [curioso, setCurioso] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCurioso(p => (p + 1) % DATOS_CURIOSOS.length), 5000);
    return () => clearInterval(id);
  }, []);

  const destacados = EVENTOS_RDM.filter(e => e.destacado).slice(0, 3);

  return (
    <RDMLayout>
      <SEOMeta
        title="RDM Digital — Guía Turística de Real del Monte, Pueblo Mágico"
        description="Descubre Real del Monte, Pueblo Mágico de Hidalgo. Guía turística digital con mapa interactivo, rutas, gastronomía, historia minera y eventos culturales."
      />
      <RDMHero />

      {/* Dato Curioso Rotativo */}
      <section className="py-6 px-6 md:px-16 bg-[hsl(var(--rdm-amber)/0.08)]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div key={curioso} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-3">
            <Lightbulb className="w-5 h-5 text-[hsl(var(--rdm-amber))] shrink-0" />
            <p className="text-sm text-[hsl(var(--foreground))]" style={{ fontFamily: "var(--font-body)" }}>
              <span className="font-semibold text-[hsl(var(--rdm-amber))]">¿Sabías que?</span> {DATOS_CURIOSOS[curioso]}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="py-16 px-6 md:px-16 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <p className="text-sm tracking-[0.3em] uppercase text-[hsl(var(--rdm-amber))] mb-3" style={{ fontFamily: "var(--font-body)" }}>¿Qué quieres hacer?</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Tu visita empieza aquí</h2>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {QUICK_ACCESS.map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link to={item.to} className="block rdm-glass rounded-xl p-4 text-center hover:shadow-md transition-all group">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${item.color}15` }}>
                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <h3 className="font-semibold text-sm mb-0.5 group-hover:text-[hsl(var(--rdm-amber))] transition-colors" style={{ fontFamily: "var(--font-display)" }}>{item.label}</h3>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]" style={{ fontFamily: "var(--font-body)" }}>{item.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Grid con imágenes reales */}
      <section className="py-24 px-6 md:px-16 lg:px-24">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <p className="text-sm tracking-[0.3em] uppercase text-[hsl(var(--rdm-amber))] mb-4" style={{ fontFamily: "var(--font-body)" }}>Experiencias Inmersivas</p>
          <h2 className="text-4xl md:text-6xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Cinco mundos, <span className="text-[hsl(var(--rdm-amber))]">una sierra</span>
          </h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-7xl mx-auto auto-rows-[200px] md:auto-rows-[240px]">
          {EXPERIENCIAS.map((exp, i) => (
            <motion.div key={exp.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }} className={exp.span}>
              <Link to={exp.to} className="block relative rounded-2xl overflow-hidden group cursor-pointer h-full">
                <img src={exp.image} alt={exp.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-[hsl(var(--rdm-amber)/0)] group-hover:bg-[hsl(var(--rdm-amber)/0.1)] transition-colors duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <exp.icon className="w-4 h-4 text-[hsl(var(--rdm-amber))]" />
                    </div>
                    <span className="text-xs text-[hsl(var(--rdm-amber))] font-medium tracking-wider uppercase" style={{ fontFamily: "var(--font-body)" }}>{exp.subtitle}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-[hsl(var(--rdm-amber))] transition-colors" style={{ fontFamily: "var(--font-display)" }}>{exp.title}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Galería fotográfica estilo muro */}
      <section className="py-16 px-6 md:px-16 lg:px-24 bg-[hsl(var(--muted)/0.3)]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <Camera className="w-6 h-6 mx-auto text-[hsl(var(--rdm-amber))] mb-3" />
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              Galería de <span className="text-[hsl(var(--rdm-amber))]">Real del Monte</span>
            </h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2" style={{ fontFamily: "var(--font-body)" }}>Un pueblo que enamora con cada rincón</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {[
              { img: RDM_IMAGES.callesColoridas, label: "Calles empedradas", tall: true },
              { img: RDM_IMAGES.panteonIngles, label: "Panteón Inglés" },
              { img: RDM_IMAGES.cafeMontana, label: "Café de montaña" },
              { img: RDM_IMAGES.bosqueNiebla, label: "Bosque de niebla", tall: true },
              { img: RDM_IMAGES.diaMuertos, label: "Día de Muertos" },
              { img: RDM_IMAGES.artesaniasPlata, label: "Artesanías de plata" },
              { img: RDM_IMAGES.callejonRomantico, label: "Callejones románticos" },
              { img: RDM_IMAGES.casaInglesa, label: "Arquitectura Cornish" },
            ].map((photo, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`relative rounded-xl overflow-hidden group ${photo.tall ? "row-span-2 h-full min-h-[280px]" : "h-[180px] md:h-[200px]"}`}
              >
                <img src={photo.img} alt={photo.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-medium" style={{ fontFamily: "var(--font-body)" }}>{photo.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/comunidad" className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--rdm-amber))] hover:underline" style={{ fontFamily: "var(--font-body)" }}>
              <Camera className="w-4 h-4" /> Comparte tus fotos en el muro social →
            </Link>
          </div>
        </div>
      </section>

      {/* History Preview con imagen real */}
      <section className="py-20 px-6 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-sm tracking-[0.3em] uppercase text-[hsl(var(--rdm-amber))] mb-4" style={{ fontFamily: "var(--font-body)" }}>Memoria de Alta Fidelidad</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>
              500 años de <span className="text-[hsl(var(--rdm-amber))]">historia minera</span>
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] leading-relaxed mb-4" style={{ fontFamily: "var(--font-body)" }}>
              Real del Monte guarda la memoria de la migración cornish que trajo consigo técnicas mineras, el fútbol y los pastes. Un legado que vive en cada callejón empedrado y en cada bocado.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[{ v: "460+", l: "Años de minería" }, { v: "500+ km", l: "De túneles" }, { v: "3,000+", l: "Inmigrantes cornish" }, { v: "35+", l: "Minas históricas" }].map(s => (
                <div key={s.l} className="rdm-glass rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-[hsl(var(--rdm-amber))]" style={{ fontFamily: "var(--font-display)" }}>{s.v}</p>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))]" style={{ fontFamily: "var(--font-body)" }}>{s.l}</p>
                </div>
              ))}
            </div>
            <Link to="/historia" className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--rdm-amber))] hover:underline" style={{ fontFamily: "var(--font-body)" }}>
              <Pickaxe className="w-4 h-4" /> Explorar la historia completa
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-2xl overflow-hidden h-[350px]">
            <img src={RDM_IMAGES.minaEntrance} alt="Mina de Acosta" className="w-full h-full object-cover" loading="lazy" />
          </motion.div>
        </div>
      </section>

      {/* Sabías que... */}
      <section className="py-16 px-6 md:px-16 lg:px-24 bg-[hsl(var(--muted)/0.2)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4">
            {SABIAS_QUE.slice(0, 3).map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rdm-glass rounded-xl p-5">
                <Lightbulb className="w-5 h-5 text-[hsl(var(--rdm-amber))] mb-3" />
                <h3 className="font-semibold text-sm mb-2" style={{ fontFamily: "var(--font-display)" }}>{item.titulo}</h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>{item.texto}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rutas Temáticas Preview */}
      <section className="py-20 px-6 md:px-16 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-sm tracking-[0.3em] uppercase text-[hsl(var(--rdm-amber))] mb-3" style={{ fontFamily: "var(--font-body)" }}>Recorridos Guiados</p>
            <h2 className="text-3xl md:text-5xl font-bold" style={{ fontFamily: "var(--font-display)" }}>5 rutas <span className="text-[hsl(var(--rdm-amber))]">temáticas</span></h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {RUTAS_TEMATICAS.slice(0, 3).map((ruta, i) => (
              <motion.div key={ruta.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rdm-glass rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: ruta.color }} />
                  <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]" style={{ fontFamily: "var(--font-body)" }}>{ruta.dificultad} · {ruta.duracion}</span>
                </div>
                <h3 className="font-semibold text-base mb-2" style={{ fontFamily: "var(--font-display)" }}>{ruta.nombre}</h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed mb-3" style={{ fontFamily: "var(--font-body)" }}>{ruta.descripcion}</p>
                <div className="flex flex-wrap gap-1">
                  {ruta.paradas.slice(0, 3).map(p => (
                    <span key={p} className="px-2 py-0.5 rounded-full bg-[hsl(var(--muted))] text-[10px]" style={{ fontFamily: "var(--font-body)" }}>{p}</span>
                  ))}
                  {ruta.paradas.length > 3 && <span className="px-2 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">+{ruta.paradas.length - 3}</span>}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/rutas" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[hsl(var(--rdm-amber))] text-white text-sm font-semibold hover:scale-105 transition-transform" style={{ fontFamily: "var(--font-body)" }}>
              <Compass className="w-4 h-4" /> Ver todas las rutas
            </Link>
          </div>
        </div>
      </section>

      {/* Eventos Destacados */}
      <section className="py-20 px-6 md:px-16 lg:px-24 bg-[hsl(var(--muted)/0.3)]">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <Calendar className="w-6 h-6 mx-auto text-[hsl(var(--rdm-amber))] mb-3" />
            <h2 className="text-3xl md:text-5xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              Eventos <span className="text-[hsl(var(--rdm-amber))]">imperdibles</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-4">
            {destacados.map((evt, i) => (
              <motion.div key={evt.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to="/eventos" className="block rdm-glass rounded-xl overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="relative h-40 overflow-hidden">
                    <img src={RDM_IMAGES[evt.image.replace("rdm-", "").replace(/-([a-z])/g, (_, c) => c.toUpperCase()) as keyof typeof RDM_IMAGES] || RDM_IMAGES.festivalPaste} alt={evt.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-[hsl(var(--rdm-amber))] text-white text-[10px] font-bold">{evt.date}</div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1" style={{ fontFamily: "var(--font-display)" }}>{evt.name}</h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2" style={{ fontFamily: "var(--font-body)" }}>{evt.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/eventos" className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--rdm-amber))] hover:underline" style={{ fontFamily: "var(--font-body)" }}>
              <Calendar className="w-4 h-4" /> Ver agenda completa ({EVENTOS_RDM.length} eventos)
            </Link>
          </div>
        </div>
      </section>

      <RDMInteractiveMap />

      {/* Datos rápidos */}
      <section className="py-16 px-6 md:px-16 lg:px-24">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              Real del Monte en <span className="text-[hsl(var(--rdm-amber))]">números</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: FICHA_TECNICA.altitud, label: "Altitud" },
              { value: FICHA_TECNICA.temperatura, label: "Temperatura media" },
              { value: FICHA_TECNICA.fundacion, label: "Fundación" },
              { value: FICHA_TECNICA.designacion, label: "Pueblo Mágico" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rdm-glass rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-[hsl(var(--rdm-amber))]" style={{ fontFamily: "var(--font-display)" }}>{stat.value}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1" style={{ fontFamily: "var(--font-body)" }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Registra tu negocio CTA */}
      <section className="py-16 px-6 md:px-16 lg:px-24 bg-[hsl(var(--rdm-amber)/0.06)]">
        <div className="max-w-4xl mx-auto text-center">
          <Store className="w-8 h-8 mx-auto text-[hsl(var(--rdm-amber))] mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            ¿Tienes un negocio en Real del Monte?
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] max-w-md mx-auto mb-6" style={{ fontFamily: "var(--font-body)" }}>
            Registra tu comercio, hotel, restaurante o servicio turístico y aparece en el mapa y directorio digital de RDM.
          </p>
          <Link to="/registro-comercio" className="inline-flex items-center gap-3 bg-[hsl(var(--rdm-amber))] text-white px-8 py-4 rounded-full font-semibold text-sm hover:scale-105 transition-transform" style={{ fontFamily: "var(--font-body)" }}>
            <Store className="w-4 h-4" /> Registrar mi negocio
          </Link>
        </div>
      </section>

      {/* CTA Final */}
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
            <Link to="/mapa" className="inline-flex items-center gap-3 bg-[hsl(var(--rdm-amber))] text-white px-10 py-4 rounded-full font-semibold text-sm hover:scale-105 transition-transform" style={{ fontFamily: "var(--font-body)" }}>
              <MapPin className="w-4 h-4" /> Explorar Mapa
            </Link>
            <Link to="/comunidad" className="inline-flex items-center gap-3 border-2 border-[hsl(var(--rdm-amber))] text-[hsl(var(--rdm-amber))] px-10 py-4 rounded-full font-semibold text-sm hover:bg-[hsl(var(--rdm-amber)/0.1)] transition-colors" style={{ fontFamily: "var(--font-body)" }}>
              <Heart className="w-4 h-4" /> Muro Social
            </Link>
          </div>
        </motion.div>
      </section>
    </RDMLayout>
  );
};

export default Index;
