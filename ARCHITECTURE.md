# ARCHITECTURE.md — RDM Digital Hub LTOS

## Overview

RDM Digital Hub is a **Sovereign Territorial Operating System (LDTOCS)** for Real del Monte, Hidalgo, Mexico. It is a monorepo containing a TanStack Start frontend, Supabase backend (auth, database, edge functions), and Vercel deployment.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | TanStack Start (SSR, file-based routing) |
| **UI** | React 19, shadcn/ui, Tailwind CSS v4, Framer Motion |
| **Data** | Supabase (PostgreSQL, Auth, Edge Functions, Storage) |
| **Build** | Vite 7, TypeScript 5.8, Nitro |
| **Deploy** | Vercel (Edge Functions for API routes) |
| **State** | TanStack React Query + React hooks |

## Directory Structure

```
├── api/                          # Vercel Edge Functions
│   ├── _shared/                  # Shared helpers (CORS, rate-limit, Stripe)
│   │   ├── cors.ts
│   │   ├── rate-limit.ts
│   │   └── stripe.ts
│   └── cron/
│       ├── health-check.ts       # LTOS health check endpoint
│       └── stripe-webhook.ts     # Stripe webhook handler
├── src/
│   ├── assets/                   # Static images
│   ├── components/
│   │   └── site/                 # Site components (Navbar, Footer, Intro, etc.)
│   ├── data/                     # Static content data
│   ├── hooks/                    # Custom hooks (gamification, voice engine, etc.)
│   ├── integrations/
│   │   └── supabase/             # Supabase client, auth, types
│   ├── lib/                      # Utilities, federation config, API functions
│   ├── routes/                   # TanStack Router file-based routes (27 pages)
│   ├── styles.css                # Tailwind v4 sovereign design system
│   ├── router.tsx                # Router configuration
│   ├── routeTree.gen.ts          # Auto-generated route tree
│   ├── server.ts                 # SSR server entry
│   └── start.ts                  # App bootstrap + middleware
├── supabase/
│   ├── functions/                # Supabase Edge Functions
│   └── migrations/               # Database migrations
├── package.json
├── tsconfig.json
├── vite.config.ts
└── eslint.config.js
```

## Heptafederación TAMV MD-X4

The system is organized into 7 federations (layers):

1. **ANUBIS** — Doctrine / Ontological Kernel
2. **MDD-TAMV** — Territory / Digital Twin
3. **BOOKPI** — Knowledge / Tomos & Corpus
4. **PHOENIX** — Commerce / Renaissance Cycle
5. **KAOS** — Creator Chaos / Sovereign Research
6. **CHRONOS** — Time / Civilization Timeline
7. **DEKATEOTL** — Divine Decimation / IPFS & Payments

## Database Tables (16+)

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (auto-created on signup) |
| `user_roles` | RBAC (admin/merchant/user) |
| `pending_role_grants` | Pre-granted roles by email |
| `tourism_places` | Tourism POIs |
| `place_reviews` | Reviews for tourism places |
| `community_posts` | Community forum posts |
| `community_photos` | Photo gallery |
| `forum_topics` / `forum_replies` | Forum threads |
| `merchant_profiles` | Business listings |
| `memberships` | Subscription records |
| `gamification_profiles` | User gamification (XP, level, badges) |
| `gamification_events` | Points/activity log |
| `gamification_quests` | Weekly challenges and milestones |
| `gamification_rewards` | Delivered rewards |
| `music_tracks` | Music catalog |
| `music_cronicles` | Sonic playlists (narrative) |
| `music_listening_sessions` | Listening events |
| `music_donations` | Mecenas donations |
| `music_mecenas` | Mecenas tier tracking |
| `store_products` / `store_orders` | E-commerce |
| `telemetry_pulses` | Federation telemetry |

## Security

- **RLS (Row Level Security)** on all tables
- **Auth middleware** via Supabase JWT verification
- **Rate limiting** on edge functions
- **CORS** restricted to allowed origins
- **SECURITY INVOKER** functions for role checking

## Key Routes

| Route | Description |
|-------|-------------|
| `/` | Hero + tourism-first landing |
| `/atlas` | SVG cartographic map with 7 federated nodes |
| `/auth` | Email/password + Google OAuth |
| `/rdm-quest` | Gamification: misiones, leaderboard, niveles |
| `/musica` | RDM Ecos Música: audio player, crónicas, mecenas |
| `/realito` | Realito AI chatbot |
| `/nodo-cero` | Manifesto page |
| `/dashboard` | User profile + gamification + federation |
| `/comercios` | Merchant directory |
| `/comunidad` | Community forum |
| `/federacion` | Heptafederation layers + telemetry |
| `/mapa-vivo` | Interactive fog-reveal map |
