# ANALYSIS.md — Auditoría de Seguridad y Deuda Técnica

## P0 — Críticos (acción inmediata)

| ID | Hallazgo | Archivo | Riesgo | Estatus |
|----|----------|---------|--------|---------|
| P0-01 | `VITE_GEMINI_API_KEY` en .env.example — key secreta con prefijo público | `.env.example:26` | Key Gemini via bundle | ✅ Corregido |
| P0-02 | `isabella-ai/index.ts` acepta bearer inválido como "anonymous" | `supabase/functions/isabella-ai/index.ts:45` | Bypass auth + consumo ilimitado IA | ✅ Corregido |
| P0-03 | Vite version `^8.1.0` no existe (estable es 7.x) + API de Vite 8 inestable | `package.json:112` | Builds indeterministas | ✅ Versión 8.1 existe, estable |
| P0-04 | Tres lockfiles conviviendo (`package-lock.json`, `bun.lock`, `bun.lockb`) | raíz | CI es ruleta | ✅ Eliminados bun.lock* |
| P0-05 | Doble target Cloudflare + Vercel con redirects duplicados | `wrangler.toml`, `vercel.json`, `_redirects` | Confusión deploys | ✅ Eliminado Cloudflare |
| P0-06 | Sin CSP ni HSTS en headers HTTP | SPA con Stripe + AI + foros | XSS abierto | ✅ Agregado a vercel.json |
| P0-07 | `rollupOptions.external: [/@sentry\//, /posthog-js/]` sin CDN fallback | `vite.config.ts:46` | Módulos sin resolver en runtime | ✅ Corregido |

## P1 — Altos

| ID | Hallazgo | Archivo | Acción |
|----|----------|---------|--------|
| P1-01 | Referencias a Cloudflare en docs/ | `docs/RUNBOOK.md`, `docs/HARDENING-ROADMAP.md`, etc. | ✅ Actualizadas a Vercel |
| P1-02 | `.wrangler` en eslint ignores | `eslint.config.js:8` | ✅ Eliminado |
| P1-03 | CSP referenciaba `challenges.cloudflare.com` y `wss://*.cloudflare.com` | `public/_headers` | ✅ Migrado a vercel.json sin CF |
| P1-04 | `preconnect` a `challenges.cloudflare.com` en index.html | `index.html:19` | ✅ Eliminado |
| P1-05 | No hay health check post-deploy | CI pipeline | Pendiente |
| P1-06 | CI no verifica artefacto build | CI pipeline | Pendiente |
| P1-07 | Server `package.json` sin lockfile propio | `server/package.json` | Pendiente |
| P1-08 | Sin pruebas de integración para Edge Functions | — | Pendiente |
| P1-09 | Sin rate limiting en Edge Functions públicas | — | Pendiente |
| P1-10 | Dependencias no auditable por lockfile único | — | Pendiente |

## P2 — Medios

| ID | Hallazgo | Acción |
|----|----------|--------|
| P2-01 | Consolidar a npm como único package manager | ✅ bun.lock eliminados |
| P2-02 | Agregar script `postinstall` para verificar lockfile único | Pendiente |
| P2-03 | Migrar CSP dinámica por entorno | Pendiente |
| P2-04 | Revisar todas las rutas que caen en `"anonymous"` en `src/app/api/isabella/*` | Pendiente |
| P2-05 | Agregar `Content-Type` header en respuestas de error de Edge Functions | Pendiente |
| P2-06 | Revisar dependencias muertas post-absorción | Pendiente |
| P2-07 | Evaluar migración de Turnstile a alternativa | Pendiente |
