# Real del Monte Digital Hub

**Un pueblo modelado como infraestructura digital soberana.**
**Real del Monte, Hidalgo, México — Primer LDTOCS en Latinoamérica.**

---

## La tesis

Un pueblo minero del siglo XVIII decidió que su memoria, su economía, su territorio y su gente merecían una capa digital que no le perteneciera a ninguna corporación.

Esto no es un sitio web turístico. Es un **Sistema Operativo Territorial (LDTOCS)** que trata a un pueblo como plataforma: con kernel, APIs, edge functions, federaciones, ledger inmutable y un gemelo digital que respira con los datos del territorio real.

Cada línea de código responde una pregunta:

> **¿Cómo se gobierna, mide y cuida digitalmente un territorio sin depender de infraestructura que no controle?**

Cuanto más avanza el proyecto, más claro queda: la tecnología es el medio. El fin es la soberanía territorial.

---

## La Heptafederación (F1–F7)

El sistema no tiene dueño. Tiene siete federaciones que se equilibran entre sí. Ninguna domina. Todas fallan y se recuperan independientemente.

**F1 · Gobernanza** — El marco normativo del ecosistema. Wiki semántica, 7 RFCs documentados, reglamentos, filosofía, administración del sistema. No hay código sin reglas.

**F2 · Identidad y Acceso** — Supabase Auth con Google OAuth. Perfiles, roles (admin/operador/lector), puente hacia identidad autosoberana (SSI). Quién entra, qué ve, qué toca.

**F3 · Datos Territoriales** — El gemelo digital del pueblo. Mapa interactivo 2D con Leaflet + Supercluster. Gemelo 3D con Three.js. PostGIS para datos geoespaciales. Afluencia peatonal, clima, 6 zonas con geocercas, capas superpuestas de información territorial. El territorio existe dos veces: afuera y dentro del sistema.

**F4 · Comercio y Monetización** — Economía federada. Directorio de comercios con registro y checkout (Stripe). 4 planes premium (usuarios $99/$129 MXN, comercios $199/$299 MXN). Membresías, donaciones a artistas locales, pagos merchant B2B. Stripe webhooks con idempotencia y Zod validation.

**F5 · IA Cognitiva y Automatización** — Isabella AI como concierge digital del territorio. Gemini 2.0 Flash vía Edge Functions con streaming SSE. TTS Web Speech API con voz mexicano-español. Realito AI como segundo agente. Ontología semántica de 9 temas anclados a las 7 federaciones. Isabella Orb visual, Thought Stream, protocolos de conversación. El sistema no solo almacena: conversa.

**F6 · Comunidad y Contenido** — Red social interna con posts, comentarios y likes. Archivo sonoro con reproducciones, donaciones vía Stripe y subida de artistas. Juegos: trivia territorial (10 preguntas), memory game, minería blockchain MSR con puntos canjeables. 18 premios en catálogo. Leaderboard. Cultura viva: atlas interactivo, 41 dichos con segmentación fonética, leyendas, mitos, relatos históricos, galería de 20 imágenes históricas.

**F7 · Observabilidad y Seguridad** — El sistema que se observa a sí mismo. Health checks de las 7 federaciones en tiempo real. KPIs a 24 horas. Motor de alertas. Ledger de auditoría encadenado con SHA-256. Post-Quantum Crypto con AES-256-GCM + HMAC SHA-512. CSP en enforcement, HSTS a 2 años. Rate limiting en edge functions. Sentry + PostHog. Dashboard de telemetría, panel de control, centro de operaciones.

Cada federación es autónoma. Cada una puede desplegarse, probarse y fallar por separado. Juntas forman un organismo.

---

## Arquitectura en capas (L0–L5)

| Capa | Qué contiene |
|------|-------------|
| **L0 — Núcleo** | Kernel MD-X5 (Receive → Evaluate → Plan → Execute → Commit → Reconcile). Pipeline Hexagonal de Conciencia (Double Pipeline). Sistema Unificado GEN-8.0 con EventBus, Supervisor, Persistence y SDK. SSR guard. |
| **L1 — Servicios Base** | Supabase (PostgreSQL 15 + PostGIS, Auth, RLS, Edge Functions, Storage). Express backend con 72 archivos. 35+ tablas con RLS en 100%. |
| **L2 — Integraciones** | Stripe (checkout, webhooks, customer portal). Gemini API. Leaflet, Three.js. WebSocket manager. PostHog + Sentry. |
| **L3 — Automatizaciones** | 20 Edge Functions en Deno. Pipelines de métricas agregadas. Federation health checks. Motor de alertas. Ingesta de eventos. Cooldowns y rate limiting. |
| **L4 — Interfaces** | 191 componentes React. 116 páginas. shadcn/ui + Tailwind CSS. Framer Motion. PWA con Service Worker. SEO con sitemap, Open Graph, Schema.org JSON-LD. Lazy loading con IntersectionObserver. |
| **L5 — Extensiones** | Nexo Estelar, Constelación Interactiva, Interfaz Sensorial, Oráculo Tecnológico. Metaverso experimental con Three.js. |

