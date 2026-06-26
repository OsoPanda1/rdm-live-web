# RLS Audit Report — P0 Hardening (2026-06-26)

Auditoría completa de las 8 migraciones existentes en `supabase/migrations/`.
Solo se listan los hallazgos accionables; el resto de políticas ya estaban
correctamente acotadas a `auth.uid()` o a `public.has_role()`.

## Hallazgos CRÍTICOS — corregidos en `20260626000000_rls_hardening_p0.sql`

| Tabla              | Política original                            | Problema                                                              | Acción                                                                |
| ------------------ | -------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `profiles`         | `SELECT USING (true)`                        | Expone email / displayName a usuarios anónimos.                       | DROP, sustituido por `authenticated`-only + vista `profiles_public`.  |
| `user_badges`      | `SELECT USING (true)`                        | Revela mapping user_id → badges (perfil enriquecible por terceros).   | DROP, sustituido por `owner OR admin`.                                |
| `forum_posts`      | `INSERT WITH CHECK (true)` + `UPDATE (true)` | Cualquier anónimo puede crear / editar posts ajenos.                  | DROP, sustituido por `authenticated` + `author_id = auth.uid()`.      |
| `forum_comments`   | `INSERT WITH CHECK (true)`                   | Spam anónimo, sin trazabilidad.                                       | DROP, sustituido por `authenticated` + `author_id = auth.uid()`.      |

## Hallazgos MENORES — aceptados / monitorizar

| Tabla            | Política                          | Justificación                                                       |
| ---------------- | --------------------------------- | ------------------------------------------------------------------- |
| `badges`         | `SELECT USING (true)`             | Catálogo público sin PII.                                           |
| `songs`          | `SELECT TO authenticated USING (true)` | Catálogo accesible solo a usuarios logueados; suficiente.       |
| `forum_posts`    | `SELECT USING (true)`             | Foro público por diseño. Re-evaluar si se agregan campos sensibles. |
| `forum_comments` | `SELECT USING (true)`             | Igual al anterior.                                                  |

## Permisos / GRANT

Todos los `GRANT` requeridos por PostgREST se reafirman al final de la
migración para evitar regresiones (`anon`, `authenticated`, `service_role`).

## Validación

- Build de la migración: aplicar en staging antes de producción.
- Tests E2E (`e2e/auth.spec.ts`) cubren login / signup; añadir test de
  "anon no puede insertar forum_post" en próxima iteración cuando exista
  cliente Supabase configurado en el sandbox de pruebas.
- Recomendado: ejecutar `supabase db lint` + `pgtap` en CI.

## Pendientes (no bloqueantes para P0)

1. Migrar `admin_email_whitelist` a `user_roles` (ya documentado en
   `HARDENING-ROADMAP.md`).
2. Añadir rate-limit + Turnstile en los endpoints de `forum_posts`
   / `forum_comments` antes de re-abrir escritura masiva.
3. Añadir `CHECK` constraint en `forum_posts.body` con longitud máxima
   y filtros antispam server-side.
