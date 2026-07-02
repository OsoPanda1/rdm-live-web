# CHECKLIST.md — 40 Ítems Atómicos Post-Auditoría

## S-01..10 — Seguridad

- [x] S-01: Eliminar `VITE_GEMINI_API_KEY` de `.env.example`
- [x] S-02: Rechazar bearer inválido en `isabella-ai/index.ts` (401 en vez de "anonymous")
- [x] S-03: Eliminar `wrangler.toml`
- [x] S-04: Eliminar `public/_headers`
- [x] S-05: Eliminar `public/_redirects`
- [x] S-06: Migrar CSP + HSTS a `vercel.json`
- [x] S-07: Eliminar `challenges.cloudflare.com` del CSP
- [x] S-08: Eliminar `preconnect` a Cloudflare en `index.html`
- [x] S-09: Eliminar CI job de Cloudflare Pages
- [x] S-10: Eliminar `.wrangler` de eslint ignores

## B-01..05 — Build

- [x] B-01: Verificar versión de Vite (8.1 estable)
- [x] B-02: Eliminar `bun.lock` y `bun.lockb`
- [x] B-03: Remover `rollupOptions.external` para Sentry + PostHog
- [x] B-04: Agregar deploy de Vercel en CI
- [x] B-05: Verificar `npm install` limpio con lockfile único

## D-01..15 — Documentación

- [x] D-01: Actualizar `docs/RUNBOOK.md` — reemplazar wrangler por Vercel
- [x] D-02: Actualizar `docs/HARDENING-ROADMAP.md` — Cloudflare → Vercel
- [x] D-03: Actualizar `docs/rdm-operational-hardening-manual.md` — sección P0-03
- [x] D-04: Actualizar `.github/workflows/security.yml` — comentario wrangler
- [x] D-05: Crear `docs/ANALYSIS.md`
- [x] D-06: Crear `docs/CHECKLIST.md`
- [x] D-07: Crear `docs/ROADMAP.md`
- [ ] D-08: Documentar proceso de deploy Vercel
- [ ] D-09: Documentar secrets requeridos en Vercel
- [x] D-10: Revisar `docs/ARCHITECTURE.md` por referencias a Cloudflare
- [ ] D-11: Documentar Edge Functions y sus variables de entorno
- [ ] D-12: Documentar CSP actual y proceso de actualización
- [ ] D-13: Documentar guía de onboarding para nuevos devs
- [ ] D-14: Enlazar desde README a los nuevos docs
- [ ] D-15: Revisar y limpiar dependencias documentadas obsoletas

## H-01..07 — Hardening

- [x] H-01: Agregar script `postinstall` que verifica lockfile único
- [x] H-02: Revisar rutas Isabella en `src/app/api/` que usan `"anonymous"` — Edge Functions migradas a 401 estricto
- [x] H-03: Rate limiting en Edge Functions públicas — `_shared/rate-limit.ts` con soporte multi-key (IP, user, categoría)
- [ ] H-04: Health check post-deploy en CI
- [ ] H-05: Verificación de artefacto build en CI
- [ ] H-06: Migrar CSP dinámica por entorno
- [ ] H-07: Evaluar alternativa a Turnstile
