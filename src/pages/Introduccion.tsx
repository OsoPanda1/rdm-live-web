import { WikiPage } from "@/components/WikiPage";
import { Section } from "@/components/WikiElements";
import { Users, Code, Building, Globe } from "lucide-react";

const Introduccion = () => (
  <WikiPage
    title="Introducción"
        subtitle="¿Qué es TAMV y por qué existe?"
      >
        {/* Hero Banner */}
        <div className="relative h-48 w-full overflow-hidden">
          <img src="/images/heroprincipal.png" alt="Hero principal de TAMV" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        <Section title="¿Qué es TAMV?">
      <p className="text-muted-foreground leading-relaxed">
        <strong className="text-foreground">TAMV MD‑X4</strong> es un ecosistema civilizatorio digital nacido en México
        que integra identidad soberana, educación inmersiva, metaverso, economía ética y seguridad avanzada en una sola
        infraestructura auditable. Se plantea como el primer <strong className="text-primary">CITEMESH</strong>: un metaverso
        civilizatorio diseñado para servir a las personas y no a la publicidad ni a la vigilancia masiva.
      </p>
    </Section>

    <Section title="¿Quién puede usar TAMV MD‑X4?">
      <p className="text-muted-foreground leading-relaxed mb-4">
        TAMV está diseñado como plantilla replicable para múltiples segmentos. Cada uno accede al ecosistema
        según su nivel de membresía (ver <strong className="text-primary">Economía TAMV</strong> para detalles completos).
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { icon: Users, segment: "Ciudadanos y estudiantes", desc: "Acceso libre (Free) para explorar la wiki, usar Isabella AI y aprender sobre soberanía digital." },
          { icon: Code, segment: "Desarrolladores y labs", desc: "Nivel Devs con sandbox técnico, Kit de APIs completo y documentación avanzada para construir sobre TAMV." },
          { icon: Building, segment: "Instituciones y universidades", desc: "Nivel Advance con monitoreo avanzado, configuración de nodos y soporte prioritario para pilotos institucionales." },
          { icon: Globe, segment: "Gobiernos y grandes empresas", desc: "Nivel Enterprise con despliegues federados llave en mano, SLA dedicado y gobernanza compartida." },
        ].map((s) => (
          <div key={s.segment} className="rounded-lg border border-border/50 bg-card/60 p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-foreground text-sm">{s.segment}</h4>
            </div>
            <p className="text-xs text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Origen e historia">
      <p className="text-muted-foreground leading-relaxed">
        TAMV no nace en un laboratorio corporativo, sino desde la experiencia personal de su fundador
        (<strong className="text-foreground">Anubis Villaseñor / Edwin Oswaldo Castillo Trejo</strong>) tras miles
        de horas de autoestudio, rechazo laboral y frustración con la educación tecnológica superficial.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        Entre 2020 y 2026 se documentan más de <strong className="text-primary">21,000 horas</strong> de trabajo
        dedicadas a conceptualizar, diseñar, programar y narrar el ecosistema, sosteniéndolo prácticamente como
        "proyecto de un solo ser humano".
      </p>
    </Section>

    <Section title="Propósito civilizatorio">
      <p className="text-muted-foreground leading-relaxed">
        El objetivo de TAMV es encender una infraestructura digital que permita a personas, organizaciones y ciudades
        construir futuro con dignidad, transparencia y control ciudadano sobre los datos. Más que ser "otra red social",
        busca operar como un <strong className="text-secondary">sistema operativo civilizatorio latinoamericano</strong>,
        documentado públicamente y diseñado como obra digital ligada a la evolución de la región.
      </p>
    </Section>

    <Section title="Tecnología y estándares">
      <div className="rounded-lg border border-border bg-card/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 text-foreground font-medium">Capa</th>
              <th className="text-left px-4 py-2.5 text-foreground font-medium">Tecnologías</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="px-4 py-2.5 font-medium text-foreground">Frontend</td>
              <td className="px-4 py-2.5">React 18, TypeScript, Vite, Tailwind CSS, Framer Motion</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="px-4 py-2.5 font-medium text-foreground">3D/XR</td>
              <td className="px-4 py-2.5">Three.js, React Three Fiber, Drei</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="px-4 py-2.5 font-medium text-foreground">Backend</td>
              <td className="px-4 py-2.5">Supabase (PostgreSQL, Auth, Edge Functions, Storage)</td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 font-medium text-foreground">Alineación</td>
              <td className="px-4 py-2.5">Web 4.0/5.0, AI Act, GDPR, ISO, NOM</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Section>
  </WikiPage>
);

export default Introduccion;
