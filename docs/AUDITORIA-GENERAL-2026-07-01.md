# AUDITORÍA GENERAL DEL PROYECTO — Máxima Exigencia
**Fecha:** 2026-07-01
**Repo:** `real-del-monte-digital-hub-c327091a-main`
**Commit:** `c372d26`

---

## RESUMEN EJECUTIVO

| Severidad | Hallazgos |
|-----------|-----------|
| **CRÍTICO** | 5 |
| **ALTO** | 11 |
| **MEDIO** | 12 |
| **BAJO** | 6 |

**Hallazgo principal:** El proyecto tiene **5 entornos backend ejecutando simultáneamente** sin reglas claras de separación. Esto genera Architectural Drift: duplicación de funcionalidades, autenticación inconsistente, y múltiples centros de verdad.

---

## HALLAZGOS CRÍTICOS

### CRIT-01: 5 Entornos Backend sin Reglas

**Ubicaciones:**
1. `api/` — Vercel Serverless/Edge (9 archivos)
2. `supabase/functions/` — Supabase Edge Functions (20+ funciones)
3. `server/` — Express.js Backend (25+ rutas, 80+ archivos)
4. `src/app/api/` — Next.js App Router API Routes (18 rutas)
5. `serverless/` — Standalone Express (1 archivo)

**Problema:** Cada entorno tiene:
- Autenticación diferente (JWT, Supabase auth, Bearer token, NINGUNA)
- CORS diferente (allowlist, wildcard, none)
- Rate limiting diferente (DB-backed, in-memory, NINGUNO)

**Impacto:** Imposible garantizar consistencia de seguridad. Cada nuevo endpoint puede implementar auth de forma diferente.

**Acción:** Ver `ARCHITECTURE.md` para reglas de separación.

---

### CRIT-02: TTS-Isabella Duplicado

**Ubicaciones:**
- `api/tts-isabella.js` — Vercel Edge: Sin auth, integración TTS es TODO stub, usa anon key server-side
- `supabase/functions/tts-isabella/index.ts` — Supabase Edge: Auth verificada, Google Cloud TTS integrado, SSML profiles, cache SHA-256

**Problema:** Dos implementaciones completamente diferentes del mismo endpoint. Una funcional, otra stub.

**Acción:** Eliminar `api/tts-isabella.js`. Mantener Supabase.

---

### CRIT-03: Imágenes Placeholder Idénticas

**Archivos:** 12 imágenes en `src/assets/` son exactamente **1,696,555 bytes** cada una:
- `mine-tunnel.jpg`
- `mining-equipment.jpg`
- `museo-mina.jpg`
- Y 9 más

**Problema:** Tamaño idéntico sugiere placeholders o duplicados no reemplazados.

**Acción:** Verificar cada imagen. Reemplazar placeholders con assets reales.

---

### CRIT-04: Video Roto

**Archivo:** `public/video/hero.mp4` — **11 bytes**

**Problema:** 11 bytes no es un archivo de video válido. Cualquier página que referencie `hero.mp4` fallará silenciosamente.

**Acción:** Reemplazar con video real optimizado (H264 MP4, Fast Start).

---

### CRIT-05: ai_prompts_log Sin RLS

**Archivo:** `supabase/migrations/20260701000100_ai_prompts_log.sql`

**Problema:** La migración más reciente crea la tabla pero NO habilita Row Level Security. Cualquier usuario con el anon key puede leer/escribir todos los prompts de IA.

**Acción:** Agregar `ALTER TABLE ai_prompts_log ENABLE ROW LEVEL SECURITY;` + políticas.

---

## HALLAZGOS ALTOS

### HIGH-01: 5 Health Checks Diferentes

| Ubicación | Reporta | Auth |
|-----------|---------|------|
| `api/health.ts` | Random latencias, referencia endpoint inexistente (`ia-fx`) | Ninguna |
| `api/cron/health-check.js` | Random status | CRON_SECRET |
| `src/app/api/health/route.ts` | Consciousness, federation-bus, memory, guardian | Ninguna |
| `server /healthz` | — | JWT |
| `supabase/functions/federation-health/` | 7 federaciones | Ninguna |

**Problema:** 5 implementaciones que reportan cosas diferentes. Imposible confiar en cuál es la verdad.

**Acción:** Consolidar en 2: `api/health.ts` (público) + `api/cron/health-check.js` (cron).

