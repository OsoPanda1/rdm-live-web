# ARCHITECTURE.md — Reglas de Arquitectura del Sistema

**Última actualización:** 2026-07-01
**Prioridad:** ⭐⭐⭐⭐⭐

---

## Propósito

Este documento existe para resolver **Architectural Drift** — la tendencia natural de los proyectos a desarrollar múltiples centros de verdad, autenticación inconsistente, y rutas duplicadas a medida que crecen.

**Regla de oro:** Cada componente del sistema tiene un único lugar donde vive su lógica. Si aparece en más de un sitio, uno de ellos es obsoleto y debe eliminarse.

---

## Los 5 Entornos Backend (y sus reglas)

Actualmente coexisten **5 entornos ejecutando lógica backend**. Este documento define qué hace cada uno y qué **nunca** debe implementarse en ellos.

### 1. `supabase/functions/` — Edge Functions Supabase

**Responsabilidad:** Lógica que requiere:
- Acceso directo a la base de datos Supabase (con service_role key)
- Integración con servicios Google (Cloud TTS, Gemini)
- Webhooks de terceros (Stripe)
- Procesamiento que necesita la infraestructura de Supabase (Auth, Storage, Realtime)

**Patrón de Auth:** `supabase.auth.getUser()` con JWT del usuario
**Patrón de CORS:** Allowlist explícita (nunca `*`)
**Rate limiting:** DB-backed via `_shared/rate-limit.ts`

**Funciones actuales:**
- `isabella-ai` — Chat IA con Model Router
- `realito-chat` — Chat turístico
- `tts-isabella` — Text-to-Speech con cache
- `isabella-ontology` — Queries de ontología
- `stripe-webhook` — Webhook de pagos
- `create-premium-checkout` — Checkout premium
- `create-commerce-checkout` — Checkout commerce
- `create-music-donation` — Donaciones musicales
- `check-subscription` — Sync suscripción
- `customer-portal` — Portal billing
- `merchant-payment-webhook` — Pagos merchant
- `award-points` — Gamificación
- `rdm-mine` — Simulación minera
- `rdm-redeem` — Canje de puntos
- `rdm-membership-activate` — Activar membresía
- `federation-health` — Health check
- `alerts-engine` — Alertas del sistema
- `metrics-aggregates` — KPIs agregados
- `ingest-event` — Tracking de eventos

**NUNCA implementar aquí:**
- Lógica de UI o rendering
- Servicios de larga duración (>30s timeout)
- Procesamiento de archivos multimedia pesados
- Lógica que requiera estado persistente entre requests

---

### 2. `api/` — Vercel Serverless/Edge Functions

**Responsabilidad:** Lógica que requiere:
- Edge runtime de Vercel (baja latencia, cerca del usuario)
- Streaming de datos (SSE)
- Integración con Vercel AI SDK
- Cron jobs programados
- Endpoints que son consumidos directamente por el frontend

**Patrón de Auth:** Bearer token (CRON_SECRET) o NINGUNO (para endpoints públicos)
**Patrón de CORS:** Configurado por función
**Rate limiting:** Por función individual

**Funciones actuales:**
- `api/ai/chat` — AI Gateway streaming
- `api/model-router` — Routing a modelos open-source
- `api/tts-isabella` — TTS endpoint
- `api/telemetry` — Telemetría del sistema
- `api/health` — Health check
- `api/cron/health-check` — Cron job diario
- `api/knowledge-cells/` — Knowledge cells (index, render-3d, render-4d)

**NUNCA implementar aquí:**
- Acceso directo a Supabase con service_role (usar supabase/functions/)
- Lógica de negocio compleja (mantener en supabase/functions/)
- Webhooks de terceros (usar supabase/functions/)

---

### 3. `server/` — Express.js Backend

**Responsabilidad:** Lógica que requiere:
- Estado persistente entre requests (conexiones WebSocket, caché en memoria)
- Procesamiento pesado (Python workers, ML inference)
- APIs internas entre microservicios
- Autenticación JWT con validación de issuer/audience

**Patrón de Auth:** JWT Bearer via `server/src/middleware/auth.ts`
**Patrón de CORS:** Allowlist config-driven
**Rate limiting:** `express-rate-limit` (in-memory)

**Funciones actuales:**
- Health check (`/healthz`)
- Rutas internas del sistema
- Constitutional guard middleware
- Cultural guardian middleware

