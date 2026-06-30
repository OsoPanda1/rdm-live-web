# Real del Monte Digital Hub

**Plataforma Territorial Inteligente — Gemelo Digital Soberano de Real del Monte, Hidalgo, México**

[www.visitarealdelmonte.online](https://www.visitarealdelmonte.online)

---

## Índice

1. [¿Qué es?](#1-qué-es)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Catálogo de Páginas](#4-catálogo-de-páginas)
5. [Componentes UI](#5-componentes-ui)
6. [Módulos Funcionales](#6-módulos-funcionales)
7. [Supabase: Base de Datos](#7-supabase-base-de-datos)
8. [Supabase: Edge Functions](#8-supabase-edge-functions)
9. [Seguridad](#9-seguridad)
10. [Despliegue en Vercel](#10-despliegue-en-vercel)
11. [Variables de Entorno](#11-variables-de-entorno)
12. [Scripts](#12-scripts)
13. [Roadmap](#13-roadmap)

---

## 1. ¿Qué es?

Real del Monte Digital Hub es un **Sistema Operativo Territorial (LTOS)** de código abierto que unifica el patrimonio cultural, turístico, económico y social de Real del Monte en una plataforma digital viva.

### Funcionalidades principales

| Área | Descripción |
|------|-------------|
| **Portal turístico** | Rutas, lugares, gastronomía, mapa interactivo, eventos |
| **Directorio comercial** | Comercios, registro, checkout, membresías, suscripciones premium |
| **Archivo sonoro** | Música regional con donaciones vía Stripe |
| **Isabella AI** | Concierge digital con 10 capas de conciencia y ética federada |
| **Gobernanza digital** | Documentación cívica, wiki semántica, reglamentos |
| **Gemelo territorial** | Datos de afluencia, clima, sensores IoT, geocercas |
| **Gamificación** | Trivia, memoria, minería de puntos RDM, leaderboard |
| **Dashboard admin** | Gestión de contenido, telemetría, health checks |
| **Conectividad** | Red social interna, comentarios, community posts |
| **E-commerce** | Stripe checkout, membresías premium, donaciones |

---

## 2. Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 18 + TypeScript, Vite 8, Tailwind CSS 3, shadcn/ui |
| **Animación** | Framer Motion 12, Three.js / React Three Fiber |
| **Mapas** | Leaflet + React Leaflet, Supercluster |
| **Estado** | @tanstack/react-query, React Context |
| **Formularios** | react-hook-form + Zod |
| **BaaS / DB** | Supabase (PostgreSQL 14 + PostGIS, Auth, RLS, Edge Functions) |
| **IA** | Google Gemini API vía Edge Functions |
| **Pagos** | Stripe (checkout, webhooks, customer portal) |
| **Observabilidad** | Sentry (errores), PostHog (analytics + feature flags) |
| **CD/CI** | GitHub Actions (lint → typecheck → test → build → deploy) |
| **Hosting** | Vercel (Edge Network, CDN, preview deploys, analytics) |
| **Service Worker** | Cache-first assets, network-first API, offline fallback |

### Dependencias críticas

- **Vercel** — hosting y CDN del frontend SPA
- **Supabase** — PostgreSQL, autenticación, edge functions, storage
- **Stripe** — pagos online (donaciones música, membresías premium)
- **Gemini API** — backend de Isabella AI
- **Sentry** — error tracking en producción
- **PostHog** — analytics y feature flags

---

## 3. Estructura del Proyecto

```
/
├── src/                         ← Código fuente principal
│   ├── pages/                   ← 110+ páginas (rutas)
│   ├── components/              ← 150+ componentes React
│   │   ├── ui/                  ← shadcn/ui primitives (40+)
│   │   ├── layout/              ← Layout, navbar, footer
│   │   ├── map/                 ← Mapas (Leaflet, 3D)
│   │   ├── isabella/            ← Componentes de Isabella AI
│   │   ├── rdm/                 ← Componentes territoriales RDM
│   │   ├── business/            ← Directorio comercial
│   │   ├── music/               ← Reproductor de música
│   │   ├── home/                ← Home page components
│   │   └── ...                  ← atlas, transport, metaverse, admin
│   ├── hooks/                   ← 15 custom hooks
│   ├── lib/                     ← Utilidades, APIs, kernels
│   ├── modules/                 ← Módulos funcionales (map, music, games...)
│   ├── security/                ← Criptografía PQC, seguridad
│   ├── contexts/                ← React Contexts (Auth, Audio, Visual)
│   ├── integrations/            ← Supabase, Sentry, PostHog
│   ├── types/                   ← TypeScript types
│   └── assets/                  ← Imágenes, audio (MP3)
│
├── supabase/                    ← Configuración Supabase
│   ├── functions/               ← 19 Edge Functions (Deno)
│   ├── migrations/              ← 14 migraciones SQL
│   ├── config.toml              ← Config Supabase
│   └── seed.sql                 ← Datos de semilla
│
├── public/                      ← Archivos estáticos
│   ├── sw.js                    ← Service Worker (PWA)
│   ├── manifest.json            ← PWA manifest
│   ├── sitemap.xml              ← SEO sitemap
│   └── robots.txt               ← Crawling rules
│
├── server/                      ← Backend Express (independiente)
│   └── src/                     ← 72 archivos (rutas, servicios, middleware)
│
├── .github/workflows/           ← CI/CD
│   ├── ci.yml                   ← CI principal (lint, test, build, deploy Vercel)
│   └── security.yml             ← Seguridad (Gitleaks, TruffleHog, CodeQL)
│
├── e2e/                         ← Tests E2E (Playwright)
├── tests/                       ← Tests de integración
├── docs/                        ← Documentación
└── tools/                       ← Scripts auxiliares
```

---

## 4. Catálogo de Páginas

### 4.1. Portal Turístico

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | Index | Home con CinematicIntro, vitrina territorial |
| `/historia` | Historia | Historia de Real del Monte (901 líneas) |
| `/lugares` | Lugares | Directorio de lugares turísticos |
| `/rutas` | Rutas | 6 rutas turísticas detalladas |
| `/mapa` | Mapa | Mapa interactivo con 2D/3D twin |
| `/mapa-vivo` | MapaVivo | Mapa exploración fog-of-war |
| `/gastronomia` | Gastronomia | Guía gastronómica |
| `/eventos` | Eventos | Calendario de eventos culturales |
| `/mina` | Mina | Historia minera interactiva |
| `/ecoturismo` | Ecoturismo | Actividades eco-turísticas |
| `/shuttle` | ShuttleCDMX | Transporte CDMX → Real del Monte |
| `/transporte-local` | TransporteLocal | Transporte interno |
| `/recorridos` | Recorridos | Tours guiados |
| `/ruta-del-paste` | RutaDelPaste | Ruta gastronómica del paste |

### 4.2. Cultura y Patrimonio

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/cultura` | Cultura | Portal cultural |
| `/atlas` | Atlas | Atlas territorial interactivo |
| `/atlas/calles` | AtlasCalles | Calles históricas |
| `/atlas/capitulos` | AtlasCapitulos | Capítulos del atlas |
| `/atlas/cementerio` | AtlasCementerio | Panteón Inglés |
| `/atlas/keyendas` | AtlasLeyendas | Leyendas locales |
| `/atlas/maximus` | AtlasMaximus | Atlas máximo |
| `/atlas/minas` | AtlasMinas | Minas históricas |
| `/atlas/pastes` | AtlasPastes | Historia del paste |
| `/arte` | Arte | Galería de arte local |
| `/dichos` | Dichos | Dichos y refranes populares |
| `/mitos` | Mitos | Mitología local |
| `/relatos` | Relatos | Relatos históricos |
| `/patrimonio` | PatrimonioCultural | Patrimonio cultural |
| `/enciclopedia` | EnciclopediaUniversal | Enciclopedia digital |

### 4.3. Comercio y Economía

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/comercios` | Comercios | Directorio de comercios |
| `/comercios/checkout` | ComerciosCheckout | Checkout de compras |
| `/comercios/panel` | ComerciosPanel | Panel del comerciante |
| `/comercios/registro` | ComerciosRegistro | Registro de comercio |
| `/catalogo` | Catalogo | Catálogo de productos |
| `/membresias` | Membresias | Membresías premium |
| `/membership` | Membership | Detalle de membresía |
| `/economia` | EconomiaFederada | Economía federada |
| `/b2b` | B2BPortal | Portal B2B |
| `/negocios` | NegociosPortal | Portal de negocios |

### 4.4. Isabella AI

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/isabella` | IsabellaAI | Chat con Isabella AI |
| `/realito` | RealitoAI | Realito AI chat |
| `/ia-agentes` | IAAgentes | Agentes IA |
| `/tamv-hub` | TAMVHub | Hub TAMV |
| `/tamv-thesis` | TAMVThesis | Tesis TAMV |
| `/tamv-status` | TAMVStatus | Estado TAMV |
| `/api-explorer` | TAMVApiExplorer | Explorador de API |

### 4.5. Gobernanza y Documentación

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/documentacion` | Documentacion | Centro de documentación |
| `/gobernanza` | Gobernanza | Portal de gobernanza |
| `/wiki` | Wiki | Wiki semántica |
| `/wiki-tamv` | WikiTAMV | Wiki TAMV |
| `/filosofia` | Filosofia | Filosofía del proyecto |
| `/reglamento` | Reglamento | Reglamento |
| `/casos-de-uso` | CasosDeUso | Casos de uso |
| `/manuales` | Manuales | Manuales técnicos |
| `/despliegue` | Despliegue | Documentación de despliegue |
| `/arquitectura` | Arquitectura | Arquitectura del sistema |
| `/ecosistema` | EcosistemaLTOS | Ecosistema LTOS |
| `/introduccion` | Introduccion | Introducción al proyecto |

### 4.6. Comunidad y Social

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/comunidad` | Comunidad | Centro comunitario |
| `/feed` | Feed | Red social interna |
| `/perfil` | Perfil | Perfil de usuario |
| `/leaderboard` | Leaderboard | Tabla de líderes |
| `/donar` | Donar | Donaciones |
| `/apoya` | Apoya | Apoyo al proyecto |

### 4.7. Juegos y Gamificación

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/juegos` | Juegos | Portal de juegos |
| `/games` | GamePortal | Portal de juegos (alternativo) |
| `/trivia` | Trivia (en Juegos) | Trivia territorial |
| `/blockchain` | BlockchainMSR | Minería blockchain MSR |

### 4.8. Música

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/musica` | Musica | Archivo sonoro |
| `/music` | Music | Portal de música |
| `/archivo-sonoro` | ArchivoSonoro | Archivo sonoro con donaciones |
| `/music-detail` | MusicDetail | Detalle de canción |

### 4.9. Administración

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/admin` | Admin | Panel de administración |
| `/dashboard` | Dashboard | Dashboard general |
| `/admin/dashboard` | admin/Dashboard | Dashboard admin |
| `/operativo` | Operativo | Panel operativo |
| `/territorial` | TerritorialDashboard | Dashboard territorial |
| `/control` | ControlCenter | Centro de control |
| `/guardian` | Guardian | Panel del guardian |

### 4.10. Autenticación

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/auth` | Auth | Login/Signup con Google OAuth |
| `/login` | Login | Login |
| `/register` | Register | Registro |
| `/*` | NotFound | 404 |

---

## 5. Componentes UI

La carpeta `src/components/` contiene **150+ componentes** agrupados en 17 categorías:

| Directorio | Componentes | Propósito |
|-----------|-------------|-----------|
| `ui/` | 40+ (Button, Card, Dialog, Input, Select, etc.) | shadcn/ui primitives |
| `layout/` | Navbar, Footer, Sidebar, MobileNav | Layout base |
| `home/` | CinematicIntro, HeroSection, Features | Home page |
| `map/` | MapView, TwinNodeVisualizer, Heatmap | Mapas 2D/3D |
| `isabella/` | ChatBubble, IsabellaOrb, ThoughtStream | Isabella AI UI |
| `rdm/` | RDMLayout, TerritorialStats | Marca RDM |
| `business/` | BusinessCard, CommerceList | Directorio comercial |
| `music/` | Player, Playlist, TrackCard | Reproductor musical |
| `atlas/` | AtlasView, LayerPanel | Atlas territorial |
| `transport/` | ShuttleTimeline, RouteMap | Transporte |
| `community/` | PostCard, CommentSection | Red social |
| `metaverse/` | MetaverseScene, 3DGlobe | Experiencias 3D |
| `admin/` | AdminPanel, MetricsChart | Dashboard admin |
| `modules/` | ModuleCard, FederationStatus | Módulos del sistema |
| `packages/` | PackageCard | Paquetes turísticos |
| `operations/` | HealthMonitor, AlertPanel | Operaciones |
| `territorial/` | GeoFenceView, SensorPanel | Datos territoriales |

---

## 6. Módulos Funcionales

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| **Music** | `src/modules/music/` | Reproductor, hooks useMusicPlayer, data/playlist |
| **Map** | `src/modules/map/` | Leaflet integration, markers, clustering |
| **Games** | `src/modules/games/` | Trivia, Memory Game |
| **Dashboard** | `src/modules/dashboard/` | CEO dashboard, telemetry, health, KPI |
| **Core** | `src/modules/core/` | Layout core del sistema |
| **Control** | `src/modules/control/` | Panel de control |
| **Nexo Estelar** | `src/modules/nexoEstelar/` | Navegación celestial |
| **Interfaz Sensorial** | `src/modules/interfazSensorial/` | Efectos sensoriales UI |
| **Constelación** | `src/modules/constelacionInteractiva/` | Navegación constelación |
| **Documentation** | `src/modules/documentation/` | Sistema wiki |
| **Oraculo Tecnologico** | `src/modules/oraculoTecnologico/` | Formularios auth, efectos |
| **Tracking** | `src/modules/tracking/` | Visitor tracking |
| **Paste Route** | `src/modules/paste-route/` | SVG paste route map |

### Custom Hooks

| Hook | Archivo | Función |
|------|---------|---------|
| `useAuth` | `src/hooks/useAuth.tsx` | Autenticación Supabase + Lovable bridge |
| `useApi` | `src/hooks/useApi.ts` | Fetch wrapper con errores |
| `useWebSocket` | `src/hooks/useWebSocket.ts` | WebSocket manager |
| `useWeather` | `src/hooks/useWeather.ts` | Clima de Real del Monte |
| `useUserRole` | `src/hooks/useUserRole.ts` | RBAC (admin/operador/lector) |
| `useTimeTheme` | `src/hooks/useTimeTheme.ts` | UI theming por hora |
| `useSystemMode` | `src/hooks/useSystemMode.ts` | Modos NORMAL/SAFE/EMERGENCY |
| `usePaginated` | `src/hooks/usePaginated.ts` | Paginación genérica |
| `useMapSync` | `src/hooks/useMapSync.tsx` | Sincronización 2D/3D mapa |
| `useIsabellaSSE` | `src/hooks/useIsabellaSSE.ts` | Server-Sent Events Isabella |
| `useIsabella` | `src/hooks/useIsabella.ts` | Chat streaming IA |
| `useDemoMode` | `src/hooks/useDemoMode.ts` | Offline/demo fallback |
| `useCivicEvent` | `src/hooks/useCivicEvent.ts` | Gestión de eventos cívicos |
| `useMusicPlayer` | `src/modules/music/hooks/useMusicPlayer.ts` | Reproductor musical |

---

## 7. Supabase: Base de Datos

### Tablas (35+)

| Tabla | Propósito |
|-------|-----------|
| `profiles` | Perfiles de usuario (auth.uid vinculado) |
| `user_roles` | Roles RBAC (admin, operator, lector) |
| `businesses` | Directorio de comercios |
| `commerce_subscriptions` | Suscripciones premium de comercios |
| `subscriptions_premium` | Membresías premium de usuarios |
| `events` | Eventos culturales |
| `places` | Puntos de interés turístico |
| `music_tracks` | Canciones del archivo sonoro |
| `music_donations` | Donaciones a artistas |
| `music_donation_intents` | Intenciones de donación (Stripe) |
| `music_plays` | Reproducciones registradas |
| `tour_packages` | Paquetes turísticos |
| `tour_bookings` | Reservas de tours |
| `tour_guides` | Guías turísticos |
| `tour_availability` | Disponibilidad de tours |
| `wiki_articles` | Artículos wiki |
| `community_posts` | Posts de la red social |
| `community_comments` | Comentarios en posts |
| `post_likes` | Likes en posts |
| `trivia_questions` | Preguntas de trivia |
| `mining_nodes` | Nodos de minería blockchain MSR |
| `mining_sessions` | Sesiones de minería |
| `rewards` | Recompensas del sistema |
| `reward_redemptions` | Canjes de recompensas |
| `tracking_events` | Eventos de tracking |
| `foot_traffic` | Datos de afluencia peatonal |
| `paste_pois` | Puntos de interés de paste |
| `paste_ratings` | Calificaciones de paste |
| `federation_health_log` | Health checks federación |
| `federation_thresholds` | Umbrales de federación |
| `system_alerts` | Alertas del sistema |
| `territorial_metrics` | Métricas territoriales |
| `audit_log` | Auditoría de acciones |
| `dt_layers` | Capas del gemelo digital |
| `dt_layer_items` | Items de capas del gemelo |

---

## 8. Supabase: Edge Functions

19 funciones serverless en Deno:

| Función | Ruta | Propósito |
|---------|------|-----------|
| `isabella-ai` | `supabase/functions/isabella-ai/` | Chat con Isabella AI (Gemini API) |
| `isabella-ontology` | `supabase/functions/isabella-ontology/` | Ontología semántica |
| `realito-chat` | `supabase/functions/realito-chat/` | Realito AI chat |
| `stripe-webhook` | `supabase/functions/stripe-webhook/` | Webhooks de Stripe |
| `create-commerce-checkout` | `supabase/functions/create-commerce-checkout/` | Checkout de comercios |
| `create-premium-checkout` | `supabase/functions/create-premium-checkout/` | Checkout premium |
| `create-merchant-payment` | `supabase/functions/create-merchant-payment/` | Pago a comerciantes |
| `merchant-payment-webhook` | `supabase/functions/merchant-payment-webhook/` | Webhook pagos comerciantes |
| `create-music-donation` | `supabase/functions/create-music-donation/` | Donación música (Stripe) |
| `customer-portal` | `supabase/functions/customer-portal/` | Portal de cliente Stripe |
| `check-subscription` | `supabase/functions/check-subscription/` | Verificar suscripción |
| `rdm-membership-activate` | `supabase/functions/rdm-membership-activate/` | Activar membresía RDM |
| `rdm-redeem` | `supabase/functions/rdm-redeem/` | Canje de puntos RDM |
| `rdm-mine` | `supabase/functions/rdm-mine/` | Minería de puntos RDM |
| `award-points` | `supabase/functions/award-points/` | Otorgar puntos |
| `metrics-aggregates` | `supabase/functions/metrics-aggregates/` | Agregación de métricas |
| `federation-health` | `supabase/functions/federation-health/` | Health check federación |
| `alerts-engine` | `supabase/functions/alerts-engine/` | Motor de alertas |
| `ingest-event` | `supabase/functions/ingest-event/` | Ingesta de eventos |

---

## 9. Seguridad

### Capas de seguridad implementadas

| Componente | Archivo | Función |
|-----------|---------|---------|
| Criptografía PQC | `src/security/PostQuantumCrypto.ts` | Kyber KEM + Dilithium + AES-256-GCM (Web Crypto API) |
| Aislamiento de contexto | `src/security/ContextIsolation.ts` | Sandbox seguro para ejecución federada |
| Blockchain connector | `src/security/BlockchainConnector.ts` | Polygon/MSR anchoring |
| Redes externas | `src/security/ExternalNetworksConnector.ts` | Tor-aware, RFC-averse networking |
| Validación de inputs | `src/security/InputValidation.ts` | Zod sanitization (SQLi, XSS, command injection) |
| Protocolo de apagado | `src/security/ShutdownProtocol.ts` | Graceful shutdown con integrity checkpoints |
| Autenticación | `src/hooks/useAuth.tsx` | Supabase Auth + JWT + Google OAuth |
| RBAC | `src/hooks/useUserRole.ts` | Roles admin/operator/lector + auditoría |
| CSP | `vercel.json` | Content Security Policy estricta |
| HSTS | `vercel.json` | HTTP Strict Transport Security |
| CI/CD Security | `.github/workflows/security.yml` | Gitleaks, TruffleHog, CodeQL, npm audit |

---

## 10. Despliegue en Vercel

### 10.1. Pipeline de CI/CD

El proyecto usa **GitHub Actions** para CI y **Vercel** para deploy.

```
Push a main
  ↓
GitHub Actions: fast-checks (lint + typecheck)
  ↓
GitHub Actions: quality (unit tests + build en Node 20)
  ↓
GitHub Actions: e2e (Playwright, 2 shards)
  ↓
GitHub Actions: deploy-vercel (npm run build + vercel --prod)
  ↓
Vercel Edge Network: CDN + HTTPS + Runtime Node.js 24.x
```

### 10.2. Archivo vercel.json

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; ..." },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
      ]
    }
  ]
}
```

### 10.3. Despliegue manual

```bash
npm run build          # Build Vite
vercel --prod          # Deploy a producción
```

### 10.4. Dominio

- **Producción:** `www.visitarealdelmonte.online` (DNS en Vercel)
- **Preview:** `https://real-del-monte-digital-hub-*.vercel.app` (automático por PR)

### 10.5. Entorno de producción (Vercel)

- Node.js Runtime: 24.x (configurado en vercel.json)
- Región: `iad1` (us-east-1)

---

## 11. Variables de Entorno

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxx

# Stripe (para Edge Functions)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# Isabella AI (Edge Functions)
GEMINI_API_KEY=AIzaxxxxxxxxxxxx

# Observabilidad
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.us.sentry.io/xxxxx
VITE_POSTHOG_KEY=phc_xxxxx
VITE_POSTHOG_HOST=https://us.i.posthog.com

# Vercel
VERCEL_TOKEN=  # GitHub Actions secret
VERCEL_ORG_ID=  # GitHub Actions secret
VERCEL_PROJECT_ID=  # GitHub Actions secret
```

---

## 12. Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Dev server (Vite, port 8080) |
| `npm run build` | Build producción (Vite) |
| `npm run preview` | Preview del build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check (tsc --noEmit) |
| `npm test` | Vitest unit tests |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:coverage` | Vitest con cobertura |
| `npm run e2e` | Playwright E2E tests |
| `npm run e2e:ui` | Playwright UI mode |

---

## 13. Roadmap

### ✅ COMPLETADO — Fase 0-4
- [x] Kernel MD-X5 (Receive→Evaluate→Plan→Execute→Commit→Reconcile)
- [x] TIME UP Governance (10 políticas, ledger SHA-256)
- [x] Isabella AI (10 capas de conciencia, corazón, memoria)
- [x] Heptafederación F1-F7 (FederationBus, health checks)
- [x] Pipeline Hexagonal de Conciencia (Double Pipeline)
- [x] Sistema Territorial (DataCollector, Geofencer, 6 zonas)
- [x] Sistema Unificado GEN-8.0 (EventBus, Supervisor, Persistence, SDK)
- [x] Seguridad Post-Cuántica (Web Crypto API: AES-GCM, HMAC SHA-512)
- [x] Supabase: 14 migraciones SQL, 35+ tablas, RLS, PostGIS
- [x] 19 Edge Functions (Stripe, Isabella, métricas, federación)
- [x] Vercel deploy con CSP + HSTS
- [x] PWA: Service Worker, manifest, offline fallback
- [x] SEO: sitemap.xml, Open Graph, Schema.org JSON-LD
- [x] CI/CD: GitHub Actions → Vercel
- [x] 0 errores ESLint, 0 errores TypeScript
- [x] Limpieza total: Cloudflare eliminado, dead code purgado

### 🔷 EN PROGRESO
- [ ] CATTLEYA + Stripe: monetización, membresías, economía digital
- [ ] SSI Identity Verification real
- [ ] Cobertura de tests >80%
- [ ] Reducir deuda técnica: 54 archivos con `@ts-nocheck` → tipado completo
- [ ] Reemplazar fotos mock (picsum.photos) con assets reales del territorio
- [ ] Certificación PQC formal

### 🔵 FUTURO
- [ ] Dashboard federado público
- [ ] App móvil nativa (React Native)
- [ ] Mesh networking LoRa/Meshtastic
- [ ] Gemelo digital en tiempo real con datos IoT (MQTT)

---

## Licencia

**© 2024-2026 TAMV Ecosystem · OsoPanda1 · Isabella Villaseñor AI**

Código abierto para usos comunitarios, académicos y de investigación.
Soberanía de datos garantizada por Heptafederación F1-F7 y SSI.
Gobernanza ética por TIME UP con registro inmutable en ledger SHA-256.

**Dominio:** [www.visitarealdelmonte.online](https://www.visitarealdelmonte.online)
**GitHub:** [github.com/OsoPanda1/real-del-monte-digital-hub-c327091a](https://github.com/OsoPanda1/real-del-monte-digital-hub-c327091a)
