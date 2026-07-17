import { WikiPage } from "@/components/WikiPage";
import { Section, InfoCard } from "@/components/WikiElements";
import { Crown, MapPin, Code, Eye, Flame, Palette, BookOpen, Target, Shield, Globe, Cpu, History, LineChart, Users } from "lucide-react";

const BiografiaCEO = () => (
  <WikiPage
    title="Edwin Oswaldo Castillo Trejo"
      subtitle="Anubis Villaseñor — Fundador y CEO del TAMV Online Network 4D™ / TAMV MD‑X4"
    >
      {/* Hero Banner */}
      <div className="relative h-48 w-full overflow-hidden">
        <img src="/images/ceo-tamv.jpg" alt="Edwin Oswaldo Castillo Trejo, fundador de TAMV" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>
      <div className="space-y-8">
      {/* I. Identidad y Origen */}
      <Section title="I. Identidad, origen y construcción desde la periferia">
        <div className="flex items-start gap-4">
          <MapPin className="h-5 w-5 text-primary mt-1 shrink-0" />
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Nacido y formado en <strong className="text-primary">Mineral del Monte (Real del Monte), Hidalgo, México</strong>, 
              un territorio minero y artesanal, históricamente periférico respecto a los grandes polos tecnológicos globales.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Este origen se convierte en <strong>eje estratégico de su visión</strong>: no intenta "migrar" hacia el centro, 
              sino <span className="text-primary font-medium">reconfigurar el centro desde la periferia</span>, demostrando 
              que una arquitectura digital civilizatoria puede emerger desde un pueblo de montaña con recursos limitados 
              pero alta densidad cultural.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Su formación es mayormente <strong>autodidacta</strong>, complementada con trayectos de educación no convencional 
              (Udemy Alumni y formación continua en línea), orientada hacia: arquitectura de sistemas, diseño modular, 
              infraestructuras distribuidas, gobernanza tecnológica e integración de IA en entornos soberanos.
            </p>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-4">
              <p className="text-sm text-muted-foreground italic">
                "No acumula credenciales de universidades de élite ni trayectoria en big tech; la legitimidad de Edwin 
                se asienta en la <strong>consistencia técnica y ética de sus artefactos</strong>, en la amplitud de su 
                sistema TAMV y en su capacidad para sostenerlo de manera independiente durante años."
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* II. Génesis del Proyecto */}
      <Section title="II. Génesis del proyecto TAMV: del diagnóstico estructural a la arquitectura">
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Durante la década de 2010, Edwin identifica lo que denomina un <strong>problema estructural del ecosistema digital contemporáneo</strong>: 
            una fragmentación profunda entre identidad, economía, educación e infraestructura.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                icon: Users,
                title: "Identidad Capturada",
                desc: "La identidad digital se encuentra capturada y condicionada por plataformas que actúan como intermediarios hegemónicos.",
              },
              {
                icon: LineChart,
                title: "Economía Extractiva",
                desc: "La economía del usuario depende de infraestructuras centralizadas, diseñadas para maximizar extracción, no resiliencia ni equidad.",
              },
              {
                icon: Cpu,
                title: "Asimetría Cognitiva",
                desc: "La IA se concentra progresivamente en pocas manos, generando asimetría entre individuos y corporaciones.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-border/50 bg-card/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed mt-4">
            A partir de este análisis, comienza a formular un <strong>marco alternativo</strong> que no nace como "app" 
            ni "startup" sino como <span className="text-primary font-medium">arquitectura civilizatoria</span>. 
            Ese marco evoluciona desde modelos conceptuales de soberanía digital (2015–2018) hacia lo que posteriormente 
            consolidará como <strong>TAMV Online Network 4D™</strong>, y más tarde como <strong>TAMV MD‑X4</strong>, 
            el metaverso civilizatorio mexicano de nueva generación.
          </p>
        </div>
      </Section>

      {/* III. Fundador */}
      <Section title="III. Fundador de TAMV Online Network 4D™ / TAMV MD‑X4">
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Edwin concibe TAMV no como una plataforma monolítica, sino como:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                icon: Globe,
                title: "Infraestructura Digital Federada",
                desc: "Pensada para nodos autónomos interconectados.",
              },
              {
                icon: Code,
                title: "Ecosistema Modular",
                desc: "Dominios (identidad, educación, economía, metaverso, seguridad, IA) se acoplan sin romper coherencia.",
              },
              {
                icon: Shield,
                title: "Identidad Soberana Integrada",
                desc: "Protege al individuo y otorga control verificable sobre su memoria e historia digital.",
              },
              {
                icon: Flame,
                title: "Modelo Económico Antifrágil",
                desc: "Diseñado para que las tensiones del entorno lo fortalezcan en lugar de destruirlo.",
              },
              {
                icon: Eye,
                title: "Inteligencia Asistencial Auditada",
                desc: "Isabella Villaseñor IA™: IA propia, explicable, orientada a protección y guía.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-border/50 bg-card/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 mt-4">
            <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              La Cuarta Dimensión (4D)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { dim: "Identidad", desc: "Quién es y cómo se representa" },
                { dim: "Infraestructura", desc: "Dónde vive técnica su identidad" },
                { dim: "Inteligencia", desc: "Cómo se procesa y asiste" },
                { dim: "Economía", desc: "Cómo se valoran los aportes" },
              ].map((d) => (
                <div key={d.dim} className="text-center p-2 rounded bg-card/50">
                  <span className="text-primary font-semibold text-sm">{d.dim}</span>
                  <p className="text-xs text-muted-foreground mt-1">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* IV. Dimensión Artesanal */}
      <Section title="IV. Dimensión artesanal: Artesanías El Rosario">
        <div className="flex items-start gap-4">
          <Palette className="h-5 w-5 text-primary mt-1 shrink-0" />
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm leading-relaxed">
              En paralelo a su trabajo digital, Edwin sostiene una línea artesanal bajo la marca 
              <strong> Artesanías El Rosario</strong>, centrada en esculturas de bonsái en alambre y otras piezas manuales.
            </p>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground text-sm">Funciones estructurales:</h4>
              {[
                "Financiamiento parcial independiente del proyecto TAMV, mitigando dependencia de capital externo.",
                "Símbolo de resiliencia estructural: el alambre, maleable pero resistente, como metáfora de los sistemas que construye.",
                "Representación tangible del principio antifrágil: imperfección y presión se transforman en forma artística.",
              ].map((point, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                  {point}
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-border/50 bg-card/50 p-4 mt-3">
              <p className="text-sm text-muted-foreground italic">
                "La artesanía no es un adorno biográfico, sino una <strong>coherencia práctica</strong>: 
                construir infraestructuras digitales críticas mientras trabaja con materiales físicos, 
                recordando que detrás de cada bit hay cuerpos, manos e historias."
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* V. Estilo de Liderazgo */}
      <Section title="V. Estilo de liderazgo y filosofía de gestión">
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            El liderazgo de Edwin combina rigor técnico, narrativa simbólica estructurada, 
            enfoque sistémico de largo plazo y rechazo a la improvisación estratégica.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Code, text: "Modularidad antes que centralización" },
              { icon: BookOpen, text: "Documentación antes que marketing" },
              { icon: Shield, text: "Gobernanza antes que expansión" },
              { icon: Flame, text: "Antifragilidad antes que crecimiento rápido" },
            ].map((principle) => (
              <div key={principle.text} className="rounded-lg border border-border/50 bg-card/50 p-3 text-center">
                <principle.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">{principle.text}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm text-muted-foreground">
              No opera bajo la lógica clásica de "startup acelerada" ni persigue rondas de inversión como primer objetivo; 
              su lógica es la de <strong>infraestructura civilizatoria de décadas</strong>, que debe sobrevivir a ciclos 
              económicos, modas tecnológicas y cambios políticos.
            </p>
          </div>
        </div>
      </Section>

      {/* VI. Misión de Alto Impacto */}
      <Section title="VI. Misión de alto impacto">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <InfoCard
              icon={Globe}
              title="Civilizacional"
              description="Construir arquitectura digital soberana que devuelva capacidad decisional al individuo sin aislarlo del sistema global."
              variant="cyan"
            />
            <InfoCard
              icon={History}
              title="Histórica"
              description="Demostrar que infraestructura tecnológica global puede emerger de un individuo en Hidalgo con visión, rigor y persistencia."
              variant="gold"
            />
            <InfoCard
              icon={Target}
              title="Operativa"
              description="Consolidar TAMV MD‑X4 como sistema federado, modular, desplegable y auditable, replicable por comunidades e instituciones."
              variant="cyan"
            />
          </div>

          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">Obra: "La Nueva Era Digital TAMV Online Network"</h4>
                <p className="text-xs text-muted-foreground">
                  Instructivo narrativo del "Éxodo" desde una internet caótica hacia un espacio virtual 
                  centrado en humanidad, seguridad y libertad, visto a través de la visión de Anubis Villaseñor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* VII. Mapa de Hitos */}
      <Section title="VII. Mapa fechado de hitos biográficos">
        <div className="space-y-3">
          {[
            { year: "Década 2000", event: "Formación autodidacta intensiva", impact: "Base técnica y conceptual independiente; sensibilidad socio-cultural fuera de academias clásicas." },
            { year: "2015–2018", event: "Primeros modelos de soberanía digital", impact: "Germen de la arquitectura TAMV como respuesta a captura de identidad." },
            { year: "2019", event: "Identificación del problema estructural", impact: "Punto de inflexión: necesidad de infraestructura civilizatoria, no solo apps." },
            { year: "2020", event: "Diseño conceptual inicial de TAMV", impact: "Arquitectura embrionaria de infraestructura federada." },
            { year: "2021", event: "Prototipos v0.x, pruebas y descartes", impact: "Aprendizaje antifrágil; consolidación de criterios de diseño." },
            { year: "2022", event: "Consolidación del nombre TAMV", impact: "Identidad estructural del movimiento; posicionamiento como ecosistema mexicano pionero." },
            { year: "2023", event: "Integración modular identidad+economía+educación", impact: "Primer modelo funcional parcial de ecosistema civilizatorio." },
            { year: "2024", event: "Protocolos éticos de IA (Isabella IA)", impact: "Capa de inteligencia integrada, auditada y alineada con soberanía." },
            { year: "2025", event: "Arquitectura TAMV MD‑X4", impact: "Arquitectura madura para despliegue federado y Web 4.0/5.0." },
            { year: "2026", event: "Consolidación y expansión estratégica", impact: "Documentación avanzada y búsqueda de alianzas para validación pública." },
          ].map((hito, idx) => (
            <div key={idx} className="flex gap-4 p-3 rounded-lg border border-border/50 bg-card/30">
              <span className="text-primary font-bold text-sm shrink-0 w-24">{hito.year}</span>
              <div className="flex-1">
                <h5 className="font-semibold text-foreground text-sm">{hito.event}</h5>
                <p className="text-xs text-muted-foreground mt-1">{hito.impact}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* VIII. Análisis Quirúrgico */}
      <Section title="VIII. Análisis quirúrgico de trayectoria">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <h4 className="font-semibold text-primary text-sm mb-2 flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Fortaleza Principal
            </h4>
            <p className="text-xs text-muted-foreground">
              Consistencia prolongada sin respaldo institucional, sosteniendo por años un proyecto de altísima 
              complejidad técnica con más de 21,600 horas de trabajo individual documentadas.
            </p>
          </div>

          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <h4 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              Riesgo Histórico
            </h4>
            <p className="text-xs text-muted-foreground">
              Concentración excesiva del proyecto en la figura del fundador, con alta dependencia de su visión, 
              salud y tiempo.
            </p>
          </div>

          <div className="rounded-lg border border-border/50 bg-card/50 p-4">
            <h4 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Respuesta Arquitectónica
            </h4>
            <p className="text-xs text-muted-foreground">
              Diseño explícito de gobernanza federada, certificación distribuida de nodos y documentación 
              exhaustiva para operación como infraestructura compartida.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-4">
          <h4 className="font-semibold text-primary text-sm mb-2">Vector Diferenciador</h4>
          <p className="text-sm text-muted-foreground">
            Integración simultánea de: <strong>filosofía y crítica del orden digital</strong>, 
            <strong> infraestructura técnica de metaverso</strong>, <strong>economía estructurada para creadores</strong>, 
            y <strong>educación/narrativa cultural</strong> que explican y contextualizan la tecnología.
          </p>
        </div>
      </Section>

      {/* IX. Estado Actual */}
      <Section title="IX. Estado actual (2026) y proyección">
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            En 2026, Edwin Oswaldo Castillo Trejo se encuentra en fase de:
          </p>
          
          <div className="space-y-2">
            {[
              "Consolidación estructural de TAMV MD‑X4, afinando la arquitectura del metaverso civilizatorio.",
              "Documentación formal avanzada, incluyendo wiki técnica, libro, blog y artefactos auditables.",
              "Preparación para validación pública ampliada, buscando foros y alianzas para auditar y escalar el modelo.",
              "Diseño de gobernanza federada operativa, distribuyendo responsabilidades en una red de nodos civilizatorios.",
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                {item}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-primary/20">
            <p className="text-sm text-muted-foreground italic">
              "El proyecto permanece en <strong>evolución activa</strong>, y la figura de Edwin —como fundador, 
              arquitecto computacional, custodio legal de entidades digitales e impulsor de infraestructura universal 
              que fusiona conciencia computacional, trazabilidad jurídica, economía simbólica y evolución afectiva— 
              se posiciona como uno de los experimentos más radicales e íntegros en torno a cómo un solo individuo 
              puede intentar <span className="text-primary">reescribir la arquitectura de la civilización digital 
              desde la periferia latinoamericana</span>."
            </p>
          </div>
        </div>
      </Section>
    </div>
  </WikiPage>
);

export default BiografiaCEO;
