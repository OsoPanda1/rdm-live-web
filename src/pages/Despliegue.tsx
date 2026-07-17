import { WikiPage } from "@/components/WikiPage";
import { Section } from "@/components/WikiElements";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, Cloud, Shield, CheckCircle, Globe, Wrench, Box, ListChecks } from "lucide-react";

const Despliegue = () => (
  <WikiPage
    title="Manual de Despliegue Universal"
        subtitle="Guía paso a paso para replicar el ecosistema TAMV en cualquier infraestructura"
      >
        {/* Hero Banner */}
        <div className="relative h-48 w-full overflow-hidden">
          <img src="/images/sierra-adventure.jpg" alt="Aventura en la sierra de Real del Monte" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        <Tabs defaultValue="prerequisitos" className="w-full">
      <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/30 p-1">
        <TabsTrigger value="prerequisitos" className="text-xs">Prerequisitos</TabsTrigger>
        <TabsTrigger value="local" className="text-xs">Entorno Local</TabsTrigger>
        <TabsTrigger value="cloud" className="text-xs">Cloud</TabsTrigger>
        <TabsTrigger value="onpremise" className="text-xs">On-Premise</TabsTrigger>
        <TabsTrigger value="federada" className="text-xs">Federada</TabsTrigger>
        <TabsTrigger value="checklist" className="text-xs">Checklist</TabsTrigger>
        <TabsTrigger value="certificacion" className="text-xs">Certificación</TabsTrigger>
      </TabsList>

      {/* PREREQUISITOS */}
      <TabsContent value="prerequisitos" className="space-y-6 mt-6">
        <Section title="Prerequisitos técnicos">
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Antes de iniciar cualquier despliegue del ecosistema TAMV, asegúrate de contar con los conocimientos y herramientas mínimas.
          </p>

          <div className="space-y-4">
            <div className="rounded-lg border border-border/50 bg-card/50 p-4">
              <h4 className="font-semibold text-foreground text-sm mb-3">📚 Conocimientos mínimos</h4>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {["Administración básica de Linux (Ubuntu/Rocky)", "Docker y Docker Compose (creación y gestión de contenedores)",
                  "Redes: DNS, firewalls, puertos, VPN básica", "Git: ramas, commits, merge/rebase",
                  "PostgreSQL: conexión, queries básicos, backups", "Conceptos de seguridad: TLS, RBAC, Zero-Trust (recomendado)"].map((k) => (
                  <li key={k} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />{k}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-border/50 bg-card/50 p-4">
              <h4 className="font-semibold text-foreground text-sm mb-3">🛠️ Herramientas requeridas</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { tool: "Git", version: "2.30+" },
                  { tool: "Docker Engine", version: "24+" },
                  { tool: "Docker Compose", version: "v2+" },
                  { tool: "Node.js / Bun", version: "18+ / 1.0+" },
                  { tool: "Terraform (opcional)", version: "1.5+" },
                  { tool: "kubectl (opcional)", version: "1.27+" },
                ].map((t) => (
                  <div key={t.tool} className="rounded-md border border-border/50 bg-muted/20 p-2.5 flex justify-between items-center">
                    <span className="text-xs font-medium text-foreground">{t.tool}</span>
                    <span className="text-xs text-muted-foreground">{t.version}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </TabsContent>

      {/* ENTORNO LOCAL */}
      <TabsContent value="local" className="space-y-6 mt-6">
        <Section title="Entorno local de referencia">
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            El stack Docker Compose de referencia permite levantar todo el ecosistema TAMV en una máquina local para desarrollo y pruebas.
          </p>

          <div className="rounded-lg border border-border/50 bg-card/50 p-4 mb-4">
            <h4 className="font-semibold text-foreground text-sm mb-3">Servicios incluidos</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { svc: "api-core", desc: "API principal del ecosistema" },
                { svc: "db-postgres", desc: "PostgreSQL 16 con extensiones" },
                { svc: "redis", desc: "Cache y colas de mensajes" },
                { svc: "grafana", desc: "Dashboards de monitoreo" },
                { svc: "prometheus", desc: "Recolección de métricas" },
                { svc: "tempo", desc: "Distributed tracing" },
                { svc: "loki", desc: "Agregación de logs" },
                { svc: "jupyter", desc: "Notebooks para análisis" },
                { svc: "isabella-ai", desc: "Servicio de IA contextual" },
              ].map((s) => (
                <div key={s.svc} className="rounded-md border border-border/50 bg-muted/20 p-2.5">
                  <span className="text-xs font-semibold text-primary font-mono">{s.svc}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border/50 bg-muted/20 p-4 font-mono text-xs text-muted-foreground space-y-1">
            <div className="text-primary"># 1. Clonar repositorio</div>
            <div>git clone https://github.com/OsoPanda1/tamv-ecosystem</div>
            <div>cd tamv-ecosystem</div>
            <div className="mt-2 text-primary"># 2. Configurar variables de entorno</div>
            <div>cp .env.example .env.local</div>
            <div>nano .env.local</div>
            <div className="mt-2 text-primary"># 3. Levantar servicios</div>
            <div>docker compose up -d</div>
            <div className="mt-2 text-primary"># 4. Verificar</div>
            <div>docker compose ps</div>
            <div>curl http://localhost:3000/health</div>
            <div className="mt-2 text-primary"># 5. Acceder al dashboard</div>
            <div>open http://localhost:3000  # API</div>
            <div>open http://localhost:3001  # Grafana</div>
          </div>
        </Section>
      </TabsContent>

      {/* CLOUD */}
      <TabsContent value="cloud" className="space-y-6 mt-6">
        <Section title="Despliegue en Cloud">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mb-4">
            <p className="text-sm text-muted-foreground">
              Método recomendado para iniciar rápidamente. Compatible con AWS, GCP, Azure y Lovable Cloud.
            </p>
          </div>

          <div className="rounded-lg border border-border/50 bg-card/50 p-4 mb-4">
            <h4 className="font-semibold text-foreground text-sm mb-3">Escenario de referencia</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Cluster Kubernetes gestionado + PostgreSQL gestionado + CDN para frontend + observabilidad con Grafana Cloud.
              NOA‑TAMV dispone de módulos Terraform para topologías federadas que se publicarán en el repositorio oficial.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { step: "1. Provisionar infraestructura", desc: "Usar Terraform/OpenTofu para levantar VPC, subnets, bases de datos PostgreSQL y servicios de edge computing." },
              { step: "2. Configurar identidad", desc: "Desplegar el módulo ID-NVIDA con proveedor OAuth2/OIDC. Configurar claves de cifrado y certificados TLS 1.3." },
              { step: "3. Base de datos", desc: "Inicializar esquema TAMV con migraciones SQL. Configurar RLS, triggers de auditoría y conexión a EOCT." },
              { step: "4. Edge Functions", desc: "Desplegar funciones serverless para Isabella AI, webhooks y procesamiento de pipelines hexagonales." },
              { step: "5. Frontend", desc: "Build estático con Vite + React. Servir desde CDN con caché agresivo y service workers para PWA." },
              { step: "6. Monitoreo", desc: "Conectar Grafana Cloud o Prometheus self-hosted. Configurar alertas para latencia, CPU y health checks." },
              { step: "7. Validación", desc: "Ejecutar suite de tests E2E. Verificar todos los dominios operativos y obtener certificación federada." },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <Cloud className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-foreground text-sm">{s.step}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Requisitos mínimos Cloud">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: "Compute", value: "2 vCPU, 4GB RAM por nodo" },
              { label: "Storage", value: "50GB SSD (PostgreSQL)" },
              { label: "Network", value: "100 Mbps, IP pública" },
              { label: "SSL", value: "Certificado TLS 1.3 válido" },
              { label: "DNS", value: "Dominio propio configurado" },
              { label: "CDN", value: "Cloudflare o equivalente" },
            ].map((r) => (
              <div key={r.label} className="rounded-lg border border-border/50 bg-card/50 p-3 flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">{r.label}</span>
                <span className="text-xs text-muted-foreground">{r.value}</span>
              </div>
            ))}
          </div>
        </Section>
      </TabsContent>

      {/* ON-PREMISE */}
      <TabsContent value="onpremise" className="space-y-6 mt-6">
        <Section title="Despliegue On-Premise">
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Para organizaciones que requieren control total sobre la infraestructura y los datos.
          </p>
          <div className="rounded-lg border border-border/50 bg-muted/20 p-4 font-mono text-xs text-muted-foreground space-y-1 mb-4">
            <div className="text-primary"># 1. Clonar repositorio</div>
            <div>git clone https://github.com/OsoPanda1/tamv-ecosystem</div>
            <div className="mt-2 text-primary"># 2. Configurar variables de entorno</div>
            <div>cp .env.example .env.local</div>
            <div>nano .env.local  # Editar credenciales</div>
            <div className="mt-2 text-primary"># 3. Levantar con Docker Compose</div>
            <div>docker compose -f docker-compose.prod.yml up -d</div>
            <div className="mt-2 text-primary"># 4. Ejecutar migraciones</div>
            <div>docker exec tamv-db psql -U tamv -f /migrations/init.sql</div>
            <div className="mt-2 text-primary"># 5. Verificar servicios</div>
            <div>curl -s https://localhost/health | jq .</div>
          </div>

          <div className="space-y-3">
            {[
              { title: "Hardware mínimo", desc: "Servidor x86_64 con 8GB RAM, 4 cores, 200GB SSD. GPU opcional para módulos XR." },
              { title: "Sistema operativo", desc: "Ubuntu 22.04 LTS o Rocky Linux 9. Docker Engine 24+ y Docker Compose v2." },
              { title: "Red", desc: "Firewall configurado, puertos 80/443/5432/8443. VPN para administración remota." },
              { title: "Backups", desc: "pg_dump automatizado cada 6 horas. Retención mínima 30 días. Réplica en sitio secundario." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <Server className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </TabsContent>

      {/* FEDERADA */}
      <TabsContent value="federada" className="space-y-6 mt-6">
        <Section title="Despliegue Federado">
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Modelo para crear una red de nodos autónomos interconectados bajo el protocolo CITE-MESH.
          </p>
          <div className="space-y-4">
            {[
              { phase: "Fase 1: Nodo semilla", desc: "Desplegar instancia base con todos los dominios activos. Este nodo será la autoridad raíz de certificación." },
              { phase: "Fase 2: Registro federado", desc: "Configurar el registro central de nodos. Cada nuevo nodo se registra con su clave pública y metadata." },
              { phase: "Fase 3: Sincronización", desc: "Activar protocolo CITE-MESH para sincronización bidireccional de datos entre nodos, con resolución de conflictos." },
              { phase: "Fase 4: Gobernanza", desc: "Establecer el consejo de guardianes entre nodos. Cada nodo elige representantes para la gobernanza federada." },
              { phase: "Fase 5: Certificación", desc: "Ejecutar auditoría automatizada. Verificar compliance con estándares TAMV y emitir certificado de nodo federado." },
            ].map((p) => (
              <div key={p.phase} className="rounded-lg border border-border/50 bg-card/50 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="h-4 w-4 text-primary shrink-0" />
                  <h4 className="font-semibold text-foreground text-sm">{p.phase}</h4>
                </div>
                <p className="text-xs text-muted-foreground pl-6">{p.desc}</p>
              </div>
            ))}
          </div>
        </Section>
      </TabsContent>

      {/* CHECKLIST */}
      <TabsContent value="checklist" className="space-y-6 mt-6">
        <Section title="Checklist de despliegue federado">
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Lista de verificación de 12 puntos para un despliegue federado exitoso. Cada punto debe completarse
            y documentarse antes de solicitar certificación.
          </p>
          <div className="space-y-2">
            {[
              "Registrar nodo en el registro central con clave pública y metadata de contacto",
              "Configurar DNS con dominio propio apuntando al nodo (A/AAAA + CNAME)",
              "Obtener certificado TLS 1.3 válido para el dominio del nodo",
              "Desplegar servicios core: API, PostgreSQL, Redis, Isabella AI",
              "Ejecutar migraciones de base de datos y verificar esquema TAMV",
              "Configurar RLS en todas las tablas con políticas por dominio",
              "Conectar observabilidad: Prometheus + Grafana + alertas configuradas",
              "Ejecutar tests de seguridad: escaneo de vulnerabilidades, verificación TLS, OWASP",
              "Verificar conectividad con nodo semilla y sincronización CITE-MESH",
              "Ejecutar suite completa de tests E2E con cobertura > 80%",
              "Designar guardián de nodo y documentar protocolo de incidentes",
              "Solicitar auditoría de certificación y obtener certificado federado",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </Section>
      </TabsContent>

      {/* CERTIFICACIÓN */}
      <TabsContent value="certificacion" className="space-y-6 mt-6">
        <Section title="Sistema de Certificación Federada">
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Cada réplica del ecosistema TAMV debe pasar un proceso de validación para ser reconocida oficialmente como nodo federado.
          </p>

          <div className="space-y-3 mb-6">
            {[
              { level: "Nodo Observador", desc: "Registro básico. Acceso de lectura a la federación. Para niveles Free/Premium.", criteria: "Registro completo, acepta Códice Maestro." },
              { level: "Nodo Colaborador", desc: "Puede aportar datos y propuestas. Para nivel Devs.", criteria: "Seguridad base, APIs estándar, tests mínimos aprobados." },
              { level: "Nodo Operador", desc: "Opera servicios activos. Para nivel Advance.", criteria: "Uptime > 99.5%, auditoría de seguridad aprobada, guardián designado." },
              { level: "Nodo Guardián", desc: "Máximo nivel. Gobernanza activa. Solo Enterprise.", criteria: "Cumplimiento total ético/contractual, participación activa, SLA verificado." },
            ].map((n) => (
              <div key={n.level} className="rounded-lg border border-border/50 bg-card/50 p-4">
                <h4 className="font-semibold text-foreground text-sm">{n.level}</h4>
                <p className="text-xs text-muted-foreground mt-1">{n.desc}</p>
                <p className="text-xs text-primary mt-1"><strong>Criterios:</strong> {n.criteria}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {[
              { title: "Verificación de integridad", desc: "Hash SHA-256 del codebase debe coincidir con la versión oficial. Módulos custom deben estar documentados.", icon: Shield },
              { title: "Tests de seguridad", desc: "Penetration testing automatizado. Zero vulnerabilidades críticas. RLS activo en todas las tablas.", icon: Shield },
              { title: "Compliance normativo", desc: "Verificación de cumplimiento con GDPR, AI Act y estándares ISO 27001. Auditoría de datos personales.", icon: CheckCircle },
              { title: "Performance baseline", desc: "Latencia < 200ms P95. Uptime > 99.5% en período de prueba de 30 días. Health checks operativos.", icon: CheckCircle },
              { title: "Gobernanza local", desc: "Guardián de nodo designado. Protocolo de incidentes documentado. Canal de comunicación con la federación.", icon: CheckCircle },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <item.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-primary">Proceso:</strong> Solicitud → Auditoría técnica → Auditoría de gobernanza
              → Emisión de certificado con firma criptográfica del Guardián Supremo → Revisión periódica cada 12 meses.
            </p>
          </div>
        </Section>
      </TabsContent>
    </Tabs>
  </WikiPage>
);

export default Despliegue;
