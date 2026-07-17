# YUN Event Standard – Modelo de eventos y sistema nervioso

**Versión:** v1.0  
**Fecha:** 2026-07-04  
**Ámbito:** Eventos de negocio, salud, seguridad y federación en YUN

---

## 1. Objetivo

Este documento define el estándar de eventos de YUN: el sistema nervioso que comunica dominios, federaciones, telemetría e Isabella sin acoplamiento directo.

---

## 2. Topics base

Cada dominio y área tiene su topic principal:

| Topic | Dominio | Propósito |
|-------|---------|-----------|
| `identity.events` | Identity | Creación, actualización, eliminación de usuarios, roles, sesiones |
| `commerce.events` | Commerce | Pagos, suscripciones, facturas, eventos de Stripe |
| `knowledge.events` | Knowledge | Publicaciones, contribuciones, ontologías |
| `telemetry.events` | Telemetry | Métricas de operación, auditoría |
| `gameplay.events` | Gameplay | Puntos, niveles, logros, sesiones de juego |
| `federations.events` | Federaciones | Salud, políticas, incidentes de Fed1–Fed7 |
| `security.events` | Seguridad | Alertas, intentos de ataque, incidentes |

---

## 3. Esquema mínimo de evento

Todo evento debe incluir:

```json
{
  "event_type": "string",
  "domain": "string",
  "federation_id": "string | null",
  "entity_id": "string",
  "trace_id": "string",
  "timestamp": "ISO 8601",
  "severity": "info | warn | error | critical",
  "payload": "object"
}
```

### 3.1 Campos obligatorios

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `event_type` | string | Tipo de evento (ej. `user.created`, `payment.completed`) |
| `domain` | string | Dominio de origen |
| `federation_id` | string \| null | Federación afectada (si aplica) |
| `entity_id` | string | ID de la entidad afectada |
| `trace_id` | string | ID de trazabilidad para correlación |
| `timestamp` | string | Momento del evento en ISO 8601 |
| `severity` | string | Nivel de severidad |
| `payload` | object | Datos específicos del evento |

---

## 4. Reglas de eventos

### 4.1 Generación
- Toda operación relevante genera evento.
- Los eventos se emiten de forma asíncrona después de la operación exitosa.

### 4.2 Contenido
- Ningún evento debe contener información sensible sin cifrado o anonimización.
- El `payload` debe seguir un esquema controlado por dominio.

### 4.3 Consumo
- Todos los consumidores deben poder ignorar eventos que no les correspondan sin fallar.
- Los consumidores deben ser idempotentes: procesar el mismo evento dos veces no debe causar efectos duplicados.

### 4.4 Orden y resiliencia
- El orden de eventos dentro de un mismo `entity_id` debe preservarse.
- El sistema debe tolerar reordenamiento entre diferentes entidades.

---

## 5. Ejemplo de evento

```json
{
  "event_type": "user.gamification.xp_gained",
  "domain": "gameplay",
  "federation_id": "PHOENIX",
  "entity_id": "usr_abc123",
  "trace_id": "trc_789xyz",
  "timestamp": "2026-07-04T12:00:00Z",
  "severity": "info",
  "payload": {
    "points": 150,
    "quest_code": "RDM-002",
    "new_level": 3,
    "total_xp": 1500
  }
}
```

---

## 6. Vínculo con otros documentos YUN

- La Constitución YUN exige que todo cambio significativo genere un evento (principio 2.2).
- El Blueprint define el bus de eventos como componente central.
- El Operations Manual usa eventos para detectar y recuperar fallos.
- El Data Catalog registra qué entidades generan eventos y con qué propósito.
