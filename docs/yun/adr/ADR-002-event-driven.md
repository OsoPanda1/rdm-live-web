# ADR-002 – Arquitectura event-driven

**Fecha:** 2026-07-04  
**Estado:** Accepted  
**Decisor(es):** YUN Architecture Board

---

## Contexto

TAMV Online, RDM Digital y el Nodo Cero están compuestos por múltiples dominios (Identity, Commerce, Knowledge, Telemetry, Gameplay) y federaciones (7 dominios coordinados). Estos dominios necesitan comunicarse entre sí sin crear acoplamientos frágiles que puedan romperse ante cambios o fallos.

## Decisión

Adoptar un **bus de eventos** como sistema nervioso central de YUN.

Los dominios se comunican preferentemente mediante eventos publicados en topics, no por llamadas directas acopladas.

## Alternativas consideradas

- **Llamadas directas (REST/gRPC):** Simple pero crea acoplamiento rígido entre servicios.
- **Colas de mensajes (SQS/RabbitMQ):** Válido pero menos flexible para múltiples consumidores.
- **Event-driven con Kafka/NATS:** Mayor complejidad inicial pero mejor escalabilidad y desacoplamiento.

## Consecuencias

### Positivas
- Desacoplamiento total entre dominios.
- Escalabilidad horizontal del bus de eventos.
- Trazabilidad completa de cambios de estado.
- Capacidad de replay y auditoría.
- Facilita modos degradados (un dominio puede dejar de consumir eventos sin afectar a otros).

### Negativas
- Complejidad inicial mayor.
- Requiere manejo de idempotencia en consumidores.
- Eventual consistency entre dominios.

### Riesgos
- Complejidad mitigada con estándares claros de eventos (ADR-002).
- Idempotencia se gestiona con trace_id y deduplicación.

---

## Referencias

- [YUN Event Standard](../06-event-standard.md)
- [YUN Constitution – Principio 2.2](../01-constitution.md)
- [YUN Blueprint – Bus de eventos](../03-blueprint.md)
