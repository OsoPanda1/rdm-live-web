import { WikiPage } from "@/components/WikiPage";
import { Section } from "@/components/WikiElements";
import { FileText, BookOpen, Layers, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";

const templates = [
  { icon: FileText, title: "Artículo general", desc: "Definición, contexto, componentes, casos de uso y relación con otros módulos." },
  { icon: Layers, title: "Módulo del ecosistema", desc: "Tipo, propósito, funciones clave, entradas/salidas, integraciones y estado actual." },
  { icon: ClipboardList, title: "Especificación técnica", desc: "Arquitectura, modelos de datos, flujos, APIs, seguridad y testing." },
  { icon: BookOpen, title: "Guía / Tutorial", desc: "Objetivo, requisitos, pasos detallados, ejemplos y errores comunes." },
];

const Documentacion = () => (
  <WikiPage
    title="Documentación Técnica"
        subtitle="Plantillas, estructura y políticas de la wiki TAMV"
      >
        {/* Hero Banner */}
        <div className="relative h-48 w-full overflow-hidden">
          <img src="/images/museo-mina.jpg" alt="Museo de la Mina de Real del Monte" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        <Section title="Plantillas de edición">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((t) => (
          <div key={t.title} className="rounded-lg border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <t.icon className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">{t.title}</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Estructura de la wiki">
      <div className="rounded-lg border border-border/50 bg-muted/20 p-4 font-mono text-sm text-muted-foreground space-y-1">
        <div><span className="text-primary">00</span> Introducción</div>
        <div><span className="text-primary">01</span> Filosofía y Códice</div>
        <div><span className="text-primary">02</span> Arquitectura TAMV MD‑X4</div>
        <div><span className="text-primary">03</span> Dominios</div>
        <div className="pl-6">03.01 Nexus · 03.02 UTAMV · 03.03 Metaverso · 03.04 Economía · 03.05 Seguridad</div>
        <div><span className="text-primary">04</span> IA y Agentes</div>
        <div><span className="text-primary">05</span> Documentación Técnica</div>
        <div><span className="text-primary">06</span> Guías de Uso</div>
        <div><span className="text-primary">07</span> Historia y Línea de Tiempo</div>
        <div><span className="text-primary">08</span> Gobernanza y Políticas</div>
        <div><span className="text-primary">09</span> Changelog / Versiones</div>
      </div>
    </Section>

    <Section title="Políticas de contribución">
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li className="flex gap-2"><span className="text-primary">•</span> Claridad, respeto, enfoque civilizatorio.</li>
        <li className="flex gap-2"><span className="text-primary">•</span> No duplicar contenido: enlazar antes de copiar.</li>
        <li className="flex gap-2"><span className="text-primary">•</span> Usar siempre las plantillas definidas.</li>
        <li className="flex gap-2"><span className="text-primary">•</span> Revisiones periódicas cada 3–6 meses.</li>
        <li className="flex gap-2"><span className="text-primary">•</span> Marcar contenido obsoleto, no borrarlo.</li>
      </ul>
    </Section>
  </WikiPage>
);

export default Documentacion;
