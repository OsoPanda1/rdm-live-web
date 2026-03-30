import { motion } from "framer-motion";
import { Car, MapPin, Navigation, AlertCircle, Clock } from "lucide-react";
import { RDMLayout } from "@/components/rdm/RDMLayout";
import { SEOMeta } from "@/components/SEOMeta";
import { ESTACIONAMIENTOS } from "@/data/rdm-territorial";

const TIPO_COLOR: Record<string, string> = {
  masiva: "hsl(var(--rdm-green))",
  alta: "hsl(var(--rdm-blue))",
  media: "hsl(var(--rdm-amber))",
  baja: "hsl(var(--rdm-purple))",
};

const TIPO_LABEL: Record<string, string> = {
  masiva: "Capacidad Masiva",
  alta: "Capacidad Alta",
  media: "Capacidad Media",
  baja: "Capacidad Baja",
};

const CONSEJOS = [
  { icon: Clock, title: "Horarios pico", desc: "Sábados y domingos 11:00–15:00 son los horarios de mayor afluencia. Recomendamos llegar temprano." },
  { icon: Navigation, title: "Acceso principal", desc: "La Av. Juárez es la entrada principal al pueblo. El Estacionamiento Mayor (EST-03) es el más accesible." },
  { icon: AlertCircle, title: "Contingencia / Ferias", desc: "Durante eventos especiales, se habilitan zonas de desahogo en Tezoantla y la periferia del Barrio Viento." },
];

export default function EstacionamientosPage() {
  return (
    <RDMLayout>
      <SEOMeta title="Dónde Estacionar — Real del Monte" description="Guía completa de estacionamientos en Real del Monte. Ubicaciones, capacidad y consejos de movilidad para tu visita." />

      {/* Hero */}
      <section className="pt-24 pb-12 px-6 md:px-16 lg:px-24">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm tracking-[0.3em] uppercase text-[hsl(var(--rdm-amber))] mb-3" style={{ fontFamily: "var(--font-body)" }}>
              Movilidad y Logística
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Dónde <span className="text-[hsl(var(--rdm-amber))]">estacionar</span>
            </h1>
            <p className="text-[hsl(var(--muted-foreground))] max-w-2xl text-lg leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Real del Monte cuenta con 7 estacionamientos principales distribuidos estratégicamente.
              Encuentra el más cercano a tu destino.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Estacionamientos Grid */}
      <section className="px-6 md:px-16 lg:px-24 pb-16">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ESTACIONAMIENTOS.map((est, i) => (
            <motion.div
              key={est.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rdm-glass rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${TIPO_COLOR[est.tipo]}20` }}
                  >
                    <Car className="w-4 h-4" style={{ color: TIPO_COLOR[est.tipo] }} />
                  </div>
                  <span className="text-[10px] font-mono text-[hsl(var(--muted-foreground))]">{est.id}</span>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                  style={{ background: TIPO_COLOR[est.tipo] }}
                >
                  {TIPO_LABEL[est.tipo]}
                </span>
              </div>

              <h3 className="font-semibold text-base mb-1" style={{ fontFamily: "var(--font-display)" }}>{est.nombre}</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2" style={{ fontFamily: "var(--font-body)" }}>
                <MapPin className="w-3 h-3 inline mr-1" />
                {est.ubicacion}
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]" style={{ fontFamily: "var(--font-body)" }}>
                {est.capacidad}
              </p>

              <a
                href={`https://www.google.com/maps?q=${est.lat},${est.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-xs text-[hsl(var(--rdm-amber))] hover:underline"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <Navigation className="w-3 h-3" /> Abrir en Google Maps
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Consejos */}
      <section className="py-16 px-6 md:px-16 lg:px-24 bg-[hsl(var(--muted)/0.3)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10" style={{ fontFamily: "var(--font-display)" }}>
            Consejos de movilidad
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {CONSEJOS.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--rdm-amber)/0.1)] flex items-center justify-center mx-auto mb-3">
                  <c.icon className="w-5 h-5 text-[hsl(var(--rdm-amber))]" />
                </div>
                <h3 className="font-semibold text-sm mb-2" style={{ fontFamily: "var(--font-display)" }}>{c.title}</h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </RDMLayout>
  );
}
