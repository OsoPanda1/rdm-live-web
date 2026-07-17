# YUN Blueprint: Architecture Overview

> "The YUN architecture is a layered federation model where identity, knowledge, commerce, community, and governance operate as interconnected but independently deployable layers."

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                     GOVERNANCE LAYER                            │
│  (Policies, Compliance, Audit, Federation Coordination)         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  IDENTITY   │  │ KNOWLEDGE   │  │  COMMERCE   │            │
│  │    MESH     │  │   FABRIC    │  │   ENGINE    │            │
│  │             │  │             │  │             │            │
│  │ • Auth      │  │ • Wiki      │  │ • Products  │            │
│  │ • Profiles  │  │ • Events    │  │ • Orders    │            │
│  │ • Sessions  │  │ • Analytics │  │ • Payments  │            │
│  │ • Roles     │  │ • Gamific.  │  │ • Catalog   │            │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
│         │                │                │                     │
│         └────────────────┼────────────────┘                     │
│                          │                                      │
│                   ┌──────┴──────┐                               │
│                   │  COMMUNITY  │                               │
│                   │    PULSE    │                               │
│                   │             │                               │
│                   │ • Posts     │                               │
│                   │ • Comments  │                               │
│                   │ • Likes     │                               │
│                   │ • Notifs    │                               │
│                   └─────────────┘                               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                    FEDERATION COORDINATOR                       │
│  (Cross-layer routing, Health monitoring, Conflict resolution)  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer Descriptions

### 1. Identity Mesh

**Purpose:** Single source of truth for who users are, what they can do, and how they authenticate.

**Core Entities:** `profiles`, `sessions`, `communities` (membership)

**Responsibilities:**
- JWT issuance and validation (Supabase Auth)
- Role-based access control (RBAC) with federation-scoped permissions
- Session management with secure token refresh
- Multi-factor authentication enforcement for admin roles
- Profile lifecycle management (creation, update, deactivation)

**Data Flow:**
```
User Login → Supabase Auth → JWT issued → Identity Mesh validates on every request
                                              │
Profile Update → Identity Mesh → Supabase DB → Event emitted: identity.profile.updated
                                              │
                                              → Cascades to: Community Pulse (reputation)
                                                             Commerce Engine (trust score)
```

**Storage:** Supabase `profiles`, `sessions` tables with RLS policies.

---

### 2. Knowledge Fabric

**Purpose:** Collective intelligence layer—events, wiki content, analytics, and gamification that make the platform learn and grow.

**Core Entities:** `events`, `wiki_pages`, `wiki_edits`, `wiki_links`, `analytics_events`, `gamification_points`, `badges`, `leaderboards`

**Responsibilities:**
- Event ingestion from all federations (structured event streaming)
- Collaborative wiki content management with versioning
- Analytics pipeline for user behavior and system health
- Gamification engine (points, badges, leaderboards)
- Search indexing and retrieval (content discovery)

**Data Flow:**
```
Federation Activity → Event Standard (03-event-standard.md) → Knowledge Fabric
                                                               │
                                                               ├─→ Wiki: content stored, versioned
                                                               ├─→ Analytics: metrics aggregated
                                                               ├─→ Gamification: points awarded
                                                               └─→ Event Store: events persisted
                                                               │
Analytics Aggregation → Dashboard → Governance Layer (health reports)
```

**Storage:** Supabase tables for wiki, analytics, gamification. Edge cache for frequently accessed content.

---

### 3. Commerce Engine

**Purpose:** Transactional backbone—product catalog, orders, payments, and commercial workflows.

**Core Entities:** `businesses`, `products`, `categories`, `orders`

**Responsibilities:**
- Product catalog management with categories
- Order lifecycle (creation → payment → fulfillment → completion)
- Business verification and trust scoring
- Payment integration (Stripe via Supabase Edge Functions)
- Commercial analytics and reporting

**Data Flow:**
```
User browses products → Commerce Engine → Product catalog query (Edge-cached)
                                           │
User places order → Commerce Engine → Order created (status: pending)
                                      │
                                      ├─→ Payment intent created (Stripe)
                                      ├─→ Event emitted: commerce.order.created
                                      └─→ Identity Mesh: trust score updated
                                           │
Payment confirmed → Commerce Engine → Order status: confirmed
                                      │
                                      ├─→ Event emitted: commerce.order.confirmed
                                      ├─→ Notification sent (Community Pulse)
                                      └─→ Analytics recorded (Knowledge Fabric)
```

**Storage:** Supabase `businesses`, `products`, `categories`, `orders` tables. Payment records in Stripe (never stored locally).

---

### 4. Community Pulse

**Purpose:** Social engagement layer—posts, comments, likes, notifications, and real-time interaction.

**Core Entities:** `posts`, `comments`, `likes`, `notifications`

**Responsibilities:**
- Content creation and management (posts, comments)
- Engagement tracking (likes, shares, reactions)
- Notification delivery (in-app, push, email)
- Real-time updates via Supabase Realtime
- Content moderation pipeline

