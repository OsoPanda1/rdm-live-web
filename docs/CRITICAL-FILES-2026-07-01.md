# ARCHIVOS CRÍTICOS — Análisis Integral 2026-07-01

Auditoría completa del repo `main` (commit `db4aef3`). Escala de madurez: M0 (Conceptual) → M5 (Congelado).

---

## CRIT — Problemas de Seguridad Inmediatos

| # | Archivo | Línea | Problema | Riesgo | Maturity |
|---|---------|-------|----------|--------|----------|
| CRIT-01 | `.env` / `.env.local` | 1-5 | Credenciales reales (Supabase URL, JWT, publishable key) commiteadas al repo | CRÍTICO | M4 |
| CRIT-02 | `src/hooks/useIsabella.ts` | 105 | Envía `VITE_SUPABASE_ANON_KEY` como Authorization en vez de `session.access_token` — el chat falla para usuarios autenticados | CRÍTICO | M2 |
| CRIT-03 | `api/ai/chat.js` | 38 | Sin autenticación; modelo selectionado por el caller; CORS `*` — vector de abuso y exposición de costos | CRÍTICO | M1 |
| CRIT-04 | `api/tts-isabella.js` | 79 | Sin autenticación; integración TTS es TODO; usa anon key server-side | ALTO | M1 |
| CRIT-05 | `api/model-router.ts` | — | Sin autenticación; expone routing a HuggingFace/OpenLLM sin costo de llamada | ALTO | M1 |
| CRIT-06 | `src/security/ShutdownProtocol.ts` | 2-4 | Importa de `@/kernel/index`, `@/isabella/knowledge/KnowledgeAbsorptionEngine`, `@/kernel/engine/Ledger` — rutas inexistentes; crash al invocar | ALTO | M2 |

---

## SEG — Seguridad y Autenticación

| Archivo | Propósito | Maturity | Tests | Problemas |
|---------|-----------|----------|-------|-----------|
| `supabase/functions/isabella-ai/index.ts` | Chat IA Isabella con Model Router + Gemini fallback | M3 | No | JWT verificado; origin allowlist. Sin rate limit propio |
| `supabase/functions/realito-chat/index.ts` | Chat IA Realito | M3 | No | Misma estructura que isabella-ai; sin rate limit propio |
| `supabase/functions/tts-isabella/index.ts` | TTS con cache SHA-256 + Google Cloud | M3 | No | Auth verificada; sin rate limit propio |
| `supabase/functions/stripe-webhook/index.ts` | Webhook Stripe con idempotencia | M4 | No | Firma verificada; `processed_at` para dedup. Puede leakear errores completos |
| `supabase/functions/create-premium-checkout/index.ts` | Checkout premium | M3 | No | JWT verificado; rate limit 10/min. Sin validación de origen |
| `supabase/functions/create-commerce-checkout/index.ts` | Checkout commerce | M3 | No | Igual que premium |
| `supabase/functions/create-music-donation/index.ts` | Donación musical (anónimo permitido) | M3 | No | Auth opcional; sin rate limit |
| `supabase/functions/check-subscription/index.ts` | Sync suscripción desde Stripe | M3 | No | Sin rate limit; escritura admin a profiles |
| `supabase/functions/award-points/index.ts` | Gamificación puntos con cooldown | M4 | No | RPC atómica; rate limit 60/min. Patrón sólido |
| `supabase/functions/rdm-mine/index.ts` | Simulación minera | M3 | No | Gated por membresía; rate limit 30/min |
| `supabase/functions/rdm-redeem/index.ts` | Canje de puntos | M3 | No | **Race condition:** lectura-then-update no atómica |
| `supabase/functions/rdm-membership-activate/index.ts` | Activar membresía | M3 | No | **Activa siempre 30 días sin pago** (pag 35-36) |
| `supabase/functions/isabella-ontology/index.ts` | Queries de ontología | M3 | No | **Sin auth; usa service_role key** — cualquier caller consulta |
| `supabase/functions/federation-health/index.ts` | Health check de federaciones | M3 | No | Read-only; no necesita auth |
| `supabase/functions/alerts-engine/index.ts` | Evaluación de salud + alertas | M3 | No | Cron; sin auth; service role |
| `supabase/functions/metrics-aggregates/index.ts` | Agregación KPIs 24h | M3 | No | Datos sensibles (ingresos) expuestos sin auth |
| `supabase/functions/ingest-event/index.ts` | Ingesta de eventos tracking | M3 | No | Best-effort; sin dedup |
| `supabase/functions/merchant-payment-webhook/index.ts` | Confirmación pago merchant | M3 | No | Auth por header; sin rate limit |
| `supabase/functions/customer-portal/index.ts` | Portal billing Stripe | M3 | No | JWT verificado; sin rate limit |

---

