# RDM Digital LTOS — Estado de Madurez por Módulo

Modelo: **M0** Conceptual · **M1** Scaffolded · **M2** Functional · **M3** Stable · **M4** Verified · **M5** Frozen

Actualizado: **Etapas 1-3 del refactor federado completadas** (façades en `packages/`, `services/` y `apps/`).

## Capas y aliases activos

| Alias | Capa | Apunta a | Etapa |
|---|---|---|---|
| `@` | Legacy | `src/*` | 0 |
| `@geo-engine` | Foundations | `packages/geo-engine/src` | 1 ✅ |
| `@core-kernel` | Foundations | `packages/core-kernel/src` | 1 ✅ |
| `@data-models` | Foundations | `packages/data-models/src` | 1 ✅ |
| `@ui-kit` | Foundations | `packages/ui-kit/src` | 1 ✅ |
| `@ai-core` | Services | `services/ai-core/src` | 2 ✅ |
| `@twin` | Services | `services/territorial-twin/src` | 2 ✅ |
| `@economy` | Services | `services/economy/src` | 2 ✅ |
| `@analytics` | Services | `services/analytics/src` | 2 ✅ |
| `@culture` | Services | `services/culture/src` | 2 ✅ |
| `@app-web/*` | Apps | `apps/web/src/*` | 3 ✅ |
| `@app-admin/*` | Apps | `apps/admin/src/*` | 3 ✅ |

## Matriz de madurez

| Capa | Módulo | Façade | Estado | Notas |
|---|---|---|---|---|
| Foundations | geo-engine | `@geo-engine` | **M4** | LRU+TTL, haversine, bbox, spatial index. |
| Foundations | core-kernel | `@core-kernel` | **M3** | Kernel + modos + auditoría unificados. |
| Foundations | data-models | `@data-models` | **M3** | `Intent` canónico desde `core/models`; legacy expuesto como `LegacyIntent`. |
| Foundations | ui-kit | `@ui-kit` | **M2** | Primitives RDM expuestas; shadcn aún directo. |
| Intelligence | ai-core (Isabella/Realito) | `@ai-core` | **M3** | Decision engine + guardian + tamv base por namespace. |
| Territorial | territorial-twin | `@twin` | **M3** | Orchestrators v1/v2 + scoring v1/v2 + realito gen4 por namespace para evitar colisiones. |
| Economy | economy | `@economy` | **M2** | Catálogo + tipo `AwardPointsRequest`. Stripe live pendiente (Bloque C). |
| Economy | auth + roles + gamificación | — | **M3** | Cerrado bloque previo. |
| Governance | analytics | `@analytics` | **M2** | `CoreMetrics`, `InfraMetrics`, `Monitoring` segregados por namespace. |
| Culture | culture engine | `@culture` | **M3** | Corpus, dichos, tesis TAMV, federations, ecosystem. |
| Experience | apps/web | `@app-web/*` | **M3** | 5 dominios (rdm/community/economy/governance/intelligence) + shared. Manifest lazy. |
| Experience | apps/admin | `@app-admin/*` | **M2** | Surface separada, expone Dashboard. |
| Infra | supabase | _(Etapa 4)_ | **M3** | Migraciones y edge functions desplegadas. |
| Infra | metrics | _(Etapa 4)_ | **M2** | Prometheus + monitoring registrados. |

## Decisiones de diseño Etapa 2-3

- **Namespaces frente a `export *`**: módulos con APIs solapadas (dos `ScoringEngine`, dos `ExperienceOrchestrator`, dos `prometheus`) se exponen como `export * as X` para evitar colisión de símbolos. La selección de la versión canónica se difiere a Etapa 4.
- **App.tsx intacto**: los manifests de dominio (`apps/web/src/domains/*/pages.ts`) son lazy-imports estables. El routing actual sigue funcionando; en Etapa 4 se sustituyen los `lazy(() => import("@/pages/X"))` por moves físicos sin tocar App.tsx.
- **No se introdujo runtime nuevo**: cero dependencias añadidas, cero archivos movidos físicamente, cero rutas modificadas. Sólo aliases + manifests + docs.

## Deuda técnica

- `@ts-nocheck` activo: `ExplorerView`, `Dashboard`, `Auth`, `experience.orchestrator`, varios `data/imported/*`.
- `src/integrations/supabase/{client,types}.ts` autogenerados — nunca editar.
- Dos versiones de `ScoringEngine`, `ExperienceOrchestrator`, `prometheus`: consolidar en Etapa 4.
- Pendientes funcionales: Bloque A (cableado mapa+comercios) · Bloque B (páginas /federation, /nodocero, /realito-ai, /mitos, /transporte) · Bloque C (Stripe live).

## Etapa 4 — Hardening y observabilidad (parcial, ejecutada)

Aplicando el skill RDM LIVOS (Evidence Gate + Change Governance + Anti-overengineering), los moves físicos planeados se **defieren** con justificación documentada:

| Acción planeada | Decisión | Razón |
|---|---|---|
| Mover `supabase/` → `infra/supabase/` | **Rechazada** | Lovable gestiona edge functions en la ruta `supabase/`; mover rompe deploy automático. Beneficio cosmético < riesgo P0. |
| Mover archivos físicos `src/` → `packages/*` | **Diferida** | Aliases + façades cubren el contrato. Mover físico requiere reescribir >200 imports sin beneficio runtime. |
| Consolidar duplicidades scoring/orchestrator | **Diferida** | Evidence Gate: no hay prueba de cuál versión es la canónica. Requiere QA manual. |
| Eliminar re-exports puente legacy | **Diferida** | Acoplado a los moves físicos. |

### Hardening aplicado (Etapa 4 ✅)

- **SECURITY DEFINER**: `award_points` y `handle_new_user` revocados de `PUBLIC/anon/authenticated`. `has_role` se mantiene público (lo invocan políticas RLS).
- **CHECK constraints anti-abuso**: `forum_posts` (title≤200, content≤5000, author≤80), `forum_comments` (content≤2000).
- **`activity_log` INSERT**: whitelist regex `^[a-z][a-z0-9_]{0,63}$` + límites de longitud en `action`/`target_type` para prevenir poisoning del audit trail.
- **Índices de performance**: `idx_point_transactions_user_action_created` (acelera cooldown de `award-points`) e `idx_activity_log_user_created`.
- **Memoria de seguridad**: actualizada con decisiones permanentes para evitar re-flaggear hallazgos contextuales.

### Riesgos aceptados documentados (skill: Confidence Protocol)

- Foro público anónimo (`forum_posts`/`forum_comments` con `WITH CHECK (true)`): mitigado por trigger + CHECKs.
- `has_role` ejecutable por anon: requerido por RLS, sin efectos secundarios.
- Realtime channels sin RLS: no se usan suscripciones privadas en el proyecto.

### Próximo ciclo (cuando haya QA dedicado)

1. Auditoría de versiones duplicadas (ScoringEngine v1/v2, ExperienceOrchestrator v1/v2, prometheus core/infra) — elegir canónica con evidencia de uso.
2. Mover archivos físicos a `packages/*/src/` en lotes pequeños con tests de smoke por ruta.
3. Reemplazar progresivamente `@ts-nocheck` en `data/imported/*` con tipos del schema generado.

