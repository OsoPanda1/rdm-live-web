# ADR-001 – Supabase para Identity

**Fecha:** 2026-07-04  
**Estado:** Accepted  
**Decisor(es):** YUN Architecture Board

---

## Contexto

TAMV Online y RDM Digital necesitan un sistema de identidad que proporcione:
- Autenticación integrada (email/password, OAuth2).
- Row Level Security (RLS) para protección de datos a nivel de base.
- APIs rápidas para el frontend.
- Gestión de roles y permisos.
- Integración con el ecosistema frontend (TanStack Start, React).

## Decisión

Usar **Supabase Postgres** como base del dominio Identity.

Supabase ofrece:
- Postgres completo con RLS.
- Auth integrado con múltiples proveedores.
- API REST y GraphQL automáticas.
- Realtime para actualizaciones en vivo.
- Edge Functions para lógica serverless.

## Alternativas consideradas

- **Firebase Auth:** Más simple pero sin RLS nativo ni Postgres completo.
- **Auth0:** Servicio externo, mayor dependencia y costo.
- **Cognito:** Vendor lock-in con AWS, menos flexible para el modelo federado.
- **Postgres propio:** Más control pero más operación.

## Consecuencias

### Positivas
- RLS protege datos a nivel de base sin lógica adicional.
- Auth integrado reduce complejidad de implementación.
- API automática acelera desarrollo frontend.
- Postgres permite extensibilidad futura.

### Negativas
- Dependencia gestionada de Supabase como proveedor.
- RLS requiere diseño cuidadoso de políticas.
- Edge Functions tienen limitaciones de runtime.

### Riesgos
- Vendor lock-in mitigado por uso de Postgres estándar.
- Costo escalable con uso (gestionable para el tamaño actual).

---

## Referencias

- [Supabase Documentation](https://supabase.com/docs)
- [YUN Blueprint – Arquitectura de datos](../03-blueprint.md)
- [YUN Data Standard](../05-data-standard.md)