## API — Funciones Vercel Serverless

| Archivo | Propósito | Maturity | Auth | Problemas |
|---------|-----------|----------|------|-----------|
| `api/ai/chat.js` | AI Gateway streaming | M1 | **NINGUNA** | Sin auth; CORS `*`; modelo controlado por caller |
| `api/tts-isabella.js` | TTS endpoint | M1 | **NINGUNA** | Sin auth; TTS es TODO; usa anon key server-side |
| `api/model-router.ts` | Routing HuggingFace + OpenLLM | M1 | **NINGUNA** | Sin auth; expone créditos HF |
| `api/telemetry.js` | Telemetría | M2 | Ninguna (GET) | Usa `VITE_` keys server-side |
| `api/cron/health-check.js` | Health check diario | M3 | CRON_SECRET | OK — patrón correcto |

---

## SEG — Módulos de Seguridad (`src/security/`)

| Archivo | Propósito | Maturity | Tests | Problemas |
|---------|-----------|----------|-------|-----------|
| `PostQuantumCrypto.ts` | PQC v1 (SHA-256 HMAC como "firmas") | M2 | Sí | No es PQC real; key derivation trivialmente reversible |
| `ContextIsolation.ts` | Aislamiento de sesión IA | M3 | No | In-memory Map (se pierde al reiniciar); sin timing-safe comparison |
| `InputValidation.ts` | Sanitización strings, email, numérico | M3 | No | Buena defensa multi-capa; regex custom |
| `sanitize.ts` | DOMPurify HTML sanitization | M4 | Sí | Limpio, bien configurado |
| `ShutdownProtocol.ts` | Apagado graceful multi-etapa | M2 | No | **Importa de rutas inexistentes** — crash al invocar |
| `ExternalNetworksConnector.ts` | Broadcast redes sociales | M2 | No | In-memory store; sin llamadas API reales |
| `BlockchainConnector.ts` | Anclaje blockchain (Polygon, etc.) | M2 | No | **Simulado** — `Math.random()` para éxito |

---

## QUANT — Módulo Cuántico (`src/quantum/`)

| Archivo | Propósito | Maturity | Tests | Problemas |
|---------|-----------|----------|-------|-----------|
| `pqc.ts` | PQC v2 (Kyber/Dilithium via WASM) | M2 | Sí | WASM desde CDN (jsdelivr); fallback es crypto clásica; stubs incompletos |
| `pennylane-bridge.ts` | PennyLane quantum ML | M1 | No | Stub |

---

## HOOKS — `src/hooks/`

| Archivo | Propósito | Maturity | Tests | Problemas |
|---------|-----------|----------|-------|-----------|
| `useAuth.tsx` | Auth state Supabase | M4 | Sí | Limpio, patrón estándar |
| `useIsabella.ts` | Chat IA con SSE | M2 | No | **Envía ANON_KEY en vez de JWT** |
| `useIsabellaVoice.ts` | TTS dual-mode (cloud/local) | M3 | Sí | OK — cloud→local fallback |
| `useIsabellaSSE.ts` | SSE Isabella | M3 | No | — |
| `useApi.ts` | Fetch genérico | M3 | No | Sin auth injection |
| `useUserRole.ts` | Determinación rol | M3 | No | — |
| `useWeather.ts` | Datos clima | M2 | No | — |
| `useWebSocket.ts` | Conexión WebSocket | M2 | No | — |
| `useCivicEvent.ts` | Tracking eventos cívicos | M2 | No | — |
| `useDemoMode.ts` | Toggle demo | M3 | No | — |
| `useMapSync.tsx` | Sincronización mapa | M2 | No | — |
| `usePaginated.ts` | Paginación | M3 | No | — |
| `useSystemMode.ts` | Detección modo sistema | M3 | No | — |
| `useTimeTheme.ts` | Tema por hora | M3 | No | — |

**Cobertura:** Solo 2 de 14 hooks tienen tests.

---

## PAGES — `src/pages/` (~100 páginas)

- **~37 archivos** en la lista relaxed-typing de `eslint.config.js` (líneas 117-157) — effectively bypassan TypeScript strict
- **1 test** existe: `Auth.test.ts`
- **Páginas duplicadas detectadas:** `Musica.tsx` vs `Music.tsx`, `Documentation.tsx` vs `Documentacion.tsx`, `RegistroComercio.tsx` vs `RegistrarComercio.tsx`, `Membresias.tsx` vs `Membership.tsx`

---

## COMPONENTS — `src/components/`

- `BusinessCard.tsx` tiene `// @ts-nocheck` línea 1
- **37+ archivos** en lista relaxed-typing de eslint
- **0 tests** de componentes

---

## SHARED — Infraestructura compartida

