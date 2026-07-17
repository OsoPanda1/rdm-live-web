# REPORTE DE AVANCE — Stripe Integration
**Fecha:** 2026-07-16
**Repo:** `rdm-digital-hub-ldtocs`

---

## Resumen

Integración Stripe completada al **95%**. Se implementaron MPP, ACS, Tax e Invoicing. Las suscripciones con crypto están listas con feature flags, pendientes de aprobación de Stripe.

## Lo implementado

| Funcionalidad | Archivos | Líneas |
|---------------|----------|--------|
| MPP (Machine Payments) — Fiat/SPT | `api/mpp/pay.ts`, `api/mpp/collect.ts` | ~120 |
| ACS (Agentic Commerce Suite) | `supabase/functions/agentic-commerce/index.ts` | ~60 |
| Stripe Tax — cálculo automático | `_shared/tax.ts`, `tax-calculate/index.ts` | ~100 |
| Stripe Invoicing — facturación | `create-invoice/index.ts`, `invoice-list/index.ts` | ~150 |
| Webhook extendido | `stripe-webhook/index.ts` | + eventos invoice + MPP |
| DB Migration | `20260716000000_mpp_acs_tax_invoice.sql` | +4 tablas |
| Crypto subs (feature flag) | `create-premium-checkout`, `create-commerce-checkout` | toggle ready |
| Shared Stripe helper actualizado | `api/_shared/stripe.ts` | + preview API version |

## Pendiente para producción

1. Solicitar acceso a **Stablecoins + Crypto** en Dashboard de Stripe
2. Solicitar acceso a **Subscription Stablecoins** (Private Preview) — email a Stripe
3. Configurar `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` como secrets de Supabase
4. Cambiar `CRYPTO_ENABLED` y `CRYPTO_SUBSCRIPTIONS_ENABLED` a `true`
5. Migrar DB: `supabase db push`
6. Desplegar Edge Functions: `supabase functions deploy`

## Commits

| Hash | Mensaje |
|------|---------|
| `544ecfc` | Add MPP, ACS, Tax, Invoicing + crypto subscription support |
| `e2910ef` | Add microfrontends.json |
| `8247cc7` | Merge ldtocs/main into main (fusión de ambos repos) |
| `b7a6f1e` | Fix duplicates: remove ai-text-demo, convert health-check to TS |
