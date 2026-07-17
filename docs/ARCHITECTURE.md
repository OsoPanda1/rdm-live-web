# RDM Digital LTOS — Architecture

## Topología actual

```
┌──────────────────────────────────────────────────────────┐
│                   Vercel (SPA)                           │
│         src/pages  src/components  (Vite + React)        │
└─────────────┬──────────────────────────┬─────────────────┘
              │ publishable key          │ user JWT
              ▼                          ▼
        ┌──────────────────────────────────────┐
        │            Supabase                  │
        │  Auth · Postgres (RLS) · Storage     │
        │  Realtime · Edge Functions (Deno)    │
        └──────────┬───────────────────────────┘
                   │ service_role (server-only)
                   ▼
        ┌──────────────────────────────────────┐
        │  services/* (Node/Deno workers)      │
        │  IA (Gemini) · Eventos · Analytics   │
        └──────────────────────────────────────┘
```

## Dominios

| Dominio            | Path                       | Estado |
|--------------------|----------------------------|--------|
| IA conversacional  | services/ai, apps/web/ai   | beta   |
| Gemelo territorial | apps/web/twin              | alpha  |
| Economía local     | services/economy           | alpha  |
| Cultura            | apps/web/culture           | beta   |
| Analytics          | services/analytics         | alpha  |
| Sensores IoT       | services/sensors           | planned|

## Trust boundaries

1. **Browser ↔ Supabase**: publishable key + RLS. Nunca service_role.
2. **Browser ↔ Edge Functions**: JWT del usuario, validado por la función.
3. **Edge Function ↔ Postgres**: service_role solo cuando se requiere bypass de RLS, con verificación previa del rol via `has_role()`.
4. **CI ↔ Vercel/Supabase**: tokens OIDC efímeros, nunca PATs en secretos largos.

## Datos sensibles

- PII de visitantes (email, teléfono) → tabla `profiles`, RLS estricta por `auth.uid()`.
- Roles → tabla `user_roles` separada (jamás en `profiles`).
- Logs de IA → anonimizados a las 24 h.

## Pendientes (gap analysis vs manual maestro)

Ver `docs/HARDENING-ROADMAP.md`.