| Archivo | Propósito | Maturity | Problemas |
|---------|-----------|----------|-----------|
| `_shared/rate-limit.ts` | Rate limiting multi-key | M3 | Race condition: read-then-update no atómico |
| `_shared/validation.ts` | Schemas Zod | M3 | Limpio |
| `_shared/safeError.ts` | Error wrapper con correlation ID | M3 | Buen patrón |

---

## WORKFLOWS — `.github/workflows/`

| Workflow | Triggers | Jobs | Estado |
|----------|----------|------|--------|
| `ci.yml` | push/PR → main, develop | fast-checks, quality (Node 18+20), e2e (sharded 2x), smoke, deploy-vercel | Bien estructurado |
| `security.yml` | push/PR + semanal | secrets (Gitleaks+TruffleHog), deps-audit, policy, telemetry | Completo |
| `codeql.yml` | push/PR + semanal | auto-detect languages + analyze | OK |
| `rls-ci-gate.yml` | PR on migrations | Postgres 15, apply migrations, RLS audit | Presente pero falta `scripts/audit-rls.sql` |

**Nota:** Existe directorio duplicado `.github/.github/workflows/` con `ci.yml` y `sovereign-pipeline.yml` — GitHub ignora este path.

---

## PATCHES — Estado de aplicación

| Patch | Target | Estado |
|-------|--------|--------|
| 01-auth-isabella | Auth bypass, Gemini key | **PARCIAL** — isabella-ai tiene allowlist; falta `.env.example` con patrón GEMINI_API_KEY |
| 02-build-vercel | Vite lock, wrangler | **NO** — vercel.json aún usa `--legacy-peer-deps` |
| 03-stripe-hardening | Firma webhook, idempotencia | **PARCIAL** — verificación presente; falta helper compartido `_shared/stripe.ts` |
| 04-rls-ci-gate | RLS audit + CI | **PARCIAL** — workflow existe; falta `scripts/audit-rls.sql` |
| 05-headers-csp | CSP + HSTS | **SÍ** — headers presentes pero CSP usa `unsafe-inline`/`unsafe-eval` |
| 06-perf-vercel | Lazy imports, performance | **NO** — App.tsx aún importa eager; CinematicIntro bloquea |

---

## COBERTURA DE TESTS

| Ubicación | Archivos | Cobertura |
|-----------|----------|-----------|
| `src/test/` | `useAuth.test.ts`, `example.test.ts` | Hook + smoke |
| `src/security/__tests__/` | `sanitize.test.ts` | DOMPurify |
| `src/quantum/__tests__/` | `pqc.test.ts` | PQC crypto |
| `src/lib/__tests__/` | `secure-random.test.ts` | Random |
| `src/lib/` | `utils.test.ts`, `logger.test.ts`, `env.test.ts` | Libs |
| `src/pages/` | `Auth.test.ts` | 1 page |
| `tests/` | `useIsabellaVoice.test.ts` | Voice hook |
| `tests/integration/` | 4 int tests | Integration |
| `e2e/` | 6 Playwright specs | E2E |

**Umbrales configurados (vitest.config.ts):** 60% lines, 60% functions, 50% branches — todos bajo 80% objetivo.

**Gaps críticos:** Zero tests para: edge functions, API functions, payment flows, security modules (except sanitize), pages (except Auth), components.

---

## PLAN DE ACCIÓN PRIORIZADO

| Prioridad | Acción | Archivos afectados |
|-----------|--------|--------------------|
| **CRÍTICO** | Rotar `VITE_SUPABASE_PUBLISHABLE_KEY`; `.gitignore` para `.env*` | `.env`, `.env.local`, `.gitignore` |
| **CRÍTICO** | Autenticar `api/ai/chat.js`, `api/tts-isabella.js`, `api/model-router.ts` | 3 archivos en `api/` |
| **CRÍTICO** | Fix `useIsabella.ts`: enviar `session.access_token` en vez de ANON_KEY | `src/hooks/useIsabella.ts:105` |
| **ALTO** | Fix `IsabellaChat.tsx`: rechazar estado no autenticado | `src/components/IsabellaChat.tsx:39` |
| **ALTO** | Fix `ShutdownProtocol.ts`: importar solo de rutas existentes o remover | `src/security/ShutdownProtocol.ts:2-4` |
| **ALTO** | Aplicar patches pendientes (02, 04 SQL, 06 performance) | Múltiples |
| **ALTO** | Rate limit a `isabella-ai`, `realito-chat`, `rdm-redeem`, payment functions | Edge functions |
| **MEDIO** | CORS wildcard → allowlist en 11 edge functions restantes | 11 archivos |
| **MEDIO** | Eliminar `@ts-nocheck` de `BusinessCard.tsx` + address relaxed-typing | 38 archivos |
| **MEDIO** | Tests: payment flows, security modules, critical hooks | Tests |