**Data Flow:**
```
User creates post → Community Pulse → Post stored → Event emitted: community.post.created
                                                      │
                                                      ├─→ Notification: followers notified
                                                      ├─→ Gamification: points awarded
                                                      └─→ Analytics: engagement tracked
                                                      
User likes post → Community Pulse → Like recorded → Event emitted: community.post.liked
                                                      │
                                                      ├─→ Notification: author notified
                                                      ├─→ Gamification: points awarded
                                                      └─→ Analytics: engagement tracked
```

**Storage:** Supabase `posts`, `comments`, `likes`, `notifications` tables. Real-time subscriptions via Supabase Realtime.

---

### 5. Governance Layer

**Purpose:** Oversight and coordination—policies, compliance, audit trails, federation health monitoring.

**Core Entities:** Audit logs, policy engine, federation health metrics

**Responsibilities:**
- Policy enforcement across all layers
- Audit trail maintenance for compliance
- Federation health monitoring and scoring
- Conflict resolution between federations
- Quarterly architecture reviews
- ADR tracking and debt management

**Data Flow:**
```
All Layers → Governance Layer → Audit logs recorded
                                  │
                                  ├─→ Health scores calculated
                                  ├─→ Policy violations flagged
                                  ├─→ Remediation tasks created
                                  └─→ Reports generated for federation owners
```

**Storage:** Dedicated audit log storage (Supabase with append-only RLS policies). Policy engine in Edge Functions.

---

## Interconnection Patterns

### 1. Event-Driven Communication

All cross-layer communication uses the Event Standard (`03-event-standard.md`). Layers never call each other directly—they emit events and consume events from their designated topics.

```
Layer A → Event → Topic Bus → Layer B consumes
Layer A → Event → Topic Bus → Layer C consumes
```

**Why:** Decouples layers, enables observability, supports replay, prevents cascading failures.

### 2. Gateway-Mediated Access

All external requests (client → server) flow through the Gateway Layer (`04-gateway.md`). No bypass.

```
Client → CDN → Edge Function → Gateway (auth, rate-limit, transform) → Layer
```

**Why:** Centralized security, consistent rate limiting, uniform request transformation.

### 3. Federation Scoping

Every request carries a federation context. Data access, business logic, and events are scoped to the requesting federation unless cross-federation rules apply.

```
Request { federation: "comercio" } → Comercio-scoped data only
Request { federation: "comercio", cross_federation: "turismo" } → Cross-federation protocol activated
```

**Why:** Prevents data leakage, enforces federation boundaries, supports progressive autonomy.

### 4. Shared Kernel (Supabase)

All layers share the same Supabase project but use schema isolation:

```sql
-- Federation-scoped tables
CREATE SCHEMA comercio;
CREATE SCHEMA turismo;
CREATE SCHEMA academia;
CREATE SCHEMA gobierno;
CREATE SCHEMA tech_infra;
CREATE SCHEMA comunidad;
CREATE SCHEMA metaverso;

-- Cross-federation tables in public schema
CREATE TABLE public.profiles (...);
CREATE TABLE public.orders (...);
```

**Why:** Shared infrastructure with logical separation. Enables cross-federation queries when needed while maintaining isolation.

---

## Deployment Topology

```
┌──────────────────────────────────────────────────────────┐
│                      Vercel Edge Network                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │ Edge Func  │  │ Edge Func  │  │ Edge Func  │        │
│  │ (Identity) │  │ (Commerce) │  │ (Community)│        │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘        │
│        └────────────────┼────────────────┘               │
│                         │                                │
│                 ┌───────┴────────┐                       │
│                 │ Gateway Layer  │                       │
│                 │ (Express MW)   │                       │
│                 └───────┬────────┘                       │
│                         │                                │
│                 ┌───────┴────────┐                       │
│                 │   Supabase     │                       │
│                 │  (PostgreSQL   │                       │
│                 │   + Realtime)  │                       │
│                 └────────────────┘                       │
└──────────────────────────────────────────────────────────┘
```

**Key Decisions:**
- Edge Functions handle reads, Gateway handles writes and mutations
- Supabase hosts the database and real-time subscriptions
- Vercel handles deployment, CDN, and edge routing
- All state transitions emit events for observability

---

## Scalability Considerations

| Layer | Scaling Strategy | Bottleneck Mitigation |
|-------|-----------------|----------------------|
| Identity Mesh | Horizontal (stateless JWT) | Redis session cache |
| Knowledge Fabric | Read replicas + edge cache | Event queue buffering |
| Commerce Engine | Vertical (transactional) | Connection pooling, circuit breakers |
| Community Pulse | Horizontal (real-time) | WebSocket connection limits |
| Governance Layer | Vertical (audit) | Append-only writes, async processing |

---

## Failure Modes and Resilience

1. **Supabase Down:** Edge Functions serve cached data, Gateway returns `503` for writes
2. **Edge Function Timeout:** Fallback to cloud function with degraded caching
3. **Event Queue Backpressure:** Messages buffered, processed in order when pressure relieved
4. **Federation Unavailable:** Other federations continue, affected federation enters degraded mode
5. **Rate Limit Exceeded:** Request queued with exponential backoff, not rejected
