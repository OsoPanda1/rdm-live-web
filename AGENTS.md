# AGENTS.md — Session State

## Objective
- "Protocolo de Congelamiento por Fases" — audit, test, freeze every module, then deploy OsoPanda1/rdm-digital-hub-ldtocs to Vercel production

## Completed Phases
- **Fase 0 — Fixes de deploy**: `define: { "process.env": {} }` en vite.config.ts, `Buffer` reemplazado en middleware, `api/yun-be.ts` standalone, CORS production, rate-limit exports, JS/TS duplicados eliminados
- **Fase 1 — YUN + YUN BE**: 18 archivos core auditados, 67 tests en `yun-core.test.ts`, todos pasan
- **Fase 2a — DB Core**: 18 archivos auditados; `augment.d.ts` corregido, `admin.server.ts` eliminado, `prisma/schema.yunbe.prisma` eliminado, `.env` placeholder warning, `env.ts` detecta placeholders
- **Fase 2b — Data Gateway**: 17 archivos auditados; bugs corregidos (XP multiplier, evaluateAndReward signature, avatar non-null assertion, getSource non-null assertion, CattleyaBenefits types, setGuardian cast); 38 tests escritos y pasando
- **Fase 2c — FederationBus**: 3 archivos auditados (FederationBus.ts, territorial-federation-bridge.ts, event-bus-bridge.ts); 35 tests escritos y pasando

## Next Phase
- **Fase 3 — Isabella**: audit + tests

## Test Commands
- Data Gateway: `npx vitest run --config vitest.data-gateway.config.ts`
- YUN Core: `npx vitest run --config vitest.yun-core.config.ts`

## Remote
- `ldtocs` → `git@github.com:OsoPanda1/rdm-digital-hub-ldtocs.git`
