# Hardening roadmap — gap vs Manual Maestro

Estado tras hardening P0 (este PR):

| Área                                | Estado | Notas |
|-------------------------------------|--------|-------|
| Service role aislado server-only    | ✅     | `admin.server.ts` + ESLint `no-restricted-imports` |
| Env tipado (cero `any` en config)   | ✅     | `src/lib/env.ts` + `src/lib/env.server.ts` con Zod |
| Logger centralizado                 | ✅     | `src/lib/logger.ts`; reemplazar `console.*` por `logger.*` |
| gitleaks · trufflehog · npm audit   | ✅     | `.github/workflows/security.yml` + CodeQL |
| CI con typecheck + coverage + E2E   | ✅     | `.github/workflows/ci.yml` |
| Vercel deployment config             | ✅     | `vercel.json` |
| CSP · HSTS · headers de seguridad   | ✅     | `vercel.json` headers |
| Robots / sitemap base               | ✅     | `public/robots.txt` |
| Runbook + arquitectura documentada  | ✅     | `docs/RUNBOOK.md`, `docs/ARCHITECTURE.md` |

## Pendiente (requiere infra externa o decisiones de producto)

| Tema                         | Bloqueo                                   |
|------------------------------|-------------------------------------------|
| Sentry / PostHog wired       | Requiere DSN / project key del usuario    |
| mTLS / service mesh          | Requiere Kubernetes/Istio; fuera de Pages |
| Event bus con DLQ + replay   | Requiere Kafka/NATS dedicado              |
| Schema Registry              | Decisión de plataforma (Confluent, etc.)  |
| Chaos / load testing         | Requiere entorno staging dedicado         |
| Firma criptográfica docs     | Requiere KMS + decisión de algoritmo      |
| Cobertura 80% real           | Trabajo humano sostenido por dominio      |
| Turnstile en endpoints       | Evaluar alternativa (reCAPTCHA, hCaptcha) |

## Próximos pasos sugeridos

1. Crear cuentas Sentry + PostHog → poner DSN/keys en Vercel Environment Variables.
2. Auditar las 8 migraciones SQL: eliminar políticas `USING (true)` salvo justificación.
3. Migrar whitelist admin a tabla `user_roles` con `has_role()`.
4. Reemplazar `console.*` por `logger.*` con codemod (`npx jscodeshift -t scripts/console-to-logger.ts src`).
5. Añadir Playwright E2E para flows: login, IA chat, mapa, admin CRUD.
