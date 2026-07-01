# Checklist de Pendientes — RDM Digital Hub

> Estado actualizado al último commit `cf9b966`. RES Vercel: ~84 → target 95+.

---

## 🔴 P0 — Seguridad Crítica (bloquea producción)

- [ ] **P0-01** `supabase/functions/isabella-ai/index.ts`: cambiar `GOOGLE_GENAI_API_KEY` → `GEMINI_API_KEY` (`:63`)
- [ ] **P0-02** `supabase/functions/isabella-ai/index.ts`: eliminar fallback `userId = "anonymous"` — rechazar con 401 si `getUser()` falla (`:41-51`)
- [ ] **P0-03** `supabase/functions/isabella-ai/index.ts`: agregar origin allowlist en CORS (hoy usa `*`)
- [ ] **P0-04** `supabase/functions/realito-chat/index.ts`: mismos 3 fixes que P0-01/02/03 (gemela de isabella-ai)
- [ ] **P0-05** `.env.example`: actualizar comentario `GOOGLE_GENAI_API_KEY` → `GEMINI_API_KEY` (`:25`)
- [ ] **P0-06** `supabase/functions/_shared/stripe.ts`: crear helper compartido con `verifyStripeEvent` + `alreadyProcessed` + `safeError` (patch 03)
- [ ] **P0-07** `supabase/migrations/20260701000000_stripe_events_idempotency.sql`: crear migración para tabla `stripe_events` (patch 03)

---

## 🟠 P1 — Infraestructura y Build

- [ ] **P1-01** `package.json`: anclar `"vite": "^7.0.0"` (hoy `^8.1.0` — versión inexistente estable)
- [ ] **P1-02** `package-lock.json`: eliminar si se migra a bun, o decidir gestor único
- [ ] **P1-03** `vercel.json`: cambiar `"installCommand": "npm install --legacy-peer-deps"` → `"bun install --frozen-lockfile"` (patch 02)
- [ ] **P1-04** `scripts/audit-rls.sql`: crear script de auditoría RLS (patch 04)
- [ ] **P1-05** `.github/workflows/rls-audit.yml`: crear workflow CI para RLS gate (patch 04)

---

## 🟡 P2 — Performance (RES 84 → 95+)

### Sprint 1 — Alto impacto ✅ (implementado en `3e4dcab`)
- [x] lazy() overlays en App.tsx (7 componentes, ~126KB gz menos)
- [x] CinematicIntro solo en landing page `/`
- [x] SpeedInsights + Analytics diferidos a requestIdleCallback
- [x] Google Fonts reducido de 7 a 5 pesos, fetchpriority=high

### Sprint 2 — Impacto medio
- [ ] **P2-01** `fetchpriority="high"` + `loading="eager"` + `width/height` en hero image de `Index.tsx` (LCP candidate)
- [ ] **P2-02** modulepreload para chunks críticos en `index.html` (react, router, radix, motion)
- [ ] **P2-03** lazy() Leaflet en `pages/Mapa.tsx` y `pages/MapaVivo.tsx` (~250KB diferido)
- [ ] **P2-04** lazy() Three.js en `components/map/Map3DTwin.tsx` (~600KB diferido)

### Sprint 3 — Assets
- [ ] **P2-05** Convertir imágenes a WebP con `npx sharp`
- [ ] **P2-06** Agregar srcset en `ImageGallery.tsx` y hero de `Index.tsx`
- [ ] **P2-07** Auditar con `vite-bundle-visualizer` y eliminar código muerto

---

## 🔵 P3 — Features y Contenido

- [ ] **P3-01** Login/Signup — configurar Supabase Dashboard (redirect URLs, email confirmations OFF)
- [ ] **P3-02** Configurar `GEMINI_API_KEY` como secreto en Supabase Edge Functions
- [ ] **P3-03** Configurar `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` en Supabase
- [ ] **P3-04** Deploy edge functions a Supabase (`supabase functions deploy`)
- [ ] **P3-05** Verificar build con Node.js/Vercel (cuando esté disponible)
- [ ] **P3-06** IsabellaChat integrado con JWT + useIsabellaVoice (verificar funcionamiento)

---

## ⚪ P4 — Deuda Técnica

- [ ] **P4-01** Activar `strict: true` incremental en TypeScript (~2 archivos con @ts-nocheck)
- [ ] **P4-02** Rate limit por-IP en las 19 edge functions restantes
- [ ] **P4-03** Fragmentar README de ~760 líneas en `docs/`
- [ ] **P4-04** Tests E2E para flujo auth + checkout + Isabella AI
- [ ] **P4-05** Reemplazar fotos mock (picsum.photos) con assets reales
- [ ] **P4-06** Cobertura de tests >80%

---

## Leyenda

| Color | Prioridad | Impacto |
|-------|-----------|---------|
| 🔴 P0 | Crítica | Bloquea seguridad o pagos |
| 🟠 P1 | Alta | Bloquea build/CI estable |
| 🟡 P2 | Media | Performance y UX |
| 🔵 P3 | Normal | Features pendientes |
| ⚪ P4 | Baja | Deuda técnica |