---

### HIGH-02: 3 Gateways de IA

| Ubicación | Modelo | Auth |
|-----------|--------|------|
| `supabase/functions/isabella-ai/` | Model Router → Gemini fallback | JWT Supabase |
| `api/ai/chat.js` | Vercel AI SDK `streamText` | NINGUNA |
| `src/app/api/isabella/*` (11 rutas) | Varias | NINGUNA en la mayoría |

**Problema:** 3 implementaciones diferentes del mismo concepto con diferentes modelos y auth.

**Acción:** Consolidar en `supabase/functions/isabella-ai/`. Eliminar `api/ai/chat.js`.

---

### HIGH-03: Páginas Duplicadas

| Par | Líneas | Problema |
|-----|--------|----------|
| `Musica.tsx` vs `Music.tsx` | 710 vs 78 | Music.tsx es dead code (no está en App.tsx) |
| `RegistroComercio.tsx` vs `RegistrarComercio.tsx` | 482 vs 308 | Dos formularios de registro, datos diferentes |
| `Membresias.tsx` vs `Membership.tsx` | 141 vs 259 | Dos modelos de membresía, precios diferentes (MXN vs USD) |
| `Comunidad.tsx` vs `ComunidadPage.tsx` | 496 vs 162 | Una con Supabase, otra con datos hardcodeados |
| `Documentation.tsx` vs `Documentacion.tsx` | 15 vs 60 | Wrapper vs wiki-style |
| `Mapa.tsx` vs `MapaVivo.tsx` | — | Dos mapas con diferentes datos POI |
| `Wiki.tsx` vs `WikiTAMV.tsx` | — | Supabase-powered vs estático |

**Problema:** 7 pares de páginas con el mismo concepto diferentes implementaciones.

**Acción:** Consolidar cada par en una sola página.

---

### HIGH-04: Music Module Duplicado

**Directorio:** `src/modules/music/music/` — Subdirectorio completo duplicado dentro de `src/modules/music/`

**Contenido duplicado:**
- `hooks/useMusicPlayer.ts` (2 copias)
- `data/playlist.ts` (2 copias)
- `components/RDMHeroPlayer.tsx` (2 copias)

**Acción:** Eliminar `src/modules/music/music/`.

---

### HIGH-05: Knowledge Cells Triple Implementación

| Ubicación | Tipo | Estado |
|-----------|------|--------|
| `knowledge-cells/` | Express microservice independiente | Dockerfile, package.json propio |
| `api/knowledge-cells/` | Vercel serverless functions | 3 archivos |
| `api/health.ts` | Referencia a endpoint inexistente | `ia-fx` no existe |

**Problema:** 3 implementaciones del mismo concepto sin orquestación clara.

**Acción:** Definir una fuente de verdad. Eliminar las otras.

---

### HIGH-06: .github/.github/ Duplicado

**Directorio:** `.github/.github/workflows/` contiene:
- `ci.yml` (duplicado)
- `sovereign-pipeline.yml` (huérfano)

**Problema:** GitHub solo lee de `.github/workflows/`. El directorio anidado nunca se ejecuta.

**Acción:** Eliminar `.github/.github/`.

---

### HIGH-07: Documentación Faltante

| Documento | Estado |
|-----------|--------|
| `ARCHITECTURE.md` | ✅ Creado hoy |
| `SECURITY_ARCHITECTURE.md` | ❌ MISSING |
| `DEPLOYMENT.md` | ❌ MISSING |
| `MODULES.md` | ❌ MISSING |
| `API CONTRACTS.md` | ❌ MISSING |
| `DATA FLOW.md` | ❌ MISSING |
| `CHANGELOG.md` | ❌ MISSING |

**Problema:** 5 de 7 documentos críticos no existen.

---

### HIGH-08: 26 Archivos Legacy sin Type Safety

**Archivo:** `eslint.config.js` líneas 117-157

**Problema:** 26 archivos (incluyendo `CinematicIntro.tsx`, `InteractiveMap.tsx`, `IsabellaChat.tsx`, `Admin.tsx`, `GamePortal.tsx`) están exentos de `@typescript-eslint/no-explicit-any`. Sin plan de migración.

---

### HIGH-09: Sin Foreign Keys en Base de Datos

