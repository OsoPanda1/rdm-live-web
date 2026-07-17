import { WikiPage } from "@/components/WikiPage";
import { Section, InfoCard } from "@/components/WikiElements";
import { Layers, Shield, Brain, Globe, Network, Cpu, Palette, Clock, Coins, Zap, BookOpen, Lock } from "lucide-react";
import { motion } from "framer-motion";

const FEDERACIONES = [
  {
    id: "DEKATEOTL",
    name: "Dekateotl™",
    subtitle: "Gobernanza Ética y Lógica Narrativa",
    stack: "LangGraph + SHAP (Explainable AI)",
    desc: "Orquestador de axiología. Utiliza valores de Shapley para desglosar la toma de decisiones de la IA, garantizando que cada respuesta de Isabella IA™ sea ética, transparente y auditable en tiempo real.",
    icon: Brain,
    color: "hsl(var(--rdm-amber))",
  },
  {
    id: "ANUBIS",
    name: "Anubis Sentinel™",
    subtitle: "Seguridad Post-Cuántica (PQC)",
    stack: "CRYSTALS-Dilithium + CRYSTALS-Kyber + zk-SNARKs",
    desc: "Implementa los estándares del NIST para la era cuántica. Protege la integridad del territorio contra amenazas futuras, asegurando que la soberanía de los datos sea inexpugnable ante la computación cuántica.",
    icon: Shield,
    color: "hsl(var(--rdm-red))",
  },
  {
    id: "BOOKPI",
    name: "BookPI™ / DataGit™",
    subtitle: "Inmutabilidad y Auditoría",
    stack: "IPFS Pinning + Blockchain MSR",
    desc: "Registro de trazabilidad granular mediante árboles de Merkle. Cada interacción se convierte en un compromiso atómico e inalterable, creando una \"Caja Negra\" del desarrollo territorial.",
    icon: BookOpen,
    color: "hsl(var(--rdm-blue))",
  },
  {
    id: "PHOENIX",
    name: "Phoenix Protocol™",
    subtitle: "Resiliencia y Topología P2P",
    stack: "libp2p + Swarm Quorum",
    desc: "Garantiza la disponibilidad del sistema incluso en escenarios críticos de desconexión. La red opera como un enjambre descentralizado, eliminando puntos únicos de falla.",
    icon: Network,
    color: "hsl(var(--rdm-green))",
  },
  {
    id: "MDD_TAMV",
    name: "MDD / TAMV Credits™",
    subtitle: "Economía Creativa",
    stack: "Web3 Identity + Quadratic Funding Logic",
    desc: "Sistema de financiamiento y valoración que prioriza el impacto comunitario y la producción artesanal local, blindando la economía del territorio frente a la volatilidad externa.",
    icon: Coins,
    color: "hsl(24 72% 50%)",
  },
  {
    id: "KAOS",
    name: "KAOS / HyperRender™",
    subtitle: "Sensorialidad y XR",
    stack: "Three.js + WebNN + Haptic Feedback API",
    desc: "Capa de manifestación visual y táctil. Proyecta a Isabella IA™ en entornos de realidad extendida con alta fidelidad (\"Crystal Glow\"), permitiendo una interacción inmersiva con el patrimonio.",
    icon: Palette,
    color: "hsl(var(--rdm-purple))",
  },
  {
    id: "CHRONOS",
    name: "Chronos Planning™",
    subtitle: "Gestión de Tiempo y Guía",
    stack: "Algoritmos Genéticos + Mapbox GL",
    desc: "Optimización multiobjetivo de rutas y experiencias. Analiza telemetría en tiempo real para coordinar flujos turísticos y operativos de manera eficiente.",
    icon: Clock,
    color: "hsl(212 36% 45%)",
  },
];

