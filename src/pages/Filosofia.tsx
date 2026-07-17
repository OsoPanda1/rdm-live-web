import { WikiPage } from "@/components/WikiPage";
import { Section } from "@/components/WikiElements";

const Filosofia = () => (
  <WikiPage
    title="Filosofía y Códice Maestro"
        subtitle="Los principios que rigen el ecosistema TAMV"
      >
        {/* Hero Banner */}
        <div className="relative h-48 w-full overflow-hidden">
          <img src="/images/rooftops-sunrise.jpg" alt="Azoteas al amanecer en Real del Monte" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        <Section title="El Códice Kórima">
      <p className="text-muted-foreground leading-relaxed">
        La arquitectura TAMV se rige por el <strong className="text-primary">Códice Kórima</strong>, inspirado
        en la filosofía Rarámuri de reciprocidad. Este códice establece que toda tecnología dentro del ecosistema
        debe servir para fortalecer la dignidad humana, no para extraer valor de las personas.
      </p>
    </Section>

    <Section title="Principios fundamentales">
      <ul className="space-y-3">
        {[
          { name: "Soberanía digital", desc: "Cada persona es dueña de su identidad y datos." },
          { name: "Transparencia radical", desc: "Todo proceso es auditable y documentado públicamente." },
          { name: "Ética integrada", desc: "La ética no es un módulo externo, sino parte del código base." },
          { name: "Reciprocidad (Kórima)", desc: "El valor generado se redistribuye equitativamente." },
          { name: "Determinismo estructural", desc: "La arquitectura garantiza predictibilidad y trazabilidad." },
        ].map((p) => (
          <li key={p.name} className="flex gap-3 items-start">
            <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
            <div>
              <strong className="text-foreground">{p.name}</strong>
              <span className="text-muted-foreground"> — {p.desc}</span>
            </div>
          </li>
        ))}
      </ul>
    </Section>

    <Section title="Leyes constitucionales del código">
      <div className="space-y-2">
        {[
          { id: "L1", rule: "createRoot solo existe en src/main.tsx" },
          { id: "L2", rule: "BrowserRouter restringido a src/App.tsx" },
          { id: "L3", rule: "Layout.tsx montado exactamente una vez en App.tsx" },
        ].map((l) => (
          <div key={l.id} className="flex items-center gap-3 rounded-md border border-border/50 bg-muted/30 px-4 py-2.5">
            <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{l.id}</span>
            <span className="text-sm text-muted-foreground">{l.rule}</span>
          </div>
        ))}
      </div>
    </Section>
  </WikiPage>
);

export default Filosofia;