**Problema:** Ninguna migración contiene `ALTER TABLE...ADD CONSTRAINT...FOREIGN KEY`. Todas las referencias se validan solo a nivel de aplicación.

**Riesgo:** Datos huérfanos si la aplicación tiene bugs.

---

### HIGH-10: CORS Inconsistente

| Entorno | Patrón |
|---------|--------|
| `supabase/functions/isabella-ai/` | Allowlist explícita |
| `supabase/functions/isabella-ontology/` | `*` (wildcard) |
| `api/ai/chat.js` | `*` (wildcard) |
| `server/` | Config-driven allowlist |
| `src/app/api/` | Same-origin |

---

### HIGH-11: Rate Limiting 3 Implementaciones

| Entorno | Implementación | Almacenamiento |
|---------|----------------|----------------|
| `supabase/functions/` | `_shared/rate-limit.ts` | Supabase DB |
| `server/` | `express-rate-limit` | Memoria (in-process) |
| `api/` | **NINGUNO** | — |
| `src/app/api/` | **NINGUNO** | — |

---

## HALLAZGOS MEDIOS

### MED-01: 4 Patrones de Auth Diferentes

| Patrón | Dónde |
|--------|-------|
| JWT Supabase (`auth.getUser()`) | supabase/functions/ |
| JWT Bearer (HS256) | server/ |
| Bearer CRON_SECRET | api/cron/ |
| NINGUNO | api/ (la mayoría), src/app/api/ |

---

### MED-02: Churn de Políticas RLS

**Tablas afectadas:** `forum_posts`, `forum_comments`

**Migraciones:** Creadas en 20260531, eliminadas en 20260626, recreadas en 20260629.

**Problema:** 3 iteraciones para estabilizar políticas básicas.

---

### MED-03: Dos Directorios de Migraciones

- `supabase/migrations/` — 16 archivos (fuente activa)
- `supabase/migrations-imported/` — 15 archivos (importadas)

**Problema:** Confusión sobre cuál es la fuente de verdad.

---

### MED-04: @typescript-eslint/no-unused-vars Global OFF

**Archivo:** `eslint.config.js` línea 23

**Problema:** Variables nunca usadas no se detectan.

---

### MED-05: ShutdownProtocol.ts Dead Code

**Archivo:** `src/security/ShutdownProtocol.ts`

**Problema:** Nunca es importado por ningún otro archivo. Imports resuelven pero el módulo es inalcanzable.

---

### MED-06: Barrel Re-exports Redundantes

- `src/data/imported/rdmFederations.ts` — Re-exporta un solo type
- `src/components/ui/use-toast.ts` — Shim que re-exporta `@/hooks/use-toast`

---

### MED-07: isabella-ontology Sin Auth

**Archivo:** `supabase/functions/isabella-ontology/index.ts`

**Problema:** Usa service_role key directamente. Cualquier caller puede consultar la ontología.

---

### MED-08: rdm-redeem Race Condition

**Archivo:** `supabase/functions/rdm-redeem/index.ts`

**Problema:** Lectura de balance + update no es atómico. Redenciones concurrentes pueden sobre-dibujar puntos.

---

### MED-09: rdm-membership-activate Sin Pago

**Archivo:** `supabase/functions/rdm-membership-activate/index.ts` líneas 35-36

**Problema:** Activa membresía 30 días sin verificación de pago.

---

### MED-10: metrics-aggregates Sin Auth

**Archivo:** `supabase/functions/metrics-aggregates/index.ts`

**Problema:** Datos sensibles (ingresos) expuestos sin autenticación.

---

### MED-11: MP3s Bundled en Frontend

**Directorio:** `src/assets/musica/` — 14 archivos MP3

**Problema:** Bundlados con el frontend, aumentando tamaño de build significativamente.

---

### MED-12: 10+ Route Aliases

Múltiples rutas mapean a la misma página:
- `/explorar` y `/mapa` → `<Mapa />`
- `/experiencias` y `/rutas` → `<Rutas />`
- `/sabores` y `/gastronomia` → `<Gastronomia />`
- Y 7 más

**Problema:** Confusión de URLs. Posible contenido duplicado para SEO.

---

## HALLAZGOS BAJOS

### LOW-01: 14 MP3 en src/assets/
### LOW-02: Barrel re-exports redundantes
### LOW-03: 11-byte rdmFederations.ts
### LOW-04: Music.tsx dead code (no en App.tsx)
### LOW-05: BusinessCard.tsx con @ts-nocheck
### LOW-06: sovereign-pipeline.yml huérfano

