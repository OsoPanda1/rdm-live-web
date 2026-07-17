# RDM Digital LTOS — Operational Runbook

## 1. Severity levels

| Level | Definition | Response time |
|-------|------------|---------------|
| SEV-1 | Plataforma caída o data leak confirmado | < 15 min |
| SEV-2 | Función crítica degradada (auth, IA, mapa) | < 1 h |
| SEV-3 | Función no crítica degradada | < 4 h business hours |
| SEV-4 | Cosmético / mejora | Próximo sprint |

## 2. Incidente: filtración de service-role key

1. Rotar inmediatamente en Supabase → Settings → API → Reset service_role.
2. Actualizar en Vercel dashboard → Project Settings → Environment Variables → `SUPABASE_SERVICE_ROLE_KEY` con la nueva.
3. Revocar sesiones admin: `auth.admin.signOut(user_id)`.
4. `git log -p -- src/integrations/supabase/admin*` para auditar accesos.
5. Notificar a DPO + abrir post-mortem.

## 3. Incidente: Edge Function 5xx en bucle

1. Revisar logs: `supabase functions logs <fn> --tail`.
2. Si > 1% de error rate por 5 min → activar feature flag `disable_<fn>`.
3. Rollback al último deploy estable: `supabase functions deploy <fn> --version <hash>`.
4. Abrir incidente con traza, payload de ejemplo y commit causante.

## 4. Incidente: caída de Supabase

1. Confirmar en https://status.supabase.com.
2. Activar modo degradado: el frontend muestra contenido cacheado + banner.
3. Pausar jobs de escritura no idempotentes.
4. Cuando se recupere → reproducir replay de la cola de eventos.

## 5. Backups

- Supabase realiza PITR diario (retención 7 días).
- Verificación mensual: restaurar a `rdm-restore-test`, ejecutar smoke suite.
- Buckets críticos: replicación a R2 vía cron semanal.

## 6. Despliegue (happy path)

1. PR → CI verde (lint, typecheck, test, build, security).
2. Merge a `main` → Vercel deploy preview automático (GitHub → Vercel).
3. Smoke E2E contra preview.
4. Promote a producción desde Vercel dashboard (o automático si el pipeline es `--prod`).

## 7. Rollback

- Vercel → Deployments → "..." → "Rollback to this deployment".
- Migraciones SQL: cada migración debe tener `down.sql` reversible.

## 8. Contactos

- On-call rotation: ver PagerDuty / Slack `#rdm-oncall`.
- Security: `security@realdelmonte.example`.
- Data protection officer: `dpo@realdelmonte.example`.
