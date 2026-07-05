# ADR-005 – Commerce Domain Migration to Neon Postgres

**Fecha:** 2026-07-04  
**Estado:** Proposed  
**Decisor(es):** YUN Architecture Board

---

## Contexto

Actualmente todo el dominio Commerce vive en Supabase Postgres (13+ tablas: music_donations, music_mecenas, memberships, merchant_profiles, store_products, store_orders, businesses, stripe_events, etc.). El YUN Blueprint (docs/yun/03-blueprint.md) y el Data Standard (docs/yun/05-data-standard.md) definen que Commerce debe vivir en **Neon Postgres** para separación de dominios.

El mapeo `DOMAIN_STORAGE` en `src/core/yun/types.ts` ya declara `commerce: 'neon'`, pero el `CommerceAdapter` en `data-fabric.ts` sigue usando Supabase.

## Decisión

Migrar el dominio Commerce de Supabase a Neon Postgres de forma progresiva:

1. **Fase 1 — Adapter Neon con fallback Supabase** (inmediato)
   - Crear `NeonCommerceAdapter` en `data-fabric.ts`
   - Usar Neon SDK (`@neondatabase/serverless`) para conexiones
   - Mantener fallback a Supabase si Neon no está configurado
   - Las tablas existentes en Supabase se migran a Neon vía `pg_dump` → Neon import

2. **Fase 2 — Migración de tablas** (requiere Neon project)
   - `yun_data_catalog` ya lista las 4 tablas core: businesses, products, orders, categories
   - Migrar tablas derivadas: memberships, merchant_profiles, store_products, store_orders
   - Migrar tablas de Stripe: stripe_events, stripe_failed_events
   - Migrar tablas de música: music_donations, music_mecenas

3. **Fase 3 — Corte de tráfico** (una vez verificado)
   - Actualizar todos los `supabase.from('businesses')` → `dataFabric.access({ domain: 'commerce', ... })`
   - Los Edge Functions de Stripe continúan en Supabase (compatibilidad)
   - El Data Fabric se encarga del routing transparente

## Tablas a migrar

| Tabla | Propósito | Retención | Sensibilidad |
|-------|-----------|-----------|--------------|
| `businesses` | Listados de negocios | 1825 días | P1 |
| `store_products` | Catálogo de productos | 1825 días | P1 |
| `store_orders` | Órdenes de compra | 365 días | P0 |
| `memberships` | Membresías de usuario/merchant | 365 días | P0 |
| `merchant_profiles` | Perfiles de comercio | 1825 días | P1 |
| `stripe_events` | Eventos idempotentes de Stripe | 90 días | P0 |
| `stripe_failed_events` | Eventos fallidos de Stripe | 30 días | P0 |
| `music_donations` | Donaciones musicales | 365 días | P1 |
| `music_mecenas` | Tier de mecenazgo | indefinido | P1 |

## Dependencias

- `@neondatabase/serverless` — SDK serverless de Neon
- `DATABASE_URL` (Neon) — connection string en Vercel env vars
- Neon project provisioned en neon.tech

## Consecuencias

### Positivas
- Separación real de dominios (YUN Constitution Principle #1)
- Neon soporta branching para testing (branches efímeras)
- Escalabilidad independiente de Supabase
- Data Catalog coherente con arquitectura

### Negativas
- Duplicidad temporal de tablas durante migración
- Complejidad de sync entre Supabase y Neon
- Edge Functions de Stripe siguen en Supabase (transitorio)

### Riesgos
- Neon downtime afecta Commerce sin fallback
- Mitigado: adapter con fallback automático a Supabase

---

## Referencias

- [YUN Blueprint – Arquitectura de datos](../03-blueprint.md)
- [YUN Data Standard](../05-data-standard.md)
- [DOMAIN_STORAGE mapping](../../src/core/yun/types.ts)