const Arquitectura = () => (
  <WikiPage
    title="Arquitectura Heptafederada"
        subtitle="Núcleo de Inteligencia Territorial — Soberanía Digital de Clase Mundial"
      >
        {/* Hero Banner */}
        <div className="relative h-48 w-full overflow-hidden">
          <img src="/images/church-asuncion.jpg" alt="Iglesia de la Asunción en Real del Monte" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        <Section title="Visión general">
      <p className="text-muted-foreground leading-relaxed mb-4">
        El <strong className="text-foreground">RDM Smart City OS</strong> se fundamenta en siete núcleos autónomos
        que conforman la <strong className="text-foreground">Inteligencia Heptafederada</strong>. Cada federación
        opera con independencia pero comparte identidad, estándares y protocolos de gobernanza con el resto del
        ecosistema, bajo una estética "Sovereign-Crystal" (Platinum-Silver y Obsidian Mist).
      </p>
      <p className="text-muted-foreground leading-relaxed">
        A través de <strong className="text-foreground">21,600 horas de investigación independiente</strong>,
        la arquitectura integra Criptografía Post-Cuántica (PQC) bajo estándares NIST, Inteligencia Artificial
        Explicable (XAI) y Trazabilidad Distribuida — demostrando que la innovación de clase mundial puede
        emerger desde la periferia geográfica y académica.
      </p>
    </Section>

    <Section title="Las 7 Federaciones">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {FEDERACIONES.map((fed, i) => (
          <motion.div
            key={fed.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="rounded-xl border border-border/60 bg-card/80 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${fed.color}20` }}
              >
                <fed.icon className="w-5 h-5" style={{ color: fed.color }} />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{fed.name}</h3>
                <p className="text-xs text-muted-foreground">{fed.subtitle}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">{fed.desc}</p>
            <p className="text-[10px] font-mono text-muted-foreground/70 bg-muted/30 px-2 py-1 rounded">
              Stack: {fed.stack}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>

    <Section title="Isabella IA™ — Núcleo Cognitivo Nómada">
      <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-muted/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[hsl(var(--rdm-amber)/0.15)] flex items-center justify-center">
            <Zap className="w-6 h-6 text-[hsl(var(--rdm-amber))]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Soberano Digital Autónomo</h3>
            <p className="text-xs text-muted-foreground">No es un chatbot — es un sistema de interpretación territorial</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Isabella IA™ nace de una investigación de 21,600 horas dedicada a humanizar la inteligencia digital.
          Su propósito es interpretar, coordinar y justificar decisiones dentro de un territorio, actuando como
          un "amigo guerrero" que protege y preserva la identidad cultural. Se alinea con las tendencias más
          avanzadas de sistemas multi-agente y computación contextual.
        </p>
      </div>
    </Section>

    <Section title="Validación Científica">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "Criptografía Post-Cuántica", desc: "Alineación con FIPS 203 (ML-KEM) y FIPS 204 (ML-DSA) del NIST (2024)", icon: Lock },
          { title: "IA Explicable (XAI)", desc: "Valores de Shapley para interpretación de modelos (Lundberg & Lee, 2017)", icon: Brain },
          { title: "Sistemas Distribuidos", desc: "Teorema CAP y protocolos de consenso para redes P2P resilientes", icon: Network },
          { title: "Antifragilidad", desc: "Marco conceptual de Nassim Taleb — el sistema mejora ante la presión", icon: Zap },
        ].map((item) => (
          <InfoCard key={item.title} icon={item.icon} title={item.title} description={item.desc} variant="gold" />
        ))}
      </div>
    </Section>

    <Section title="Capas del Modelo Civilizacional">
      <div className="space-y-3">
        {[
          { layer: "Capa Física", desc: "Calles, minas, plazas, miradores y negocios reales del pueblo." },
          { layer: "Capa de Datos", desc: "Registros digitales de lugares, comercios, eventos, reseñas y flujos de visita." },
          { layer: "Capa Cognitiva", desc: "Narrativas y rutas temáticas, contenidos de IA territorial (recomendaciones)." },
          { layer: "Capa Económica", desc: "Derrama turística, licencias locales, integración de pagos y tokens soberanos." },
        ].map((item, i) => (
          <motion.div
            key={item.layer}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-4 rounded-lg border border-border/40 bg-card/60 p-4"
          >
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--rdm-amber)/0.15)] flex items-center justify-center shrink-0 mt-0.5">
              <Layers className="w-4 h-4 text-[hsl(var(--rdm-amber))]" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground">{item.layer}</h4>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>

    <Section title="Stack Tecnológico">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {["React 18", "TypeScript", "Three.js", "Supabase", "Leaflet", "Vite", "Tailwind CSS", "Framer Motion", "LangGraph", "SHAP", "IPFS", "zk-SNARKs"].map((tech) => (
          <div key={tech} className="text-center py-3 px-2 rounded-lg border border-border/50 bg-muted/20 text-sm text-foreground font-medium">
            {tech}
          </div>
        ))}
      </div>
    </Section>
  </WikiPage>
);

export default Arquitectura;
