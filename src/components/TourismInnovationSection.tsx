import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { CheckCircle2, Clock3 } from "lucide-react";
import { ElegantPagination } from "@/components/ElegantPagination";
import { GLOBAL_TOURISM_FEATURES } from "@/lib/tourism-knowledge";

const PAGE_SIZE = 6;

export function TourismInnovationSection() {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(GLOBAL_TOURISM_FEATURES.length / PAGE_SIZE);

  const items = useMemo(
    () => GLOBAL_TOURISM_FEATURES.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [page],
  );

  const implementedCount = GLOBAL_TOURISM_FEATURES.filter((feature) => feature.implemented).length;

  return (
    <section id="innovacion" className="mx-auto max-w-7xl px-6 py-20 md:px-16 lg:px-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-10 text-center"
      >
        <p className="mb-4 font-body text-sm uppercase tracking-[0.3em] text-accent">🧠 Turismo Digital Avanzado</p>
        <h2 className="font-display text-4xl font-bold md:text-6xl">
          30 capacidades globales
          <br />
          <span className="text-accent">mapeadas al producto</span>
        </h2>
        <p className="mx-auto mt-6 max-w-3xl font-body text-base leading-relaxed text-foreground/70">
          Investigación comparativa de estándares en plataformas turísticas internacionales,
          aterrizada en un roadmap ejecutable para RDM Digital con enfoque en valor real para visitantes.
        </p>
      </motion.div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card/70 p-6 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground">Capacidades implementadas</p>
          <p className="mt-2 font-display text-4xl font-bold text-accent">{implementedCount}/30</p>
          <p className="mt-2 text-sm text-foreground/70">Base productiva activa con navegación, IA, telemetría y narrativa inmersiva.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card/70 p-6 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground">Checklist pre-producción</p>
          <ul className="mt-3 space-y-2 text-sm text-foreground/80">
            <li>• Cerrar módulos UI por vertical turística.</li>
            <li>• Integrar reservas, reseñas verificadas y analytics de conversión.</li>
            <li>• Validar seguridad, observabilidad y flujos de despliegue continuo.</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.map((feature, index) => (
          <motion.article
            key={feature.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="rounded-2xl border border-border bg-card/70 p-5 backdrop-blur-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">{feature.id}</span>
              {feature.implemented ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-1 text-xs font-medium text-accent">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Activo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5" /> Roadmap
                </span>
              )}
            </div>
            <h3 className="font-display text-lg font-semibold">{feature.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">{feature.description}</p>
          </motion.article>
        ))}
      </div>

      <ElegantPagination page={page} totalPages={totalPages} onChange={setPage} />
    </section>
  );
}
