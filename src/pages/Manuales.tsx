import { WikiPage } from "@/components/WikiPage";
import { Section } from "@/components/WikiElements";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, Shield, Code, Rocket, HelpCircle, Crown, Building } from "lucide-react";

const Manuales = () => (
  <WikiPage
    title="Manuales de Usuario"
      subtitle="Guías completas para reducir la curva de aprendizaje del ecosistema TAMV"
    >
      {/* Hero Banner */}
      <div className="relative h-48 w-full overflow-hidden">
        <img src="/images/mine-tunnel.jpg" alt="Túnel de la mina histórica" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>
      <Tabs defaultValue="inicio" className="w-full">
      <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/30 p-1">
        <TabsTrigger value="inicio" className="text-xs">Inicio rápido</TabsTrigger>
        <TabsTrigger value="roles" className="text-xs">Por rol</TabsTrigger>
        <TabsTrigger value="membresias" className="text-xs">Por membresía</TabsTrigger>
        <TabsTrigger value="instituciones" className="text-xs">Instituciones</TabsTrigger>
        <TabsTrigger value="seguridad" className="text-xs">Seguridad</TabsTrigger>
        <TabsTrigger value="desarrollo" className="text-xs">Desarrollo</TabsTrigger>
        <TabsTrigger value="redundancia" className="text-xs">Redundancia</TabsTrigger>
        <TabsTrigger value="faq" className="text-xs">FAQ</TabsTrigger>
      </TabsList>

      <TabsContent value="inicio" className="space-y-6 mt-6">
        <Section title="Guía de inicio rápido">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mb-4">
            <p className="text-sm text-muted-foreground">
              Esta guía te llevará de cero a productivo en el ecosistema TAMV en menos de 30 minutos.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { step: "1. Navega la wiki", desc: "Explora la barra lateral para conocer los dominios. Usa ⌘K para buscar cualquier tema." },
              { step: "2. Conoce a Isabella", desc: "Haz clic en el ícono de chat flotante. Isabella AI conoce todo el ecosistema y puede guiarte." },
              { step: "3. Explora dominios", desc: "Cada dominio (ID-NVIDA, UTAMV, Metaverso, Economía, Seguridad) tiene su página con funciones e integraciones." },
              { step: "4. Revisa la arquitectura", desc: "La página de Arquitectura muestra las capas, el stack tecnológico y el concepto CITEMESH." },
              { step: "5. Consulta el dashboard", desc: "El Dashboard de Monitoreo muestra el estado en tiempo real de todos los nodos y dominios." },
              { step: "6. Lee sobre gobernanza", desc: "La sección de Gobernanza detalla roles, procesos de contribución y estándares de compliance." },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <span className="font-bold text-primary text-sm whitespace-nowrap">{s.step.split(".")[0]}.</span>
                <div>
                  <span className="font-medium text-foreground text-sm">{s.step.split(". ")[1]}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </TabsContent>

      <TabsContent value="roles" className="space-y-6 mt-6">
        <Section title="Guía por rol">
          {[
            { role: "Guardián Supremo (GS)", icon: Shield, tasks: ["Supervisar todos los dominios", "Aprobar cambios en el Códice Maestro", "Coordinar con guardianes de dominio", "Gestionar incidentes críticos"] },
            { role: "Colaborador técnico", icon: Code, tasks: ["Contribuir código siguiendo el Códice", "Crear PRs con documentación", "Participar en revisiones de pares", "Mantener tests y documentación"] },
            { role: "Usuario del ecosistema", icon: Users, tasks: ["Navegar la wiki para aprender", "Usar Isabella AI como asistente", "Reportar errores o sugerencias", "Participar en la comunidad"] },
          ].map((r) => (
            <div key={r.role} className="rounded-lg border border-border/50 bg-card/50 p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <r.icon className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-foreground">{r.role}</h4>
              </div>
              <ul className="space-y-1.5">
                {r.tasks.map((t) => (
                  <li key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      </TabsContent>

      <TabsContent value="membresias" className="space-y-6 mt-6">
        <Section title="Guía por nivel de membresía">
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Cada nivel de membresía tiene acceso a diferentes funcionalidades. Aquí te explicamos qué puedes hacer
            según tu plan y las rutas recomendadas para aprovechar al máximo el ecosistema.
          </p>
          {[
            {
              level: "Soy usuario Free", icon: Users,
              canDo: ["Leer toda la wiki y documentación pública", "Usar Isabella AI para preguntas básicas", "Explorar casos de uso públicos", "Participar con voz (sin voto) en Social Core"],
              route: "Empieza por Introducción → Arquitectura → Dominios. Usa Isabella AI para resolver dudas. Si te interesa construir, considera el plan Devs.",
            },
            {
              level: "Soy usuario Premium", icon: BookOpen,
              canDo: ["Todo lo de Free más:", "Acceso a dashboards básicos (solo lectura)", "Contenidos ampliados y reportes introductorios", "Módulos introductorios de UTAMV", "Participación en encuestas del Social Core"],
              route: "Explora el Dashboard de Monitoreo → Casos de Uso → Manuales de Seguridad. Ideal para evaluar antes de un piloto institucional.",
            },
            {
              level: "Soy usuario Devs", icon: Code,
              canDo: ["Todo lo de Premium más:", "Kit de APIs completo con sandbox técnico", "Documentación técnica avanzada y ejemplos NOA‑TAMV", "Acceso a NOA‑TAMV en lectura", "Participación en Social Core y propuestas de PRs técnicos"],
              route: "Kit APIs → Sistemas Avanzados → Despliegue (entorno local). Contribuye con PRs en los dominios que te interesen.",
            },
            {
              level: "Soy Advance (institución mediana)", icon: Building,
              canDo: ["Todo lo de Devs más:", "Monitoreo avanzado con métricas por nodo propio", "Integración parcial con NOA y Social Core operativo", "Configuración y gestión de nodos propios", "Soporte técnico prioritario", "Participación en decisiones de despliegue federado"],
              route: "Despliegue (cloud/federada) → Gobernanza → Certificación. Inicia un piloto y evalúa la viabilidad de escalar a Enterprise.",
            },
            {
              level: "Soy Enterprise (gobierno / gran empresa)", icon: Crown,
              canDo: ["Acceso total al ecosistema:", "Ecosistemas multi-nodo con despliegue llave en mano", "Gobernanza compartida y voto en decisiones críticas", "Integración completa con infraestructura propia", "SLA dedicado y soporte personalizado", "Designación de guardianes de nodo y certificación Guardián"],
              route: "Contacto directo con el equipo core → Auditoría de infraestructura → Despliegue federado → Certificación como Nodo Guardián.",
            },
          ].map((m) => (
            <div key={m.level} className="rounded-lg border border-border/50 bg-card/50 p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <m.icon className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-foreground">{m.level}</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-foreground mb-1.5">¿Qué puedo hacer?</p>
                  <ul className="space-y-1">
                    {m.canDo.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-md bg-primary/5 border border-primary/20 p-3">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-primary">Ruta recomendada:</strong> {m.route}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Section>
      </TabsContent>

      <TabsContent value="instituciones" className="space-y-6 mt-6">
        <Section title="Guía para instituciones (Advance / Enterprise)">
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Guía para universidades, gobiernos y empresas que desean evaluar, pilotear o desplegar TAMV como infraestructura digital soberana.
          </p>

          <div className="space-y-4">
            <div className="rounded-lg border border-border/50 bg-card/50 p-5">
              <h4 className="font-semibold text-foreground mb-3">Fase 1: Evaluación</h4>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />Revisar Introducción, Arquitectura y Casos de Uso</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />Consultar el Dashboard de Monitoreo para ver métricas operativas</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />Usar Isabella AI para resolver dudas técnicas</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />Revisar Estrategia Comercial para modelo de negocio y precios</li>
              </ul>
            </div>

            <div className="rounded-lg border border-border/50 bg-card/50 p-5">
              <h4 className="font-semibold text-foreground mb-3">Fase 2: Piloto (Advance)</h4>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />Contratar plan Advance (~250–500 USD/mes)</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />Configurar nodo piloto con soporte prioritario</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />Integrar módulos seleccionados (ej: UTAMV para educación)</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />Evaluar resultados durante 3–6 meses</li>
              </ul>
            </div>

            <div className="rounded-lg border border-border/50 bg-card/50 p-5">
              <h4 className="font-semibold text-foreground mb-3">Fase 3: Escala (Enterprise)</h4>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />Migrar a contrato Enterprise anual con SLA</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />Desplegar nodos federados dedicados</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />Obtener certificación federada (Nodo Operador → Guardián)</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />Participar en gobernanza compartida del ecosistema</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-primary">¿Qué se espera de una institución?</strong> Compromiso con los principios
              éticos del Códice Maestro, designación de un responsable técnico, participación activa en la comunidad
              del ecosistema y transparencia en el uso de los módulos desplegados.
            </p>
          </div>
        </Section>
      </TabsContent>

      <TabsContent value="seguridad" className="space-y-6 mt-6">
        <Section title="Manual de seguridad">
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            La seguridad en TAMV opera bajo el principio <strong className="text-primary">Zero-Trust cultural</strong>:
            nunca confiar implícitamente, siempre verificar, y tratar la seguridad como un valor civilizatorio.
          </p>
          <div className="space-y-3">
            {[
              { title: "Identidad", desc: "Toda acción requiere identidad verificada vía ID-NVIDA. Sin identidad, sin acceso." },
              { title: "Permisos", desc: "Modelo RBAC+ABAC con permisos granulares por dominio, recurso y acción." },
              { title: "Cifrado", desc: "TLS 1.3 en tránsito, AES-256-GCM en reposo. Claves rotadas cada 90 días." },
              { title: "Auditoría", desc: "Cada operación se registra en el ledger EOCT. Retención mínima de 7 años." },
              { title: "Incidentes", desc: "Protocolo de 4 etapas: detección → contención → erradicación → post-mortem." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </TabsContent>

      <TabsContent value="desarrollo" className="space-y-6 mt-6">
        <Section title="Manual de desarrollo">
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Guía para contribuir al ecosistema TAMV como desarrollador.
          </p>

          <div className="rounded-lg border border-border/50 bg-muted/20 p-4 font-mono text-xs text-muted-foreground space-y-1 mb-4">
            <div className="text-primary"># Clonar y configurar</div>
            <div>git clone https://github.com/OsoPanda1/tamv-ecosystem</div>
            <div>cd tamv-ecosystem</div>
            <div>bun install</div>
            <div>bun run dev</div>
            <div className="mt-2 text-primary"># Crear rama de feature</div>
            <div>git checkout -b feat/mi-feature</div>
            <div className="mt-2 text-primary"># Convención de commits</div>
            <div>feat(dominio): descripción corta</div>
            <div>fix(seguridad): corregir validación</div>
            <div>docs(wiki): agregar manual</div>
          </div>

          <div className="space-y-2">
            {["TypeScript estricto: sin any, interfaces explícitas",
              "Tests obligatorios: cobertura mínima 80% para módulos core",
              "Documentación inline: JSDoc en funciones públicas",
              "Linting: ESLint + Prettier con config del proyecto",
              "Code review: mínimo 1 aprobación de guardián de dominio",
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-primary font-bold">{i + 1}.</span>
                {r}
              </div>
            ))}
          </div>
        </Section>
      </TabsContent>

      <TabsContent value="redundancia" className="space-y-6 mt-6">
        <Section title="Plan de redundancia y alternativas">
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Para evitar dependencia crítica de un solo proveedor, TAMV mantiene un plan de redundancia multi-capa.
          </p>
          <div className="space-y-4">
            {[
              { layer: "Frontend", primary: "Lovable Cloud (Vite + React)", alternatives: ["Vercel", "Netlify", "Cloudflare Pages", "Self-hosted Nginx"] },
              { layer: "Backend/DB", primary: "Lovable Cloud", alternatives: ["Supabase self-hosted", "PostgreSQL + PostgREST", "PlanetScale", "CockroachDB"] },
              { layer: "Edge Functions", primary: "Lovable Cloud Functions", alternatives: ["Cloudflare Workers", "AWS Lambda@Edge", "Deno Deploy", "Fly.io"] },
              { layer: "Monitoreo", primary: "Dashboard interno", alternatives: ["Grafana Cloud", "Datadog", "New Relic", "Prometheus self-hosted"] },
              { layer: "IaC", primary: "Terraform", alternatives: ["Pulumi", "AWS CDK", "Ansible", "OpenTofu"] },
              { layer: "Repositorio", primary: "GitHub (OsoPanda1)", alternatives: ["GitLab", "Gitea self-hosted", "Bitbucket"] },
            ].map((l) => (
              <div key={l.layer} className="rounded-lg border border-border/50 bg-card/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-foreground text-sm">{l.layer}</h4>
                  <span className="text-xs text-primary">{l.primary}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {l.alternatives.map((a) => (
                    <span key={a} className="text-xs px-2 py-1 rounded-full border border-border bg-muted/30 text-muted-foreground">{a}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Estrategia de migración">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Todos los módulos TAMV siguen principios de <strong className="text-primary">portabilidad por diseño</strong>:
              APIs estándar REST/GraphQL, datos exportables en formatos abiertos (JSON, Parquet, CSV),
              infraestructura como código versionada, y zero vendor lock-in en la lógica de negocio.
              El tiempo estimado de migración completa a infraestructura alternativa es de <strong className="text-primary">72 horas</strong>.
            </p>
          </div>
        </Section>
      </TabsContent>

      <TabsContent value="faq" className="space-y-6 mt-6">
        <Section title="Preguntas frecuentes">
          <div className="space-y-4">
            {[
              { q: "¿Qué es TAMV?", a: "Tecnología Avanzada Mexicana Versátil: un ecosistema civilizatorio digital que integra identidad, educación, metaverso, economía y seguridad bajo principios éticos." },
              { q: "¿Quién puede contribuir?", a: "Cualquier persona con identidad verificada puede proponer cambios siguiendo el proceso de contribución descrito en Gobernanza." },
              { q: "¿Es TAMV open source?", a: "El core del ecosistema es open source bajo licencia MIT. Módulos de seguridad críticos tienen licencia propietaria." },
              { q: "¿Qué nivel de membresía necesito?", a: "Free para explorar, Premium para dashboards, Devs para APIs/sandbox, Advance para nodos propios, Enterprise para despliegues federados completos." },
              { q: "¿Cómo me comunico con el equipo?", a: "A través de Isabella AI en esta wiki, GitHub Discussions en github.com/OsoPanda1, o el blog oficial en tamvonlinenetwork.blogspot.com." },
              { q: "¿Qué pasa si falla un nodo?", a: "El sistema de redundancia redistribuye carga automáticamente. El failover es < 200ms para pipelines calientes." },
              { q: "¿Cómo se protegen mis datos?", a: "Cifrado end-to-end, Zero-Trust, ZK-Proofs para verificación sin exposición, y control total del usuario sobre su identidad vía ID-NVIDA." },
            ].map((faq) => (
              <div key={faq.q} className="rounded-lg border border-border/50 bg-card/50 p-4">
                <div className="flex items-start gap-2 mb-2">
                  <HelpCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <h4 className="font-semibold text-foreground text-sm">{faq.q}</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </Section>
      </TabsContent>
    </Tabs>
  </WikiPage>
);

export default Manuales;
