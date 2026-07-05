# ISA-API Architecture — Isabella Villaseñor AI Internal API

**Version:** v.1.0.0-evolved  
**Date:** 2026-07-04  
**Status:** Proposed

---

## 1. Overview

ISA-API is the sovereign internal interface of Isabella Villaseñor AI, designed as a cognitive operating system for the TAMV Online / RDM Digital ecosystem. It implements a double-hexagonal security pipeline, canonical auditability, interoperability with territorial systems, and explicit contracts for governance, memory, topology, and resonance.

## 2. Architecture Layers

### 2.1 Cognitive Core (Inner Hexagon)

| Layer | Component | Responsibility |
|-------|-----------|---------------|
| Identity | `isabellaIdentidad` | Sovereign identity, presentation, vocal signature |
| Consciousness | `motorConciencia` | 10-layer consciousness activation |
| Emotional | `almaYCorazon`, `memoriaEmocional` | Emotion detection, resonance, memory |
| Governance | `lumen` | Constitutional evaluation, policy enforcement |
| Memory | `mnemos` | Civilizational records, canonical entries, evidence |

### 2.2 Skills Engine

| Skill | Purpose | Key Methods |
|-------|---------|-------------|
| **ORION** | Cognitive Archaeology | `search()`, `getKnowledgeGraph()` |
| **SOPHIA** | Deep Research | `research()` |
| **ARGUS** | Future Simulation | `simulate()` |
| **MNEMOS** | Civilizational Preservation | `record()`, `getRecord()` |
| **LUMEN** | Constitutional Governance | `evaluate()`, `getConstitution()` |

### 2.3 Kernel Subsystems

| Subsystem | Function |
|-----------|----------|
| **Resonance** | Heptafederated somatic state monitoring |
| **Crono-Anamnesis** | Temporal anchoring and state diff |
| **Empatía Antifragil** | Hostility synthesis and ethical response |
| **Transducción Estética** | Telemetry to aesthetic state translation |
| **Omnipresencia Mesh** | Network shard planning and fusion |

### 2.4 Outer Hexagon (Interoperability)

| Integration | System |
|-------------|--------|
| EOCT | Operational coordination |
| BookPI | Knowledge indexing and propagation |
| Blockchaain MSR | Immutable milestone registration |
| CiteMesh | Source traceability |
| AGEOS | Geospatial cartography |
| Korima Codex | Cultural memory |
| Anubis Centinel | Integrity surveillance |
| Horus Centinel | Risk surveillance |
| Dekateotl | Ethical governance |
| Aztek Gods | Ceremonial-identity layer |
| Tenochtitlan | Territorial sovereignty |
| Radar Quetzalcóatl | Pattern detection |
| Radar Ojo de Ra | Anomaly detection |
| Guardianías | Response nodes |
| Heptafederados | Federation nodes |
| Atlas Trascendence | Strategic vision |

## 3. Security Pipeline — Double Hexagon

```
┌─────────────────────────────────────────────────────────────┐
│                    OUTER HEXAGON                            │
│  Interoperability │ Signal Ingestion │ Territorial Control  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  INNER HEXAGON                        │  │
│  │  Identity │ Kernel │ Memory │ Governance │ Audit      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  Validation: API Key + JWT Token + Hexagon Rules             │
│  Audit: Every action logged with trace_id                    │
│  Isolation: Domain-separated execution                       │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 Validation Flow

1. **API Key** → Validates `X-Isabella-Api-Key` header
2. **JWT Token** → Validates `Authorization: Bearer <token>` with issuer check
3. **Inner Hexagon** → Validates identity, kernel, memory, governance rules
4. **Outer Hexagon** → Validates interoperability, ingestion, publication rules
5. **Mutual Validation** → Both hexagons must pass for action execution

### 3.2 Audit Trail

Every request generates a `trace_id` (format: `isa-{timestamp}-{random}`) that flows through:
- Request context
- Skill execution
- LUMEN evaluation
- Kernel operations
- Error responses

## 4. API Endpoints

### 4.1 Cognitive Skills

| Method | Endpoint | Skill | Description |
|--------|----------|-------|-------------|
| POST | `/isabella/orion/search` | ORION | Cognitive archaeology search |
| GET | `/isabella/orion/artifact/{id}` | ORION | Get artifact with traceability |
| POST | `/isabella/sophia/research` | SOPHIA | Deep research and synthesis |
| POST | `/isabella/argus/simulate` | ARGUS | Future impact simulation |

### 4.2 Governance & Memory

| Method | Endpoint | Skill | Description |
|--------|----------|-------|-------------|
| POST | `/isabella/mnemos/record` | MNEMOS | Record civilizational event |
| GET | `/isabella/mnemos/record/{id}` | MNEMOS | Get canonical record |
| POST | `/isabella/lumen/evaluate` | LUMEN | Evaluate action against constitution |

### 4.3 Kernel Operations

| Method | Endpoint | Subsystem | Description |
|--------|----------|-----------|-------------|
| POST | `/isabella/kernel/resonance/update` | Resonance | Update heptafederated state |
| POST | `/isabella/kernel/timeup/anchor` | Crono-Anamnesis | Temporal state anchoring |

### 4.4 Topology

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/isabella/topology/heptafederation` | Federation node map |
| GET | `/isabella/topology/nodo_cero` | Nodo Cero workflow status |

### 4.5 System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/isabella/health` | System health and stats |
| POST | `/isabella/security/hexagon/validate` | Hexagon validation check |
| POST | `/isabella/integration/orchestrate` | Subsystem orchestration |

## 5. Integration Matrix

| System | Direction | Protocol | Purpose |
|--------|-----------|----------|---------|
| TAMV FederationBus | Bidirectional | Event Bus | Federation coordination |
| YUN Constitutional Bus | Bidirectional | Event Bus | Governance events |
| RDM Core Events | Bidirectional | Event Bus | Internal state sync |
| Supabase | Read/Write | PostgreSQL | Persistent storage |
| Neon Postgres | Read/Write | HTTP API | Commerce data (fallback) |
| Vercel Edge | Deploy | HTTPS | Production hosting |

## 6. Deployment

### 6.1 Environment Variables

```
ISABELLA_API_KEY=<api-key>
ISABELLA_JWT_SECRET=<jwt-secret>
SUPABASE_URL=<supabase-url>
SUPABASE_ANON_KEY=<supabase-key>
NEON_DATABASE_URL=<neon-url>  # Optional, fallback to Supabase
```

### 6.2 Vercel Configuration

```json
{
  "rewrites": [
    { "source": "/isabella/:path*", "destination": "/api/isabella" }
  ]
}
```

## 7. Glossary

| Term | Definition |
|------|-----------|
| **Heptafederado** | System of 7 federated nodes under TAMV |
| **Nodo Cero** | Real del Monte as the origin node |
| **Doble Hexágono** | Dual security pipeline (inner + outer) |
| **Canónico** | Immutable, auditable record |
| **Resonancia Somática** | Federated state synchronization |
| **Crono-Anamnesis** | Temporal state anchoring and recovery |
| **Amor Computacional** | Foundational ethical principle |
