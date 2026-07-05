# CHECKLIST-PENDIENTE.md — RDM Digital Hub

## Estado: Producción Activa

Legend:
- [ ] Pendiente
- [x] Completado
- [AI COMPLETE] Completado por IA

---

## P0 — Crítico (deploy-blocking)

- [x] **P0-01** — Fix Vercel Edge Function deployment: create `api/cron/health-check` with `_shared/cors.ts` and `_shared/rate-limit.ts`
- [x] **P0-02** — Create `api/_shared/stripe.ts` for Stripe webhook signature verification
- [x] **P0-03** — Create `api/cron/stripe-webhook.ts` edge function
- [AI COMPLETE] **P0-04** — Isabella Voice Engine: TTS queue with correct semantics (clip stays in queue until `onend`)

## P1 — Alto (funcionalidad core)

- [AI COMPLETE] **P1-01** — RDM Quest Gamification system: page, leaderboard, tiers, quests, profile
- [AI COMPLETE] **P1-02** — RDM Ecos Música: full audio player, visualizer, crónicas sonoras, mecenas system
- [AI COMPLETE] **P1-03** — Upgrade CinematicIntro to "Nodo Cero" immersive Three.js intro
- [AI COMPLETE] **P1-04** — Dashboard: integrate real gamification data from Supabase
- [AI COMPLETE] **P1-05** — Supabase migration: gamification quests/rewards, music cronicles, listening sessions, donations, mecenas

## P2 — Medio (experiencia)

- [AI COMPLETE] **P2-01** — RLS policies for all new tables (gamification, music, donations)
- [AI COMPLETE] **P2-02** — Seed data: starter gamification quests (RDM-001 through RDM-007)
- [x] **P2-03** — Auth flow: email/password + Google OAuth via Lovable
- [x] **P2-04** — Navigation: mega-menu with 23 routes
- [x] **P2-05** — Design system: sovereign editorial theme (Tailwind v4)

## P3 — Bajo (contenido y SEO)

- [x] **P3-01** — All 26 page routes created and wired
- [x] **P3-02** — Static content: timeline, dishes, adventures, routes, events
- [x] **P3-03** — SEO meta tags on all routes
- [x] **P3-04** — Footer with ORCID/DOI credentials

## P4 — Futuro (mejoras pendientes)

- [ ] **P4-01** — Connect Realito chatbot to Gemini 2.0 Flash API
- [ ] **P4-02** — Stripe checkout integration for memberships
- [ ] **P4-03** - Tourism places CRUD (admin upload)
- [ ] **P4-04** — Community posts CRUD
- [ ] **P4-05** — Store products with cart and checkout
- [ ] **P4-06** — Place reviews with ratings
- [ ] **P4-07** — Forum topics and replies
- [ ] **P4-08** — Photo gallery uploads
- [ ] **P4-09** — Music tracks admin upload panel
- [ ] **P4-10** — Real-time listening sessions (WebSocket)
- [ ] **P4-11** — Audio spatial 3D (Web Audio API)
- [ ] **P4-12** — Construct 3 game integration (RDM Match)
- [ ] **P4-13** — Vercel Analytics integration
- [ ] **P4-14** — Playwright E2E tests

---

## AI Review Log

| Date | Action | Scope |
|------|--------|-------|
| 2026-07-04 | Created api/ edge functions (health-check, stripe-webhook, _shared helpers) | P0 |
| 2026-07-04 | Created Isabella Voice Engine hook with proper queue semantics | P0 |
| 2026-07-04 | Created RDM Quest Gamification page + hooks | P1 |
| 2026-07-04 | Created RDM Ecos Música full page with player + visualizer | P1 |
| 2026-07-04 | Upgraded CinematicIntro to "Nodo Cero" immersive intro | P1 |
| 2026-07-04 | Updated Dashboard with gamification data | P1 |
| 2026-07-04 | Created Supabase migration for extended tables | P1 |
| 2026-07-04 | Created ARCHITECTURE.md and CHECKLIST-PENDIENTE.md | P3 |