**NUNCA implementar aquí:**
- Endpoints consumidos por el frontend (usar api/ o supabase/functions/)
- Webhooks de Stripe (usar supabase/functions/)
- Lógica que depende de Supabase Auth (usar supabase/functions/)

---

### 4. `src/app/api/` — Next.js App Router API Routes

**Responsabilidad:** Lógica que requiere:
- Rendering server-side (SSR/SSG)
- Acceso a datos durante el build
- Endpoints internos del frontend

**Patrón de Auth:** **CRÍTICO: Debe ser JWT Bearer igual que server/**
**Patrón de CORS:** Same-origin (no necesita CORS)
**Rate limiting:** Debe implementarse

**Funciones actuales:**
- `src/app/api/isabella/*` (11 rutas) — Subsistemas de Isabella
- `src/app/api/health` — Health check
- `src/app/api/metrics` — Métricas
- `src/app/api/unified/*` (3 rutas) — APIs unificadas
- `src/app/api/donations/checkout` — Checkout donaciones

**NUNCA implementar aquí:**
- Webhooks de terceros
- Lógica que requiere estado entre requests
- Endpoints consumidos por otros servicios

---

### 5. `serverless/` — Standalone Express Service

**Responsabilidad:** Servicios que necesitan:
- Ejecutarse de forma independiente
- Escalarse por separado
- Monitoreo dedicado

**Funciones actuales:**
- `serverless/autoRemediate.ts` — Auto-remediación de alertas (puerto 8081)

**NUNCA implementar aquí:**
- Lógica que ya existe en otro entorno
- Endpoints consumidos por el frontend

---

## Reglas de Autenticación

### Patrones de Auth (por entorno)

| Entorno | Patrón | Validación |
|---------|--------|------------|
| `supabase/functions/` | `supabase.auth.getUser()` | JWT Supabase, verificado server-side |
| `api/` | Bearer CRON_SECRET (cron) o NINGUNO (público) | Token estático |
| `server/` | JWT Bearer (HS256) | issuer + audience validados |
| `src/app/api/` | JWT Bearer | **PENDIENTE: Implementar** |
| `serverless/` | **PENDIENTE: Implementar** | **PENDIENTE** |

### Reglas de Auth

1. **Todo endpoint que modifique datos DEBE tener autenticación.** No hay excepciones.
2. **Los webhooks de Stripe DEBEN verificar la firma.** Nunca confiar en el body sin verificar.
3. **Los endpoints públicos DEBEN tener rate limiting.** No hay endpoints gratuitos.
4. **El anon key de Supabase NUNCA se usa server-side.** Server-side usa service_role o JWT del usuario.
5. **Los cron jobs DEBEN usar CRON_SECRET.** Nunca exponerlos sin autenticación.

---

## Reglas de CORS

### Patrón de CORS (por entorno)

| Entorno | Patrón | Ejemplo |
|---------|--------|---------|
| `supabase/functions/` | Allowlist explícita | `['https://rdm.digital', 'https://admin.rdm.digital']` |
| `api/` | Por función | Configurar individualmente |
| `server/` | Config-driven allowlist | `CORS_ORIGINS` env var |
| `src/app/api/` | Same-origin | No necesita CORS |

### Reglas de CORS

1. **Nunca usar `Access-Control-Allow-Origin: *` en producción.** Solo en desarrollo.
2. **Los webhooks no necesitan CORS.** Se consumen server-side.
3. **Cada función DEBE declarar sus orígenes permitidos.** No heredar de otros entornos.

---

## Reglas de Rate Limiting

### Implementaciones actuales

| Entorno | Implementación | Almacenamiento |
|---------|----------------|----------------|
| `supabase/functions/` | `_shared/rate-limit.ts` | Supabase DB (Redis-like) |
| `server/` | `express-rate-limit` | Memoria (in-process) |
| `api/` | **NINGUNO** | — |
| `src/app/api/` | **NINGUNO** | — |

### Reglas de Rate Limiting

1. **Todo endpoint público DEBE tener rate limiting.** Sin excepciones.
2. **El rate limiting DEBE ser persistente** (no in-memory) para funcionar con múltiples instancias.
3. **Los límites DEBEN ser configurables** via variables de entorno.
4. **Los errores de rate limiting DEBEN retornar HTTP 429** con `Retry-After` header.

---

## Reglas de Duplicación

### Prohibiciones

1. **NUNCA crear la misma funcionalidad en más de un entorno backend.** Si existe en `supabase/functions/`, no crearla en `api/`.
2. **NUNCA duplicar middleware.** Si ya existe rate limiting en `_shared/rate-limit.ts`, reutilizarlo.
3. **NUNCA crear la misma página en más de un archivo.** Si `Musica.tsx` existe, no crear `Music.tsx`.
4. **NUNCA crear el mismo componente en más de un directorio.** Si `BusinessCard.tsx` existe en `components/`, no crear otro en `components/business/`.

### Resolución de duplicados existentes

| Duplicado | Acción | Prioridad |
|-----------|--------|-----------|
| `tts-isabella` (api/ vs supabase/functions/) | Eliminar `api/tts-isabella.js`, mantener Supabase | CRÍTICO |
| `isabella-ai` (api/ai/chat.js vs supabase/functions/isabella-ai/) | Consolidar en supabase/functions/ | ALTO |
| `health` (5 implementaciones) | Mantener solo `api/health.ts` + `api/cron/health-check.js` | ALTO |
| `Musica.tsx` vs `Music.tsx` | Eliminar `Music.tsx` (dead code) | MEDIO |
| `RegistroComercio.tsx` vs `RegistrarComercio.tsx` | Consolidar en uno solo | ALTO |
| `Membresias.tsx` vs `Membership.tsx` | Consolidar en uno solo | ALTO |
| `Comunidad.tsx` vs `ComunidadPage.tsx` | Consolidar en uno solo | MEDIO |
| `Documentation.tsx` vs `Documentacion.tsx` | Consolidar en uno solo | MEDIO |
| `Mapa.tsx` vs `MapaVivo.tsx` | Consolidar en uno solo | MEDIO |
| `Wiki.tsx` vs `WikiTAMV.tsx` | Consolidar en uno solo | MEDIO |
| `modules/music/music/` | Eliminar subdirectorio duplicado | ALTO |

---

## Reglas de Knowledge Cells

### Estructura actual

```
knowledge-cells/          ← Express microservice independiente
api/knowledge-cells/      ← Vercel serverless functions
api/health.ts             ← Referencia a endpoint inexistente (ia-fx)
```

### Reglas

1. **Cada módulo DEBE tener `manifest.json`** con: `version`, `dependencies`, `checksum`, `owner`, `last_modified`.
2. **Los knowledge cells DEBEN ser versionados semánticamente** (v1.0.0, v1.1.0, etc.).
3. **No pueden existir cambios en knowledge cells sin bump de versión.**
4. **Los componentes que dependan de knowledge cells DEBEN declarar la versión exacta.**

### Implementación pendiente

- [ ] Crear `knowledge-cells/manifest.json`
- [ ] Crear `skills/manifest.json`
- [ ] Crear `reasoning/manifest.json`
- [ ] Agregar checksum a cada cell
- [ ] Agregar dependency graph entre cells

---

## Reglas de Isabella (Sin Dependencias Circulares)

### Arquitectura actual

```
src/isabella/
  ├── core/           ← Identity, oath, consciousness
  ├── emotional/      ← Heart, memory
  ├── knowledge/      ← KnowledgeAbsorptionEngine
  ├── protocols/      ← AwakeningProtocol
  ├── territorial/    ← TerritorialMind
  ├── pipeline/       ← ConsciousnessPipeline (ORQUESTADOR)
  ├── ontology/       ← Ontology queries
  ├── skills/         ← 5 skill engines (self-contained)
  ├── kernel/         ← 5 kernel functions
  ├── quantum/        ← Quantum capabilities
  └── api/            ← Client API facade
```

### Reglas

1. **Toda llamada DEBE pasar por un único Dispatcher.** Nunca entre módulos directamente.
2. **El pipeline es el único orquestador.** Los módulos no pueden importarse entre sí.
3. **Los skills son self-contained.** No importan de otros skills.
4. **El kernel es la única interfaz con federationBus.** Los otros módulos no lo usan directamente.

### Estado actual: ✅ LIMPIO

No se detectaron dependencias circulares. El flujo es unidireccional:
```
api/index.ts → core/*, emotional/*, knowledge/*, protocols/*, territorial/*
pipeline/* → core/*, emotional/*, knowledge/*, protocols/*, territorial/*, ontology/*, federaciones/*
kernel/* → federaciones/*
skills/* → (self-contained)
```

---

## Reglas de Documentación

### Documentos requeridos (obligatorios)

| Documento | Estado | Responsable |
|-----------|--------|-------------|
| `ARCHITECTURE.md` | ✅ EXISTS | Arquitecto |
| `SECURITY_ARCHITECTURE.md` | ❌ MISSING | Seguridad |
| `DEPLOYMENT.md` | ❌ MISSING | DevOps |
| `MODULES.md` | ❌ MISSING | Arquitecto |
| `API CONTRACTS.md` | ❌ MISSING | Backend |
| `DATA FLOW.md` | ❌ MISSING | Arquitecto |
| `CHANGELOG.md` | ❌ MISSING | Todos |

### Reglas de documentación

1. **Todo endpoint DEBE tener contrato API documentado.** Método, parámetros, respuesta, errores.
2. **Todo flujo de datos DEBE tener diagrama.** Desde el request hasta la respuesta.
3. **Todo cambio DEBE actualizar CHANGELOG.** Formato: `[FECHA] - [AUTOR] - [CAMBIO]`
4. **Ningún PR puede mergear sin documentación actualizada.**

---

## Reglas de CI/CD

### Directorios de workflows

| Directorio | Estado | Acción |
|------------|--------|--------|
| `.github/workflows/` | ✅ Correcto | Mantener |
| `.github/.github/workflows/` | ❌ DUPLICADO | Eliminar |

### Reglas

1. **Solo `.github/workflows/` es la fuente de verdad.** El directorio anidado debe eliminarse.
2. **No existen workflows en otros directorios.** Si aparecen, mover a `.github/workflows/`.
3. **Todo workflow DEBE tener nombre descriptivo.** No `ci.yml` genérico.

---

## Reglas de Assets

### Formatos permitidos

| Tipo | Formato requerido | Optimización |
|------|-------------------|--------------|
| Imágenes | WebP o AVIF | <200KB por imagen |
| Videos | H264 MP4, Fast Start | <10MB por video |
| Audio | MP3 128kbps o WebM | <5MB por archivo |
| SVG | Optimizado con SVGO | <50KB |

### Assets que DEBEN ser reemplazados

| Archivo | Problema | Acción |
|---------|----------|--------|
| `hero.mp4` (11 bytes) | Archivo roto/stub | Reemplazar con video real |
| 12 imágenes de 1.6MB cada una | Posibles placeholders idénticos | Verificar y reemplazar |
| `rdm-infografia.png` (3MB) | Demasiado grande | Comprimir a WebP <200KB |
| `rdm02.jpg` (3MB) | Demasiado grande | Comprimir a WebP <200KB |
| `logotamv.jpg` (2.6MB) | Demasiado grande | Comprimir a WebP <200KB |

---

## Reglas de Base de Datos

### Migraciones

1. **Una migración = una función.** No combinar múltiples cambios en un solo archivo.
2. **Todo CREATE TABLE DEBE incluir RLS.** No hay tablas sin Row Level Security.
3. **Toda FK DEBE tener índice.** No hay foreign keys sin índice.
4. **No existen migraciones en más de un directorio.** `migrations/` es la fuente de verdad.
5. **No se eliminan políticas para recrearlas.** Si hay que cambiar, usar ALTER.

### Políticas existentes que deben consolidarse

| Tabla | Migraciones que la modifican | Problema |
|-------|------------------------------|----------|
| `forum_posts` | 3 (create, drop, recreate) | Churn de políticas |
| `forum_comments` | 3 (create, drop, recreate) | Churn de políticas |

---

## Checklist de Revisión

Antes de crear nuevo código backend:

- [ ] ¿En qué entorno vive? (ver tabla de entornos)
- [ ] ¿Ya existe esta funcionalidad en otro entorno?
- [ ] ¿Tiene autenticación?
- [ ] ¿Tiene rate limiting?
- [ ] ¿Tiene CORS configurado correctamente?
- [ ] ¿Está documentado?
- [ ] ¿Tiene tests?
- [ ] ¿Sigue el patrón de auth del entorno?

---

## Auditorías Programadas

| Fecha | Tipo | Responsable |
|-------|------|-------------|
| Mensual | Revisión de duplicados | Arquitecto |
| Trimestral | Revisión de seguridad | Seguridad |
| Semestral | Revisión de dependencias | DevOps |
| Anual | Architecture Review completa | Todos |