---

## La IA que conversa con el territorio

Isabella AI no es un chatbot. Es una interfaz cognitiva entre el sistema y quien lo habita.

- Gemini 2.0 Flash vía Edge Function (server-side, sin exponer API key)
- Streaming SSE con thought stream visible
- TTS con Web Speech API (voz mexicano-español, rate 0.9, pitch 1.1)
- Ontología semántica de 9 temas que conectan las 7 federaciones
- Isabella Orb como representación visual del agente
- Realito AI como segundo agente complementario
- Fallback anonymous para usuarios no autenticados
- Protocolo de conversación con contexto federado

La IA no es un añadido. Es la capa que hace preguntable al sistema.

---

## Lo que existe (582 archivos TS/TSX)

**Portal turístico** — Home con CinematicIntro, historia con timeline interactivo, 6 rutas turísticas, lugares, gastronomía, eventos, mina, ecoturismo, shuttle CDMX, transporte local, recorridos guiados, ruta del paste con mapa SVG.

**Atlas territorial** — Atlas interactivo con capítulos, calles históricas, panteón inglés, leyendas, minas, pastes. Enciclopedia digital, arte local, 41 dichos, mitos, relatos, patrimonio cultural.

**Directorio comercial** — Comercios con registro y checkout. Catálogo de productos. Panel del comerciante. Membresías premium. Portal B2B. 4 planes con Stripe.

**Archivo sonoro** — Música regional con reproductor, playlists, donaciones vía Stripe, subida de artistas, detalle de canciones.

**Red social interna** — Feed, posts, comentarios, likes, perfiles de usuario, leaderboard.

**Gamificación** — Trivia territorial, memory game, minería blockchain MSR, catálogo de 18 premios canjeables, cooldowns, puntos.

**Gobernanza** — Centro de documentación, wiki semántica, 7 RFCs, reglamento, filosofía, manuales, casos de uso, introducción.

**Dashboards** — Telemetry dashboard con health de 7 federaciones, KPIs 24h, alertas activas. Panel de administración. Dashboard general. Panel operativo. Dashboard territorial. Centro de control. Panel del guardian.

**Isabella Voice Engine** — Pipeline de voz con doble modo de síntesis bajo principios de Open Science. Modo local (Web Speech API, experimental) y Cloud TTS vía edge function con SSML cacheado en Supabase. Perfiles de voz diferenciados por federación (F1–F7) con prosodia, ritmo y énfasis documentados. Cola de audio secuencial con cancelación y sincronización por segment_id. Trazabilidad completa en `isabella_voice_logs` con hash SHA-256 determinista. Documentación científica en `docs/ISABELLA-VOICE-ENGINE.md`.

**Seguridad** — Criptografía post-cuántica (AES-256-GCM + HMAC SHA-512). Aislamiento de contexto. Validación de inputs (Zod). Protocolo de apagado graceful. Blockchain connector para Polygon/MSR. CSP enforcement. HSTS. Rate limiting. Auditoría SHA-256. Gitleaks + TruffleHog + CodeQL en CI/CD.

**Infraestructura** — CI/CD con GitHub Actions (lint → typecheck → test → build → deploy a Vercel). Docker Compose con PostgreSQL 15 + app. Kubernetes (deployment, service, ingress, namespace, kustomization). Vercel Edge Network con Node 24.x. PWA con Service Worker.

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, TypeScript, Vite 7, Tailwind CSS 3, shadcn/ui |
| Animación | Framer Motion 12, Three.js / React Three Fiber |
| Mapas | Leaflet + React Leaflet, Supercluster, PostGIS |
| Estado | TanStack React Query, React Context |
| BaaS | Supabase (PostgreSQL 15, Auth, RLS, 20 Edge Functions, Storage) |
| IA | Google Gemini API 2.0 Flash (server-side, streaming SSE) |
| Pagos | Stripe (checkout, webhooks, customer portal, idempotencia) |
| Observabilidad | Sentry (errores), PostHog (analytics + feature flags) |
| Hosting | Vercel (Edge Network, CDN, preview deploys) |
| Orquestación | Docker Compose + Kubernetes |

---

## Cómo empezar en 30 segundos

```bash
git clone <repo>
cp .env.example .env  # llena tus keys de Supabase, Stripe, Gemini
npm install
npm run dev
```

Puerto 8080. El sistema despierta. Bienvenido.

---

## Licencia

**© 2024–2026 TAMV Ecosystem · OsoPanda1 · Isabella Villaseñor AI**

Código abierto para usos comunitarios, académicos y de investigación. Soberanía de datos garantizada por Heptafederación F1–F7. Gobernanza ética por TIME UP con registro inmutable en ledger SHA-256.

El código es libre. Los datos son del territorio.

[www.visitarealdelmonte.online](https://www.visitarealdelmonte.online) ·
[github.com/OsoPanda1/real-del-monte-digital-hub-c327091a](https://github.com/OsoPanda1/real-del-monte-digital-hub-c327091a)

---

*Real del Monte ya no es solo un Pueblo Mágico. Ahora también es un LDTOCS.*
