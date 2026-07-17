# YUN ADR Index – Registro de decisiones arquitectónicas

**Versión:** v1.0  
**Fecha:** 2026-07-04  
**Ámbito:** Todas las decisiones arquitectónicas significativas de YUN

---

## 1. Propósito

Este índice registra todas las Architecture Decision Records (ADR) de YUN. Cada ADR documenta una decisión significativa con contexto, alternativas, decisión y consecuencias.

---

## 2. Formato de ADR

Cada ADR sigue este formato:

```markdown
# ADR-XXXX – Título

**Fecha:** YYYY-MM-DD
**Estado:** Proposed | Accepted | Deprecated | Superseded | Excepción
**Decisor(es):** YUN Architecture Board

## Contexto
¿Qué problema se resuelve?

## Decisión
¿Qué se decidió?

## Alternativas consideradas
- Alternativa A: ...
- Alternativa B: ...

## Consecuencias
- Positivas: ...
- Negativas: ...
- Riesgos: ...
```

---

## 3. Índice de ADR

| ID | Título | Fecha | Estado | Archivo |
|----|--------|-------|--------|---------|
| ADR-001 | Supabase para Identity | 2026-07-04 | Accepted | [ADR-001-supabase.md](adr/ADR-001-supabase.md) |
| ADR-002 | Arquitectura event-driven | 2026-07-04 | Accepted | [ADR-002-event-driven.md](adr/ADR-002-event-driven.md) |
| ADR-003 | YUN como base fundacional | 2026-07-04 | Accepted | [ADR-003-yun-architecture.md](adr/ADR-003-yun-architecture.md) |
| ADR-004 | Modelo heptafederado | 2026-07-04 | Accepted | [ADR-004-heptafederation.md](adr/ADR-004-heptafederation.md) |
| ADR-005 | Commerce → Neon Postgres | 2026-07-04 | Proposed | [ADR-005-commerce-neon-migration.md](adr/ADR-005-commerce-neon-migration.md) |

**Documentos de Arquitectura ISA-API:**

| Documento | Versión | Fecha | Archivo |
|-----------|---------|-------|---------|
| ISA-API OpenAPI Spec | v.1.0.0-evolved | 2026-07-04 | [isa-api.yaml](isa-api.yaml) |
| ISA-API Architecture | v.1.0.0-evolved | 2026-07-04 | [09-isa-api-architecture.md](09-isa-api-architecture.md) |

---

## 4. Estados de ADR

| Estado | Significado |
|--------|-------------|
| **Proposed** | En revisión por el Architecture Board |
| **Accepted** | Aprobada e implementada |
| **Deprecated** | Obsoleta, ya no aplica |
| **Superseded** | Reemplazada por otra ADR |
| **Excepción** | Excepción aprobada con fecha de revisión |

---

## 5. Proceso

1. Se propone una ADR como PR al repositorio.
2. El Architecture Board revisa contra la Constitución YUN.
3. Se aprueba, rechaza o aprueba con condiciones.
4. El estado se actualiza y se registra en este índice.
