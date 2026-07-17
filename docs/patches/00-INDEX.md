# Índice maestro de parches — RDM Digital Hub

> Todos los parches son **independientes**. Puedes aplicarlos en paralelo, en cualquier orden dentro de la misma fase, sin conflictos entre archivos (cada parche toca archivos distintos salvo donde se indica).
> Comando genérico: `git apply --3way docs/patches/<archivo>.patch` (o copiar los bloques manualmente si tu agente local prefiere edición dirigida).

| # | Paquete | Fase | Módulo | Riesgo si NO se aplica | AH estimado |
|---|---------|------|--------|------------------------|-------------|
| 01 | `01-auth-isabella.patch.md` | 2 · Errores críticos | Auth + IA edge | **Crítico** — bypass de auth, fuga de API key Gemini, drift de naming | 0.5 |
| 02 | `02-build-vercel.patch.md` | 7 · Optimización Vercel | Build/Infra | **Crítico** — build inestable, `vite: ^8` fantasma, Sentry/PostHog crash en runtime | 0.5 |
| 03 | `03-stripe-hardening.patch.md` | 4 · Hardening | Payments | **Alto** — webhooks falsificables, doble cobro, stack traces expuestos | 1.0 |
| 04 | `04-rls-ci-gate.patch.md` | 4 · Hardening | Supabase | **Alto** — tablas sin RLS, políticas `USING (true)` sin detección automática | 0.5 |
| 05 | `05-headers-csp.patch.md` | 6 · Seguridad OWASP | Vercel headers | **Alto** — XSS escala a robo de sesión sin CSP | 0.3 |

**Total:** ~2.8 AH aplicables en paralelo → ~1 AH real si tu CI tiene 3+ runners.

## Orden de commit sugerido (para PRs revisables)

1. **PR-A: Infra estable** → parches 02 + 04. Desbloquea CI verde antes de tocar código.
2. **PR-B: Seguridad crítica** → parches 01 + 03 + 05. Requiere que PR-A ya esté en `main` para que el CI del RLS gate valide correctamente.

## Formato de reporte por parche

Cada archivo `.patch.md` sigue esta estructura estricta:

```
## Archivo: <ruta>
- **Problema:** ...
- **Impacto:** ...
- **Riesgo:** crítico|alto|medio|bajo
- **Solución:** ...
- **Motivo:** ...
- **Resultado esperado:** ...
- **Efectos secundarios / QA:** ...

```diff
<unified diff>
```
```

## Fases NO incluidas en esta tanda (próxima iteración)

Para no reventar el presupuesto de créditos, estas fases quedan para sesiones posteriores enfocadas:

- **Fase 3 · Refactor** — activar `strict: true` incremental en `src/isabella/`, `src/core/`, `src/kernel/`. Requiere análisis archivo-por-archivo.
- **Fase 5 · Performance** — split de providers/overlays en `App.tsx`, `requestIdleCallback` para PostHog/SpeedInsights, auditoría de `vendor-three`.
- **Fase 6 · OWASP full sweep** — post-CSP: rate limit por-IP en 19 edge functions, rotación de secrets, secrets scanning en pre-commit.
- **Fase 8 · Docs** — fragmentar README de 35KB en `docs/architecture.md`, `docs/deployment.md`, `docs/security.md`, `docs/contributing.md`.
