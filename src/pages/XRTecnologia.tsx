import { WikiPage } from "@/components/WikiPage";
import { Section, InfoBox } from "@/components/WikiElements";
import { Monitor, Cpu, Sparkles, Atom, Headphones, BookOpen } from "lucide-react";

const XRTecnologia = () => (
  <WikiPage
    title="Tecnología XR/VR/3D/4D"
      subtitle="Motor de Render Hiperrealista — Espacios Inmersivos con Física Cuántica"
    >
      {/* Hero Banner */}
      <div className="relative h-48 w-full overflow-hidden">
        <img src="/images/waterfall-forest.jpg" alt="Cascada en el bosque de Real del Monte" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>
      <InfoBox type="info" title="Motor de Render 4D">
      El motor TAMV4DRenderer combina Ray Tracing en tiempo real, física cuántica simulada,
      IA generativa de texturas y haptic feedback en un único pipeline de renderizado inmersivo.
    </InfoBox>

    <Section title="Características del Motor" icon={Monitor}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: Sparkles, title: "Ray Tracing Real-Time", desc: "Iluminación fotorrealista con global illumination" },
          { icon: Atom, title: "Física Cuántica", desc: "Comportamientos realistas de partículas simuladas" },
          { icon: Cpu, title: "IA Generativa", desc: "Creación automática de texturas y materiales" },
          { icon: Monitor, title: "Renderizado 4D", desc: "Visualización de dimensiones temporales" },
          { icon: Headphones, title: "Haptic Feedback", desc: "Retroalimentación táctil y audio espacial" },
          { icon: BookOpen, title: "OpenXR Standard", desc: "Compatible con todos los headsets del mercado" },
        ].map((feat) => (
          <div key={feat.title} className="rounded-md border border-border/50 bg-card/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <feat.icon className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground text-sm">{feat.title}</span>
            </div>
            <span className="text-xs text-muted-foreground">{feat.desc}</span>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Pipeline de Renderizado" icon={Cpu}>
      <div className="rounded-lg border border-border/50 bg-card/30 p-4 font-mono text-xs space-y-2">
        <div className="text-muted-foreground">// TAMV4DRenderer Pipeline</div>
        <div>1. <span className="text-primary">quantumEngine</span>.simulate(scene4D)</div>
        <div>2. <span className="text-primary">rayTracer</span>.calculateGlobalIllumination(scene4D)</div>
        <div>3. <span className="text-primary">aiTextureGen</span>.generateRealistic(scene4D.objects)</div>
        <div>4. <span className="text-primary">hapticSystem</span>.calculateFeedback(interactions)</div>
        <div>5. <span className="text-primary">compose4DFrame</span>(quantum, lighting, textures, haptics)</div>
      </div>
    </Section>

    <Section title="Stack de Renderizado">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          "Three.js (WebGL)",
          "Unity 3D Engine",
          "Unreal Engine 5",
          "Custom 4D Renderer",
          "WebXR APIs",
          "OpenXR Standard",
        ].map((tech) => (
          <div key={tech} className="rounded-md border border-border/50 bg-primary/5 px-3 py-2 text-sm text-center text-muted-foreground">
            {tech}
          </div>
        ))}
      </div>
    </Section>

    <Section title="Espacios Virtuales Nativos">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { name: "Home 3D", desc: "Espacios personales con criptografía verificable y personalización total" },
          { name: "Metaverso Federado", desc: "Mundos interconectados con soberanía local por nodo" },
          { name: "Salas de Gobernanza", desc: "Espacios para toma de decisiones democráticas inmersivas" },
          { name: "Laboratorios Cuánticos", desc: "Entornos para experimentación científica colaborativa" },
        ].map((space) => (
          <div key={space.name} className="rounded-lg border border-border/50 bg-muted/20 p-4">
            <div className="font-semibold text-foreground text-sm mb-1">{space.name}</div>
            <div className="text-xs text-muted-foreground">{space.desc}</div>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Métricas de Rendimiento XR">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Target FPS", value: "90" },
          { label: "Latencia máx.", value: "< 20ms" },
          { label: "Usuarios concurrentes", value: "10K+" },
          { label: "Promedio actual", value: "90 FPS" },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border border-border/50 bg-card/30 p-4 text-center">
            <div className="text-xl font-bold text-primary">{m.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
          </div>
        ))}
      </div>
    </Section>
  </WikiPage>
);

export default XRTecnologia;
