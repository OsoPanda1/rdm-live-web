import Navbar from "@/components/Navbar";
import { FooterSection } from "@/components/FooterSection";

export default function ComerciosPanel() {
  return (
    <div>
      <Navbar />
      <main className="container mx-auto px-6 pt-28 pb-20 space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Panel de Comerciante</h1>
          <p className="text-muted-foreground">Resumen operativo y métricas base de tu negocio en RDM·X.</p>
        </header>

        <section className="grid md:grid-cols-3 gap-4">
          {[
            { label: "Vistas del perfil", value: "1,248" },
            { label: "Clics a cómo llegar", value: "326" },
            { label: "Recomendaciones Realito", value: "89" },
          ].map((metric) => (
            <article key={metric.label} className="glass-surface p-5">
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{metric.label}</p>
              <p className="text-3xl font-bold mt-2">{metric.value}</p>
            </article>
          ))}
        </section>

        <section className="glass-surface p-6">
          <h2 className="text-xl font-semibold mb-2">Centro de Visibilidad Comercial</h2>
          <p className="text-muted-foreground">
            En esta etapa inicial, el módulo privado te explica cómo se recomiendan perfiles por categoría, cercanía y
            calidad de ficha.
          </p>
        </section>
      </main>
      <FooterSection />
    </div>
  );
}
