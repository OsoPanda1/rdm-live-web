import { motion } from "framer-motion";

const donationAreas = [
  { label: "Infraestructura digital", desc: "Servidores, bases de datos, monitoreo." },
  { label: "Sensores & Red mesh", desc: "Fase 2 y 3: afluencia y WiFi comunitario." },
  { label: "Cultura & educación", desc: "Narrativas, talleres, documentación abierta." },
];

export function DonationsSection() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-display font-bold">Aporta a RDM Digital</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Tu apoyo ayuda a mantener servidores, desplegar sensores de afluencia,
          construir la red WiFi soberana y conservar el legado minero y cultural.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {donationAreas.map((item) => (
          <motion.div
            key={item.label}
            whileHover={{ y: -4 }}
            className="glass-card rounded-2xl border border-border/30 p-4"
          >
            <h3 className="text-sm font-semibold">{item.label}</h3>
            <p className="mt-2 text-xs text-muted-foreground">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 text-center">
        <p className="text-xs text-muted-foreground">
          Próximamente habilitaremos rutas de donación formales (fundación / patronato local).
        </p>
        <a
          href="mailto:donaciones@rdm.digital"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold via-amber-400 to-electric px-5 py-2 text-[11px] font-semibold text-slate-950 shadow-md"
        >
          Contactar para aportar
        </a>
      </div>
    </section>
  );
}
