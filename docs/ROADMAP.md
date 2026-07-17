# ROADMAP.md — Plan de Acción Post-Auditoría

## Wave 1 — Eliminación Cloudflare ✅ COMPLETADA
**Gate: CI verde sin Cloudflare ✅**

| # | Tarea | Estado |
|---|-------|--------|
| 1 | Eliminar `wrangler.toml`, `public/_headers`, `public/_redirects` | ✅ |
| 2 | Migrar CSP+HSTS a `vercel.json` | ✅ |
| 3 | Limpiar `index.html` (preconnect CF) | ✅ |
| 4 | Actualizar CI: remover jobs CF, agregar Vercel deploy | ✅ |
| 5 | Actualizar docs con referencias a Vercel | ✅ |
| 6 | Limpiar comentarios en código fuente (RDMAuthContext, logger, server/) | ✅ |
| 7 | Eliminar artefactos y scripts huérfanos (apps/, audit_*, tools/*) | ✅ |
| 8 | Eliminar dependencias no usadas (space-grotesk, google/genai, lovable/cloud-auth-js, esbuild) | ✅ |

**Verificación**: `grep -ri cloudflare src/ .github/ docs/` → 0 resultados (salvo contenido informativo en Manuales.tsx y Despliegue.tsx)

---

## Wave 2 — Fix Seguridad P0 (2 agent-hours)
**Gate: Code review de auth flow**

| # | Tarea | Depende |
|---|-------|---------|
| 1 | Fix `VITE_GEMINI_API_KEY` en `.env.example` | — |
| 2 | Fix `isabella-ai/index.ts` — 401 en bearer inválido | — |
| 3 | Remover `rollupOptions.external` | — |
| 4 | Eliminar lockfiles duplicados | — |

**Verificación**: `npm run build` + revisar bundle por Sentry/PostHog incluidos

---

## Wave 3 — Hardening CI (1.5 agent-hours)
**Gate: Deploy manual a Vercel exitoso**

| # | Tarea | Depende |
|---|-------|---------|
| 1 | Configurar secrets VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID | Wave 1 |
| 2 | Probar deploy automático en PR | — |
| 3 | Agregar health check post-deploy | — |
| 4 | Agregar verificación de artefacto build | — |

---

## Wave 4 — Isabella Auth (1.5 agent-hours)
**Gate: Edge Functions deployadas correctamente**

| # | Tarea | Depende |
|---|-------|---------|
| 1 | Revisar 5 rutas Isabella en `src/app/api/` que usan `"anonymous"` | Wave 2 |
| 2 | Agregar rate limiting a Edge Functions públicas | — |
| 3 | Agregar pruebas de integración para Edge Functions | — |

---

## Wave 5 — Documentación y Limpieza (1 agent-hour)
**Gate: Todos los anteriores completos**

| # | Tarea | Depende |
|---|-------|---------|
| 1 | Revisar dependencias muertas post-absorción | — |
| 2 | Migrar CSP dinámica por entorno | Wave 1 |
| 3 | Evaluar alternativa a Turnstile | — |
| 4 | Documentar proceso de deploy, secrets, y CSP | Waves 1-4 |

---

## Resumen de Esfuerzo

- **~7-8 agent-hours** con paralelismo (Waves 1 y 2 pueden ir en paralelo)
- **~11 agent-hours** secuencial
- **Gates de bloqueo**: CI verde, Code Review, Deploy manual exitoso
