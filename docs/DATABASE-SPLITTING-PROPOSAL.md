# DATABASE SPLITTING — Propuesta Open Science Free Services
**Fecha:** 2026-07-01
**Objetivo:** Dividir la base de datos en servicios especializados gratuitos, seguros, sin cambios masivos

---

## Resumen Ejecutivo

**Costo total actual:** $0/mo (Supabase Free Tier, 500MB DB)
**Costo propuesto:** $0/mo (5 servicios, cada uno en free tier)
**Ahorro de storage en Supabase:** ~400MB (de 500MB a <100MB)
**Beneficio:** Reducir riesgo de vendor lock-in, mejorar rendimiento por workload, escalar independientemente

---

## Servicios Seleccionados

| Servicio | Free Tier | Uso Propuesto | Migration Effort |
|----------|-----------|---------------|------------------|
| **Supabase** | 500MB DB, 1GB storage, 50K MAU | Core user data + auth + RLS | — (actual) |
| **Neon Postgres** | 0.5GB, 100 CU-hr/mo, 100 proyectos | Commerce data (subscriptions, payments) | Bajo (Postgres → Postgres) |
| **Turso/libSQL** | 9GB, 500M reads/mo, 10M writes/mo | Content (forum, wiki, knowledge cells) + AI/ML logs | Medio (Postgres → SQLite) |
| **Cloudflare D1** | 5GB, 5M reads/day, 100K writes/day | Analytics/Telemetry (metrics, logs, events) | Medio (Postgres → SQLite) |
| **Upstash Redis** | 256MB, 500K cmds/mo | Gamification (points, leaderboards, counters) | Bajo (Redis protocol) |

---

## Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────┐
│                    Supabase (Primary)                    │
│         Core User Data + Auth + RLS + Realtime          │
│                    ~80MB (reducido)                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  Neon    │  │  Turso   │  │Cloudflare│  │Upstash │ │
│  │ Postgres │  │  libSQL  │  │    D1    │  │ Redis  │ │
│  │          │  │          │  │          │  │        │ │
│  │Commerce  │  │ Content  │  │Analytics │  │Gamifi- │ │
│  │  Data    │  │ + AI/ML  │  │Telemetry │  │cation  │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Detalle por Servicio

### 1. Supabase → Core User Data (MANTENER)

**Qué se queda:**
- `profiles` — Datos de usuario
- `user_roles` — Roles del sistema
- `badges` / `user_badges` — Logros
- `point_transactions` — Transacciones (referencia, no ledger completo)
- `activity_log` — Actividad reciente
- `admin_email_whitelist` — Control de acceso admin
- `songs` — Catálogo de música (referencia)

**Por qué:**
- Auth integrado (JWT, OAuth, magic links)
- RLS enforced a nivel de base de datos
- Realtime subscriptions para UI reactiva
- PostgREST API automática

**Storage estimado:** ~80MB (de 500MB disponibles)

---

### 2. Neon Postgres → Commerce Data

**Qué se mueve:**
- `subscriptions` — Suscripciones Stripe
- `invoices` — Facturas
- `payments` — Pagos procesados
- `businesses` — Negocios registrados
- `stripe_events` — Webhook events procesados

**Por qué Neon:**
- **Postgres → Postgres:** `pg_dump` + restore, cero cambios en queries
- **Branching:** Crear branch para testear cambios de schema sin afectar producción
- **SOC 2 compliance:** Cumplimiento para datos de pago
- **Scale-to-zero:** No gasta cuando no hay tráfico

**Migration steps:**
```bash
# 1. Crear proyecto en neon.tech
# 2. Dump de tablas commerce desde Supabase
pg_dump -t subscriptions -t invoices -t payments -t businesses -t stripe_events \
  $SUPABASE_DB_URL > commerce_dump.sql

# 3. Restore en Neon
psql $NEON_DB_URL < commerce_dump.sql

# 4. Actualizar queries en supabase/functions/stripe-webhook/*
# 5. Actualizar queries en supabase/functions/create-*-checkout/*
```

**Costo:** $0 (free tier, <0.5GB)

---

### 3. Turso/libSQL → Content + AI/ML

**Qué se mueve:**
- `forum_posts` — Posts del foro
- `forum_comments` — Comentarios
- `user_contributions` — Contribuciones territoriales
- `contribution_verifications` — Verificaciones
- `isabella_territorial_insights` — Insights de Isabella
- `ai_prompts_log` — Logs de prompts IA
- `ontology_federations` / `ontology_themes` / `isabella_ontology` — Ontología
- `pipeline_results` — Resultados del pipeline Isabella

**Por qué Turso:**
- **Embedded replicas:** Reads sub-milisegundo en el edge
- **FTS5:** Full-text search nativo para forum/wiki
- **Vector search:** Búsqueda semántica para ontología (sin Pinecone/Qdrant)
- **Database-per-tenant:** Si en el futuro se necesita aislamiento
- **500M reads/mo free:** Suficiente para contenido pesado

**Migration steps:**
```bash
# 1. Crear base en turso.tech
turso db create rdm-content

# 2. Dump desde Supabase (formato SQL)
pg_dump -t forum_posts -t forum_comments -t user_contributions \
  -t ai_prompts_log -t isabella_ontology \
  $SUPABASE_DB_URL > content_dump.sql

# 3. Convertir PostgreSQL → SQLite (usando pgloader o script manual)
# 4. Importar a Turso
turso db shell rdm-content < content_converted.sql

# 5. Crear FTS indexes
turso db shell rdm-content \
  "CREATE VIRTUAL TABLE forum_posts_fts USING fts5(title, body, content=forum_posts, content_rowid=id);"

# 6. Actualizar queries en src/isabella/ontology/*
# 7. Actualizar queries en src/app/api/isabella/*
```

