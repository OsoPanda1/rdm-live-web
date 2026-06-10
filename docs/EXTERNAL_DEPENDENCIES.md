# Inventario multi-cloud / multi-agente / multi-respaldo

| Tipo | Proveedor actual | Plan B | Plan C | Abstracción mínima |
| --- | --- | --- | --- | --- |
| Auth | Supabase Auth / Lovable Cloud Auth | Postgres gestionado + Lucia/Auth.js | Keycloak | `@infra/auth` |
| Datos | Supabase Postgres | Postgres gestionado + Prisma | Neon/Cloud SQL | `@infra/storage` |
| IA | Google GenAI | OpenAI | Modelo local/edge | `@infra/ai-provider` |
| Mapas | Leaflet/OpenStreetMap | MapLibre + tiles propios | Proveedor comercial | `@infra/maps` |
| Email | Pendiente | Resend | SES/Mailgun | `@infra/email` |
| Storage | Supabase Storage | S3 compatible | GCS/Azure Blob | `@infra/storage` |
| Métricas | Prometheus local | Grafana Cloud | OpenTelemetry collector | `@infra/metrics` |
| CDN/DNS | Pendiente | Cloudflare | Fastly/AWS CloudFront | `@infra/network` |

## Repos consolidados como versiones del mismo proyecto

Este repo queda como rama operacional unificada de las líneas históricas: `rdm-digital-final`, `rdm-digital-soul`, `heptafederate-heart`, `real-del-monte-twin-d2368aa7`, `real-del-monte-digital-hub`, `real-del-monte-explorer-7b2783c6`, `real-del-monte-digital`, `rdm-hub-unite`, `real-del-monte-atlas`, `real-del-monte-elevated-b2ea1ec6`, `rdm-turismodigital-473c48b4`, `rdm-digital-os`, `realdelmonte-digital`, `real-del-monte-ai-nexus`, `RDM-Digital-X`, `real-del-monte-explorer`.

La regla operativa es absorber sólo código con evidencia de uso, validación mínima y rollback. Los cambios de alto riesgo deben pasar por el Evidence Gate del template de PR.
