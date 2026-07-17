import { WikiPage } from "@/components/WikiPage";
import { Section, InfoCard } from "@/components/WikiElements";
import { Shield, Users, FileCheck, RefreshCw, BookOpen, Scale, Eye, GitBranch, Globe, Crown, Code, Building, Landmark } from "lucide-react";

const Gobernanza = () => (
  <WikiPage
    title="Gobernanza y Políticas"
      subtitle="Reglas de contribución, roles y principios del ecosistema TAMV"
    >
      {/* Hero Banner */}
      <div className="relative h-48 w-full overflow-hidden">
        <img src="/images/streets-colonial.jpg" alt="Calles coloniales de Real del Monte" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>
      <Section title="Principios de gobernanza">
      <p className="text-muted-foreground leading-relaxed">
        TAMV opera bajo un modelo de gobernanza abierta progresiva, donde la transparencia, el respeto
        y el enfoque civilizatorio son pilares fundamentales. El{" "}
        <strong className="text-primary">Códice Maestro</strong> establece los lineamientos éticos y
        técnicos que rigen toda contribución al ecosistema.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <InfoCard icon={Scale} title="Claridad y respeto" description="Toda comunicación y contribución debe ser clara, respetuosa y con enfoque civilizatorio." variant="gold" />
        <InfoCard icon={Eye} title="Transparencia" description="Decisiones documentadas públicamente. No duplicar contenido: enlazar antes de copiar." variant="cyan" />
        <InfoCard icon={BookOpen} title="Coherencia terminológica" description="Usar siempre los nombres oficiales de módulos, guardianías y protocolos." variant="gold" />
        <InfoCard icon={GitBranch} title="No duplicar" description="Antes de crear contenido nuevo, verificar si ya existe algo similar y enlazarlo." variant="cyan" />
      </div>
    </Section>

    <Section title="Roles del ecosistema">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard icon={Shield} title="Fundador / Guardián Supremo" description="Anubis Villaseñor (Edwin Oswaldo Castillo Trejo). Visión, arquitectura y decisiones finales del ecosistema." variant="gold" />
        <InfoCard icon={Users} title="Colaboradores de Alta Confianza" description="Fase inicial: solo el fundador y colaboradores directos validan y editan contenido crítico." variant="cyan" />
        <InfoCard icon={FileCheck} title="Contribuidores Moderados" description="Fase posterior: contribuciones abiertas moderadas mediante pull requests y sugerencias revisadas." variant="gold" />
        <InfoCard icon={Eye} title="Dueños de Sección" description="Cada página o sección tiene un responsable que garantiza la precisión y vigencia del contenido." variant="cyan" />
      </div>
    </Section>

    <Section title="Membresías y roles de participación">
      <p className="text-muted-foreground leading-relaxed mb-4">
        Cada nivel de membresía del ecosistema TAMV se asocia a un rol de participación en la gobernanza,
        definiendo el alcance de las decisiones que cada miembro puede influir.
      </p>
      <div className="space-y-3">
        {[
          { icon: Users, level: "Free", role: "Observador civilizatorio", permissions: "Acceso de lectura a la wiki y Social Core. Voz en foros públicos, sin voto en gobernanza." },
          { icon: BookOpen, level: "Premium", role: "Usuario avanzado", permissions: "Acceso a dashboards y contenidos ampliados. Voz en Social Core con participación limitada en encuestas." },
          { icon: Code, level: "Devs", role: "Desarrollador TAMV", permissions: "Puede proponer cambios técnicos (PR/MR) en dominios asignados. Participa en revisiones de código y Social Core." },
          { icon: Building, level: "Advance", role: "Operador / Aliado institucional", permissions: "Participa en decisiones de despliegue federado. Puede configurar nodos y proponer políticas de dominio." },
          { icon: Crown, level: "Enterprise", role: "Nodo federado / Entidad civilizatoria asociada", permissions: "Gobernanza compartida con el ecosistema. Voto en decisiones críticas, designación de guardianes de nodo." },
        ].map((m) => (
          <div key={m.level} className="rounded-lg border border-border/50 bg-card/60 p-4">
            <div className="flex items-center gap-2 mb-2">
              <m.icon className="h-4 w-4 text-primary shrink-0" />
              <h4 className="font-semibold text-foreground text-sm">{m.level} — {m.role}</h4>
            </div>
            <p className="text-xs text-muted-foreground pl-6">{m.permissions}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Mapa de decisiones por nivel">
      <div className="rounded-lg border border-border/50 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 border-b border-border/50">
              <th className="text-left px-3 py-2.5 text-foreground font-medium text-xs">Tipo de decisión</th>
              <th className="text-center px-2 py-2.5 text-foreground font-medium text-xs">Free</th>
              <th className="text-center px-2 py-2.5 text-foreground font-medium text-xs">Premium</th>
              <th className="text-center px-2 py-2.5 text-foreground font-medium text-xs">Devs</th>
              <th className="text-center px-2 py-2.5 text-foreground font-medium text-xs">Advance</th>
              <th className="text-center px-2 py-2.5 text-foreground font-medium text-xs">Enterprise</th>
            </tr>
          </thead>
          <tbody className="text-xs text-muted-foreground">
            {[
              { decision: "Voz en Social Core", levels: ["✔️", "✔️", "✔️", "✔️", "✔️"] },
              { decision: "Proponer contenido wiki", levels: ["❌", "✔️", "✔️", "✔️", "✔️"] },
              { decision: "PRs técnicos en dominios", levels: ["❌", "❌", "✔️", "✔️", "✔️"] },
              { decision: "Configurar nodos propios", levels: ["❌", "❌", "❌", "✔️", "✔️"] },
              { decision: "Decisiones de despliegue federado", levels: ["❌", "❌", "❌", "✔️", "✔️"] },
              { decision: "Voto en gobernanza crítica", levels: ["❌", "❌", "❌", "❌", "✔️"] },
              { decision: "Designar guardianes de nodo", levels: ["❌", "❌", "❌", "❌", "✔️"] },
            ].map((row) => (
              <tr key={row.decision} className="border-b border-border/30">
                <td className="px-3 py-2 text-foreground">{row.decision}</td>
                {row.levels.map((v, i) => (
                  <td key={i} className="px-2 py-2 text-center">{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>

    <Section title="Sistema de Certificación Federada TAMV">
      <p className="text-muted-foreground leading-relaxed mb-4">
        Cada réplica del ecosistema TAMV puede alcanzar un nivel de certificación federada que
        valida su cumplimiento técnico, ético y operativo dentro de la red.
      </p>
      <div className="space-y-3">
        {[
          { level: "Nodo Observador", criteria: "Registro básico, cumplimiento mínimo de estándares. Acceso de lectura a la federación. Asociado a niveles Free/Premium.", color: "text-muted-foreground" },
          { level: "Nodo Colaborador", criteria: "Cumplimiento técnico parcial (seguridad base, APIs estándar). Puede aportar datos y propuestas. Asociado a nivel Devs.", color: "text-secondary" },
          { level: "Nodo Operador", criteria: "Cumplimiento técnico completo, uptime > 99.5%, auditoría aprobada. Opera servicios activos. Asociado a nivel Advance.", color: "text-primary" },
          { level: "Nodo Guardián", criteria: "Máximo nivel. Cumplimiento ético y contractual total, guardián de nodo designado, participación activa en gobernanza. Solo Enterprise.", color: "text-primary" },
        ].map((n) => (
          <div key={n.level} className="rounded-lg border border-border/50 bg-card/50 p-4">
            <h4 className={`font-semibold text-sm ${n.color}`}>{n.level}</h4>
            <p className="text-xs text-muted-foreground mt-1">{n.criteria}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-4">
        <p className="text-sm text-muted-foreground">
          <strong className="text-primary">Proceso de certificación:</strong> Solicitud → Auditoría técnica (seguridad, uptime, APIs)
          → Auditoría de gobernanza (ética, documentación, comunidad) → Emisión de certificado con firma criptográfica
          → Revisión periódica cada 12 meses.
        </p>
      </div>
    </Section>

    <Section title="Proceso de contribución">
      <div className="space-y-3">
        {[
          { step: "1", text: "Buscar si ya existe contenido similar antes de crear una página nueva." },
          { step: "2", text: "Usar siempre las plantillas definidas: Artículo General, Módulo, Especificación Técnica o Guía/Tutorial." },
          { step: "3", text: "Proponer cambios grandes mediante issue/ticket con discusión previa." },
          { step: "4", text: "Seguir el estilo de escritura: voz clara, en presente, sin marketing. 1 frase de resumen antes del detalle." },
          { step: "5", text: "Secciones con títulos descriptivos, listas para pasos o elementos, citar fuentes internas." },
          { step: "6", text: "Revisión por el dueño de sección antes de publicar cambios." },
        ].map((s) => (
          <div key={s.step} className="flex gap-3 items-start p-3 rounded-lg bg-muted/30 border border-border/50">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-bold shrink-0">
              {s.step}
            </span>
            <p className="text-muted-foreground text-sm leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Plantillas de edición">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-border/50 bg-card/60">
          <h4 className="font-semibold text-foreground mb-2">📄 Artículo General</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Resumen (1–3 líneas)</li>
            <li>• Definición y contexto en TAMV</li>
            <li>• Componentes clave</li>
            <li>• Casos de uso y riesgos</li>
            <li>• Relación con otros módulos</li>
          </ul>
        </div>
        <div className="p-4 rounded-lg border border-border/50 bg-card/60">
          <h4 className="font-semibold text-foreground mb-2">🧩 Módulo del Ecosistema</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Tipo: Dominio / Guardianía / Servicio</li>
            <li>• Propósito y funciones clave</li>
            <li>• Entradas, salidas e integraciones</li>
            <li>• Estado actual del módulo</li>
          </ul>
        </div>
        <div className="p-4 rounded-lg border border-border/50 bg-card/60">
          <h4 className="font-semibold text-foreground mb-2">⚙️ Especificación Técnica</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Arquitectura y modelos de datos</li>
            <li>• Flujos principales y APIs</li>
            <li>• Seguridad y cumplimiento</li>
            <li>• Testing y métricas</li>
          </ul>
        </div>
        <div className="p-4 rounded-lg border border-border/50 bg-card/60">
          <h4 className="font-semibold text-foreground mb-2">📘 Guía / Tutorial</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Objetivo y requisitos previos</li>
            <li>• Pasos detallados numerados</li>
            <li>• Ejemplos de uso</li>
            <li>• Errores comunes y soluciones</li>
          </ul>
        </div>
      </div>
    </Section>

    <Section title="Revisión y mantenimiento">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard icon={RefreshCw} title="Revisiones periódicas" description="Cada 3–6 meses se revisan las secciones críticas: Arquitectura, Seguridad y APIs." variant="gold" />
        <InfoCard icon={FileCheck} title="Contenido archivado" description="El contenido obsoleto se marca como 'Archivado' o 'Histórico', nunca se borra si tiene valor documental." variant="cyan" />
      </div>
    </Section>

    <Section title="Compliance y estándares">
      <p className="text-muted-foreground leading-relaxed">
        Toda contribución al ecosistema TAMV debe alinearse con los estándares internacionales y nacionales
        adoptados por el proyecto:
      </p>
      <div className="flex flex-wrap gap-2 mt-3">
        {["AI Act (EU)", "GDPR", "ISO 27001", "ISO 42001", "NOM‑151", "Zero‑Trust", "OWASP Top 10"].map((std) => (
          <span key={std} className="px-3 py-1.5 rounded-md border border-border/50 bg-muted/30 text-sm text-foreground">
            {std}
          </span>
        ))}
      </div>
    </Section>

    <Section title="Enlaces oficiales">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <a href="https://github.com/OsoPanda1" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-card/60 hover:border-primary/50 transition-colors">
          <GitBranch className="h-4 w-4 text-primary" />
          <span className="text-sm text-foreground">GitHub — OsoPanda1</span>
        </a>
        <a href="https://tamvonline-oficial.odoo.com" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-card/60 hover:border-primary/50 transition-colors">
          <Globe className="h-4 w-4 text-secondary" />
          <span className="text-sm text-foreground">Sitio Oficial — Odoo</span>
        </a>
        <a href="https://tamvonlinenetwork.blogspot.com" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-card/60 hover:border-primary/50 transition-colors">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-sm text-foreground">Blog Oficial — Blogspot</span>
        </a>
      </div>
    </Section>
  </WikiPage>
);

export default Gobernanza;