**Costo:** $0 (free tier, 9GB + 500M reads)

---

### 4. Cloudflare D1 → Analytics/Telemetry

**Qué se mueve:**
- `telemetry_logs` — Logs de telemetría del nodo
- `metrics_aggregates` — KPIs agregados
- `system_alerts` — Alertas del sistema
- `federation_health_history` — Historial de salud de federaciones
- `audit_log` — Log de auditoría
- `territorial_snapshots` — Snapshots territoriales
- `user_reputation_log` — Log de reputación

**Por qué D1:**
- **5M reads/day free:** Suficiente para dashboards
- **Time Travel:** Point-in-time recovery de 7 días
- **Edge-native:** Workers para agregación en el edge
- **No egress fees:** Costos predecibles
- **Optimizado para append-only:** Telemetría y logs son write-heavy

**Migration steps:**
```bash
# 1. Crear base en D1
wrangler d1 create rdm-analytics

# 2. Crear schema en D1 (SQLite)
wrangler d1 execute rdm-analytics --file=schema-analytics.sql

# 3. Migrar datos existentes (script de sync)
# 4. Configurar Worker para ingestión
# 5. Actualizar api/telemetry.js para escribir a D1
# 6. Actualizar supabase/functions/metrics-aggregates/ para leer de D1
```

**Costo:** $0 (free tier, 5M reads/day)

---

### 5. Upstash Redis → Gamification

**Qué se mueve:**
- Contadores de puntos por usuario
- Leaderboards (sorted sets)
- Cooldowns de mining
- Sesiones de juego activas
- Cache de resultados de RNG

**Por qué Upstash:**
- **INCR/EXPIRE:** Contadores atómicos sin race conditions
- **ZADD/ZRANK:** Leaderboards en O(log N)
- **HTTP API:** Funciona desde Supabase Edge Functions
- **PAYG:** Solo pagas por lo que uses

**Migration steps:**
```bash
# 1. Crear base en upstash.com
# 2. Obtener URL + token
# 3. Modificar supabase/functions/award-points/ para usar Redis:
#    - INCR rdm:points:{userId} para agregar puntos
#    - ZADD rdm:leaderboard {points} {userId} para leaderboard
# 4. Modificar supabase/functions/rdm-mine/ para cooldowns:
#    - SET rdm:cooldown:{userId} 3600 EX para cooldown de 1h
# 5. Modificar supabase/functions/rdm-redeem/ para balance:
#    - GET rdm:points:{userId} para verificar balance
```

**Costo:** $0 (free tier, 256MB, 500K cmds/mo)

---

## Orden de Migración

| Prioridad | Servicio | Esfuerzo | Beneficio | Riesgo |
|-----------|----------|----------|-----------|--------|
| **P0** | Upstash Redis (Gamification) | Bajo | Elimina race conditions en puntos | Bajo |
| **P1** | Cloudflare D1 (Analytics) | Medio | Reduce storage Supabase ~150MB | Bajo |
| **P2** | Turso (Content + AI/ML) | Medio | Reduce storage Supabase ~200MB, FTS nativo | Medio |
| **P3** | Neon (Commerce) | Bajo | ACID para pagos, branching para dev | Bajo |

---

## Seguridad

### Autenticación Centralizada
- **Supabase sigue siendo el auth provider** para todos los servicios
- Cada servicio recibe el JWT del usuario y lo valida
- Neon, Turso, D1 no tienen su propio auth
- Upstash se accesa solo server-side (no expone credenciales al frontend)

### Encriptación
- **Supabase:** Encryption at rest + TLS en tránsito
- **Neon:** Encryption at rest + TLS
- **Turso:** Encryption at rest + TLS + embedded replicas cifradas
- **D1:** Encryption at rest + TLS
- **Upstash:** TLS + auth tokens

### RLS equivalentes
- **Supabase:** RLS nativo (políticas por usuario)
- **Neon:** Application-level auth (verificar JWT en cada query)
- **Turso:** Application-level auth + database-per-tenant opcional
- **D1:** Worker-level auth (verificar JWT antes de cada query)
- **Upstash:** Server-side only (nunca expone al cliente)

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Vendor lock-in a 5 servicios | Media | Bajo | Todos son open source o tienen API estándar |
| Latencia adicional entre servicios | Baja | Medio | Cache en Upstash para hot data |
| Complejidad de operaciones | Media | Medio | Scripts de migración documentados |
| Consistencia eventual | Media | Bajo | Transacciones críticas en Supabase/Neon |
| Costos inesperados | Baja | Bajo | Monitoreo de usage en cada dashboard |

---

## Métricas de Éxito

| Métrica | Actual | Objetivo |
|---------|--------|----------|
| Supabase DB usage | ~500MB (límite) | <100MB |
| Latencia de reads de contenido | 50-200ms | <5ms (Turso edge) |
| Latencia de gamification | 50-200ms | <1ms (Redis) |
| Costo mensual | $0 | $0 |
| Tiempo de migración por servicio | — | <2 horas |

---

## Conclusión

Esta división permite:
1. **Mantener $0/mo** usando free tiers de 5 servicios
2. **Reducir riesgo** de depender de un solo proveedor
3. **Mejorar rendimiento** con bases especializadas
4. **Escalar independientemente** cada workload
5. **Mantener auth centralizada** en Supabase

**El primer paso (Upstash Redis para gamification) se puede implementar en <1 hora y elimina las race conditions en rdm-redeem.**
