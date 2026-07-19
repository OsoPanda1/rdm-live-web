# RDM Runtime — Perimetral SOT

Runtime de doble zero-trust para el RDM Digital Hub. Latencia casi cero mediante tickets de sesión amortizados, pools WASM calientes y micro-batching.

## Arquitectura

```
Request → Router → Security (identity ZT) → Quota → Sandbox (WASM pool + batch) → Plugin → Telemetry → Response
```

### Módulos

| Package | Responsabilidad |
|---------|----------------|
| `manifest` | Carga y validación del `rdm-runtime-manifest.json` |
| `security` | Zero-trust de identidad (token + session ticket validation) |
| `session` | Gestor de tickets de sesión con HMAC + LRU + TTL |
| `sandbox` | Pool manager de instancias WASM por plugin |
| `router` | Ruteo + middleware de micro-batching |
| `quota` | Rate limiting y quotas de CPU/Mem/IO/Concurrentes |
| `telemetry` | Métricas Prometheus, logs estructurados, trazas OTel |
| `governance` | Control de cambios GEMET, roles federados |

## Uso

```ts
import { createRuntime } from "@rdm/runtime";

const runtime = createRuntime({
  signingKey: Buffer.from(process.env.RUNTIME_SIGNING_KEY!, "hex"),
});

// Handle a request
const response = await runtime.handleRequest(
  "sdmd-ledger",       // pluginId
  "query",             // operation
  { account: "123" },  // payload
  "Bearer <token>",    // auth header
  null,                // session ID (or reuse from x-rdm-session-id header)
);
```

## Manifiesto

`config/rdm-runtime-manifest.json` define todo plugin, política de seguridad y cuota.

## Doble Zero-Trust

1. **Identidad**: Token válido + roles + federación → Session ticket (HMAC, TTL 5 min)
2. **Ejecución**: Plugin permitido para rol+federación + sandbox profile + quotas

## Session Ticket

- Primera llamada: validación completa → emisión de ticket
- Llamadas siguientes: validación rápida HMAC (sin token decode)
- Cache LRU con TTL configurable

## Micro-batching

Agrupa llamadas homogéneas (mismo plugin + operación) en ventana de 5-10ms.
Requiere que el plugin implemente `op_batch`.

## SLOs de Latencia

- p50 < 15ms
- p90 < 35ms
- p99 < 80ms
