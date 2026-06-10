# Technical Debt Registry — RDM Digital LTOS

| Módulo | TCI | Severidad | Costo estimado | Deuda / Riesgo | Acción siguiente |
| --- | --- | --- | --- | --- | --- |
| apps/web | T3 | Media | M | Consolidar rutas y secciones heredadas de repos previos. | Auditar navegación y flujos UI críticos. |
| apps/admin | T5 | Alta | M | Panel necesita política visible de uso de datos y mapa de condiciones. | Añadir vista de privacidad/telemetría. |
| services/ai-core | T5 | Alta | S | Guardián de prompts debe bloquear datos sensibles antes del proveedor IA. | Añadir tests e integrar en handlers. |
| services/territorial-twin | T4 | Media | M | Gemelo territorial requiere métricas y correlación por ruta. | Instrumentar logs estructurados. |
| services/economy | T4 | Media | S | Retención local necesita lógica testeable y ledger futuro. | Mantener función pura y ampliar casos. |
| services/analytics | T4 | Media | M | Dos registries Prometheus conviven; requiere contrato único. | Definir `@infra/metrics`. |
| services/territorial-sensing | T6 | Alta | L | Fase 2 requiere clima, WiFi mesh y presencia agregada. | Mantener stubs y diseñar integración hardware. |
| packages/core-kernel | T6 | Alta | S | Logs/métricas deben ser API estable transversal. | Congelar contrato mínimo. |
| packages/data-models | T5 | Media | M | Modelos deben etiquetar sensibilidad de datos. | Añadir taxonomía de datos. |
| packages/geo-engine | T4 | Media | S | Distancias deben ser consistentes entre `lng` y `lon`. | Cubrir con tests. |
| packages/ui-kit | T2 | Baja | M | Hardening visual pendiente hasta sanear A–G. | Posponer micro-interacciones. |