---

## PLAN DE ACCIÓN PRIORIZADO

### Semana 1: CRÍTICOS

| # | Acción | Archivos | Esfuerzo |
|---|--------|----------|----------|
| 1 | Eliminar `api/tts-isabella.js` | 1 archivo | 5 min |
| 2 | Eliminar `api/ai/chat.js` | 1 archivo | 5 min |
| 3 | Agregar RLS a `ai_prompts_log` | 1 migración | 10 min |
| 4 | Reemplazar `hero.mp4` (11 bytes) | 1 asset | 30 min |
| 5 | Verificar 12 imágenes placeholder | 12 assets | 1 hora |
| 6 | Eliminar `.github/.github/` | 1 directorio | 2 min |

### Semana 2: ALTOS

| # | Acción | Archivos | Esfuerzo |
|---|--------|----------|----------|
| 7 | Consolidar páginas duplicadas (7 pares) | 14→7 archivos | 4 horas |
| 8 | Eliminar `src/modules/music/music/` | 1 directorio | 5 min |
| 9 | Consolidar health checks (5→2) | 3 archivos | 2 horas |
| 10 | Agregar auth a `src/app/api/` routes | 18 archivos | 4 horas |
| 11 | Agregar FOREIGN KEY constraints | 16 migraciones | 2 horas |
| 12 | Crear `SECURITY_ARCHITECTURE.md` | 1 doc | 2 horas |

### Semana 3: MEDIOS

| # | Acción | Archivos | Esfuerzo |
|---|--------|----------|----------|
| 13 | Consolidar CORS patterns | 20+ archivos | 4 horas |
| 14 | Consolidar rate limiting | 10+ archivos | 4 horas |
| 15 | Agregar manifest.json a knowledge-cells | 3 archivos | 1 hora |
| 16 | Fix rdm-redeem race condition | 1 archivo | 1 hora |
| 17 | Fix rdm-membership-activate | 1 archivo | 30 min |
| 18 | Fix isabella-ontology auth | 1 archivo | 30 min |

### Semana 4: BAJOS + DOCUMENTACIÓN

| # | Acción | Archivos | Esfuerzo |
|---|--------|----------|----------|
| 19 | Crear DEPLOYMENT.md | 1 doc | 2 horas |
| 20 | Crear API CONTRACTS.md | 1 doc | 4 horas |
| 21 | Crear DATA FLOW.md | 1 doc | 2 horas |
| 22 | Crear CHANGELOG.md | 1 doc | 1 hora |
| 23 | Optimizar assets (WebP, H264) | 20+ archivos | 4 horas |
| 24 | Eliminar dead code (Music.tsx, ShutdownProtocol) | 2 archivos | 10 min |

---

## MÉTRICAS DEL PROYECTO

| Métrica | Valor |
|---------|-------|
| Total archivos TypeScript/JavaScript | ~500 |
| Total líneas de código | ~50,000 (estimado) |
| Edge functions Supabase | 20+ |
| API functions Vercel | 9 |
| Express routes | 25+ |
| Next.js API routes | 18 |
| Páginas React | ~100 |
| Componentes React | ~50 |
| Hooks | 14 |
| Tests | ~15 |
| Migraciones DB | 31 |
| Workflows CI/CD | 6 (4 válidos) |
| Documentos docs/ | 26 |
| Entornos backend | 5 |
| Patrones de auth | 4 |
| Patrones de CORS | 3 |
| Implementaciones rate limiting | 3 |

---

## CONCLUSIÓN

El proyecto tiene una **base arquitectónica sólida** (heptafederación, Isabella pipeline, security modules). Sin embargo, el crecimiento rápido ha generado **Architectural Drift** significativo con 5 entornos backend y múltiples centros de verdad.

**La prioridad inmediata es:**
1. Consolidar duplicados (TTS, AI gateway, health checks, páginas)
2. Unificar autenticación y CORS
3. Eliminar dead code y assets rotos
4. Completar documentación crítica

**El mayor riesgo para producción no es la implementación de nuevas funciones, sino la consistencia entre módulos.**

---

*Auditoría generada automáticamente. Revisar ARCHITECTURE.md para reglas de separación.*
