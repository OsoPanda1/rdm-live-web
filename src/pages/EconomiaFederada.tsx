import { WikiPage } from "@/components/WikiPage";
import { Section, InfoBox } from "@/components/WikiElements";
import { Coins, TrendingUp, Users, Building2, Briefcase, Heart } from "lucide-react";

const categorias = [
  {
    icon: Coins,
    title: "A. Creación y Contenido",
    items: ["Venta directa de contenido digital", "Suscripciones por creador", "Acceso premium a conocimiento", "Licencias culturales y artísticas", "Royalties automáticos", "Micropagos educativos"],
  },
  {
    icon: Users,
    title: "B. Interacción y Presencia",
    items: ["Eventos XR inmersivos", "Espacios privados habitables", "Experiencias inmersivas patrocinadas", "Servicios de mentoría"],
  },
  {
    icon: Heart,
    title: "C. Economía Social",
    items: ["Donaciones verificables", "Fondos comunitarios", "Mecenazgo distribuido", "Economías locales digitales"],
  },
  {
    icon: Building2,
    title: "D. Servicios y Herramientas",
    items: ["SaaS TAMV", "APIs especializadas", "Infraestructura de identidad", "Custodia de memoria probatoria"],
  },
  {
    icon: TrendingUp,
    title: "E. Finanzas Éticas",
    items: ["Reparto de ingresos programado", "Escrow inteligente", "Recompensas por impacto", "Economía de reputación"],
  },
  {
    icon: Briefcase,
    title: "F. Trabajo y Valor Humano",
    items: ["Freelance soberano", "Trabajo por misión", "Bounties éticos", "Cooperativas digitales"],
  },
];

const metricasEcon = [
  { label: "Ingresos Mensuales", value: "$42M" },
  { label: "Ganancias Creadores", value: "$29.4M (70%)" },
  { label: "Volumen Marketplace", value: "$25M/mes" },
  { label: "Regalos Virtuales", value: "$15M/mes" },
];

const EconomiaFederada = () => (
  <WikiPage
    title="Economía Federada TAMV"
      subtitle="30+ Formas de Monetización Ética — Sistema FairSplit de Reparto Justo"
    >
      {/* Hero Banner */}
      <div className="relative h-48 w-full overflow-hidden">
        <img src="/images/aerial-realmont.jpg" alt="Vista aérea de Real del Monte" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>
      <InfoBox type="success" title="Modelo Económico Civilizatorio">
      La economía TAMV redistribuye el 70% de los ingresos a los creadores, con transparencia total 
      y trazabilidad blockchain mediante el sistema FairSplit.
    </InfoBox>

    <Section title="30+ Formas de Monetización" icon={Coins}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categorias.map((cat) => (
          <div key={cat.title} className="rounded-lg border border-border/50 bg-card/30 p-5">
            <div className="flex items-center gap-3 mb-3">
              <cat.icon className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">{cat.title}</h3>
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {cat.items.map((item, i) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-xs text-primary font-mono">{String(i + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>

    <Section title="G. Institucional">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {["Licencias empresariales", "Integraciones gubernamentales", "Educación institucional", "Consultoría civilizatoria"].map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-md border border-border/50 bg-muted/20 px-3 py-2">
            <span className="text-primary">◆</span>
            <span className="text-sm text-muted-foreground">{item}</span>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Sistema FairSplit" icon={TrendingUp}>
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><span className="text-primary">✓</span> Reparto proporcional al valor aportado</div>
          <div className="flex items-center gap-2"><span className="text-primary">✓</span> Ajuste dinámico por reputación e impacto</div>
          <div className="flex items-center gap-2"><span className="text-primary">✓</span> Porcentaje mínimo garantizado al creador (70%)</div>
          <div className="flex items-center gap-2"><span className="text-primary">✓</span> Transparencia total en distribución</div>
        </div>
        <div className="mt-4 rounded-md bg-muted/30 p-3 font-mono text-xs">
          <span className="text-primary">platform_fee:</span> 5% | <span className="text-primary">creator_minimum:</span> 70% | <span className="text-primary">community_fund:</span> 25%
        </div>
      </div>
    </Section>

    <Section title="Métricas Económicas">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metricasEcon.map((m) => (
          <div key={m.label} className="rounded-lg border border-border/50 bg-card/30 p-4 text-center">
            <div className="text-xl font-bold text-primary">{m.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Servicios Financieros">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          "Banco Digital TAMV — Servicios globales",
          "Trading de Criptomonedas — IA predictiva",
          "Inversiones en NFTs — Arte digital verificado",
          "Bienes Raíces Virtuales — Inversión inmobiliaria",
          "Remesas Globales — Instantáneas y baratas",
        ].map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-md border border-border/50 bg-muted/20 px-3 py-2">
            <span className="text-primary">◆</span>
            <span className="text-sm text-muted-foreground">{item}</span>
          </div>
        ))}
      </div>
    </Section>
  </WikiPage>
);

export default EconomiaFederada;
