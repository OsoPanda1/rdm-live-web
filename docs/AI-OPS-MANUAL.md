# Manual Operativo AI→AI — Saneo y Completado del Sistema RDM Digital LTOS

Este manual contiene instrucciones precisas para que una IA (claude, copilot, etc.) con acceso al repositorio pueda iterar mediante PRs, tareas o scripts automatizados. Cada bloque es autocontenido: define objetivo, alcance, pasos concretos y criterios de cierre verificables.

---

## BLOQUE 0 — Contexto y Misión

### Objetivo global
Transformar RDM Digital LTOS de un proyecto avanzado pero con deuda técnica en una base sólida de producción, lista para auditorías, seguridad y escalado (incluyendo el sistema ciberfísico Nodo Cero).

### Alcance total
| Capa | Rutas clave |
|------|-------------|
| Frontend React | `src/` (~530+ archivos) |
| Isabella AI System | `src/isabella/` (32 archivos) |
| Backend Express | `server/` (83 archivos, 29 rutas, 37 servicios) |
| Supabase + Edge Functions | `supabase/` (38 archivos, 19 functions) |
| CI/CD | `.github/workflows/` (3 pipelines) |
| Sistema ciberfísico | `node-core/`, `hardware/`, `api/` |
| Documentación | `docs/` (14 archivos), `SECURITY.md`, `CHECKLIST.md`, `ROADMAP.md` |

### Principios operativos
1. **Un cambio por bloque** — cada bloque genera un PR independiente.
2. **Gate de CI obligatorio** — ningún PR se mergea si `npm run typecheck`, `npm run lint`, `npm test` o `npm run build` fallan.
3. **No cambiar lógica de negocio** — solo tipado, tests, limpieza y documentación. Cero refactors funcionales.
4. **Evidencia sobre opinión** — si un cambio requiere decisión de producto, marcarlo y pasar al siguiente ítem.
5. **Progresión por prioridad** — P0 → P1 → P2 → P3 → P4.

---

## BLOQUE 1 — Tipado y Eliminación de `@ts-nocheck`

**Prioridad**: P0 | **Esfuerzo estimado**: Alto (varios PRs) | **Dependencias**: Ninguna

### Diagnóstico
- **50 archivos** con `@ts-nocheck` deshabilitan TypeScript completamente
- **~35+ usos de `any`** en páginas, componentes, stores y módulos core
- Módulos críticos (Isabella pipeline, core AI, data territorial) sin verificación de tipos

### Objetivo
Reducir `@ts-nocheck` a <10% de los archivos (~5 archivos justificados). Eliminar `any`s peligrosos.

### Inventario inicial (generado automáticamente)

```
Comando para obtener lista actual:
rg "@ts-nocheck" src/ --files-with-matches | sort
rg "\Wany\W" src/ --include "*.ts" --include "*.tsx" -c | sort -t: -k2 -rn
```

### Plan de tipado progresivo

#### Grupo 1 — Isabella + Core AI (PR-1)
**Archivos**: `src/isabella/pipeline/`, `src/isabella/skills/`, `src/isabella/ontology/`, `src/isabella/protocols/`, `src/isabella/territorial/`, `src/core/ai/`
**Pasos**:
1. Por cada archivo, remover `// @ts-nocheck` de la línea 1.
2. Ejecutar `npx tsc -p tsconfig.app.json --noEmit` y capturar errores.
3. Definir interfaz mínima para cada error (ej: parámetros de funciones, props de componentes).
4. NO cambiar lógica — solo añadir tipos ausentes o corregir casts incorrectos.
5. Si un error requiere cambiar el comportamiento, rodear con `// @ts-expect-error -- razón documentada`.
6. Iterar hasta `npm run typecheck` pase limpio.
**Criterio de cierre**: 0 errores de typecheck en estos módulos. Los 5 archivos de Isabella ya no tienen `@ts-nocheck`.

#### Grupo 2 — Data Atlas y Territorial (PR-2)
**Archivos**: `src/data/atlas/*`, `src/data/imported/*` (26 archivos)
**Pasos**:
1. Analizar estructura de datos real en cada archivo (arrays de objetos con campos conocidos).
2. Crear tipos compartidos en `src/data/types.ts` para: `TerritorialEntry`, `AtlasEntry`, `BusinessData`, `Coordinate`, etc.
3. Aplicar tipos en lugar de `any`.
4. Para datos importados de otros repos: mantener `@ts-nocheck` solo si el schema es inestable, pero documentar por qué.
**Criterio de cierre**: Máximo 5 archivos en `data/` mantienen `@ts-nocheck`, cada uno con comentario justificatorio.

#### Grupo 3 — Componentes y Páginas (PR-3)
**Archivos**: `src/components/ExplorerView.tsx`, `src/components/DashboardView.tsx`, `src/components/TerritorialMap.tsx`, `src/components/RDMInteractiveMap.tsx`, `src/components/*.tsx` con `@ts-nocheck` (10 archivos), `src/pages/Rutas.tsx`, `src/pages/MetaverseHome.tsx`, `src/pages/AtlasMaximus.tsx`
**Pasos**:
1. Remover `@ts-nocheck`.
2. Definir tipos para props usando las interfazes ya existentes en `src/types/`, `src/lib/types.ts` o creando nuevas.
3. Reemplazar `useRef<any>`, `useState<any>` con tipos concretos (`useRef<HTMLDivElement>`, `useState<BusinessData[]>`).
4. Reemplazar `(item: any)` en callbacks de `.map()` con el tipo real.
5. Usar `Record<string, unknown>` como último recurso — nunca `any`.
**Criterio de cierre**: Todos los componentes y páginas principales pasan typecheck. Solo componentes triviales o legacy retienen `@ts-nocheck`.

### Reglas de estilo para nuevos tipos
```typescript
// ✅ Bueno — tipo explícito
interface AtlasChapter {
  id: string
  title: string
  entries: TerritorialEntry[]
}

// ✅ Aceptable — genérico con límite
function processItems(items: Record<string, unknown>): void

// ❌ Prohibido
function processItems(items: any): void
const [state, setState] = useState<any>(null)
```

---

## BLOQUE 2 — Tests Unitarios Frontend

**Prioridad**: P0 | **Esfuerzo**: 2-3 días | **Dependencias**: BLOQUE 1 (tipado limpio)

### Diagnóstico
- Setup de testing existe (`src/test/setup.ts` con `@testing-library/jest-dom`)
- Solo 1 test trivial (`src/test/example.test.ts`)
- 0 tests para 115+ componentes y 15 hooks

### Objetivo
Crear ~20 tests significativos para componentes y hooks críticos.

### Targets priorizados

| Target | Archivo | Tests a escribir |
|--------|---------|-----------------|
| **Hook useIsabella** | `src/hooks/useIsabella.ts` | 3 tests: inicialización, envío de mensaje, cambio de estado emocional |
| **Hook useAuth** | `src/hooks/useAuth.tsx` | 2 tests: sesión activa, sesión nula |
| **Hook useWebSocket** | `src/hooks/useWebSocket.ts` | 2 tests: conexión, reconexión |
| **Componente RDMNavbar** | `src/components/rdm/RDMNavbar.tsx` | 2 tests: render básico, navegación |
| **Componente RDMHero** | `src/components/rdm/RDMHero.tsx` | 2 tests: render con props, fallback |
| **TerritorialMap** | `src/components/TerritorialMap.tsx` | 2 tests: render con datos, estado vacío |
| **IsabellaChat** | `src/components/isabella/IsabellaChat.tsx` | 2 tests: render inicial, envío de query |
| **SmartSidebar** | `src/components/SmartSidebar.tsx` | 2 tests: render con secciones, toggle |
| **SearchOverlay** | `src/components/SearchOverlay.tsx` | 2 tests: búsqueda, resultados vacíos |
| **RealitoChatLauncher** | `src/components/RealitoChatLauncher.tsx` | 1 test: render y click |

### Template para cada test
```typescript
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

describe("ComponentName", () => {
  it("renderiza el estado base", () => {
    render(<ComponentName />)
    expect(screen.getByRole("heading")).toBeDefined()
  })

  it("maneja estado vacío", () => {
    render(<ComponentName items={[]} />)
    expect(screen.getByText(/no hay/i)).toBeDefined()
  })
})
```

### Integración CI
Verificar que `ci.yml` incluya:
```yaml
- name: Unit tests
  run: npm run test:unit
```
Antes del job `quality`. Si falla, cancelar el pipeline.

### Criterio de cierre
- `npm run test:unit` reporta ≥20 tests pasando
- Cobertura de hooks principales (useIsabella, useAuth, useWebSocket)
- CI bloquea merge si tests fallan

---

## BLOQUE 3 — Limpieza de `packages/`, `services/`, Directorios Vacíos

**Prioridad**: P1 (packages/services) + P3 (dirs vacíos) | **Esfuerzo**: 1 día | **Dependencias**: Ninguna

### Diagnóstico
- `packages/`: NO EXISTE pero referenciado en ARCHITECTURE.md, STATUS.md, `tools/rdmx-sync.ts`
- `services/`: NO EXISTE como top-level (existe como `server/src/services/`)
- `tools/deploy/`: Vacío
- `tools/prompt_quality/`: Vacío

### Acciones

#### 1. Armonizar documentación
Editar `docs/ARCHITECTURE.md`:
- Reemplazar tabla de dominios con la realidad actual (src/, server/, supabase/)
- Añadir sección "Futuro: packages/ y services/" al final

Editar `docs/STATUS.md`:
- Eliminar tabla de aliases/etapas que no existen
- Reemplazar con estado real de módulos

Editar `tools/rdmx-sync.ts`:
- Añadir comentario al inicio: `// NOTA: Los submodulos packages/ no estan inicializados. Ejecutar 'git submodule update --init --recursive' cuando se necesiten.`

#### 2. Poblar o eliminar directorios vacíos

**tools/deploy/** — crear `README.md`:
```markdown
# Deploy Scripts

Esta carpeta contendra scripts de despliegue automatizado.
Actualmente:
- Vercel deploy via CI (.github/workflows/ci.yml)
- Pendiente: script de deploy manual para entornos de staging
```

**tools/prompt_quality/** — si no hay plan de uso:
```bash
# Eliminar directorio vacío
rmdir tools\prompt_quality
```
Si hay plan, crear `README.md` con la intención.

#### 3. Verificar consistencia
```bash
# Buscar referencias fantasma
rg "packages/" docs/ --glob "*.md"
rg "services/" docs/ --glob "*.md" | rg -v "server/src/services"
```

### Criterio de cierre
- `packages/` y `services/` ya no aparecen como existentes en docs
- `tools/` sin directorios vacíos
- `tools/rdmx-sync.ts` tiene nota aclaratoria

---

## BLOQUE 4 — Placeholders y Console.log

**Prioridad**: P1 (placeholders) + P2 (console.log) | **Esfuerzo**: 1 día | **Dependencias**: Ninguna

### Diagnóstico

| Tipo | Ubicación | Problema |
|------|-----------|----------|
| Placeholder SVG | `modules/Marketplace.tsx`, `GaleriaArte.tsx`, `UniversityTAMV.tsx` | 22 referencias a `/placeholder.svg` |
| Mock data | `MetaverseHome.tsx` | mockStories, mockVideos, mockPosts |
| URL placeholder | `BlockchainConnector.ts` | Infura URL falsa |
| URL placeholder | `ExternalNetworksConnector.ts` | Discord webhook placeholder |
| console.log | 8 archivos (server, supabase, serverless) | 11 instancias |

### Acciones

#### 1. Placeholder images
Estrategia: no reemplazar con imágenes reales (requiere assets), sino mejorar el UX:
```typescript
// ANTES
<img src="/placeholder.svg" alt={title} />

// DESPUES
<div className="bg-muted rounded-md flex items-center justify-center h-48">
  <span className="text-muted-foreground">{title}</span>
</div>
```
O usar un componente `AssetPlaceholder`:
```tsx
function AssetPlaceholder({ label }: { label: string }) {
  return (
    <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg p-4 text-center">
      <p className="text-amber-800 text-sm font-medium">{label}</p>
      <p className="text-amber-600 text-xs">Próximamente</p>
    </div>
  )
}
```

#### 2. Mock data en MetaverseHome
- Envolver en feature flag: `if (import.meta.env.VITE_USE_MOCK_DATA === "true")`
- O reemplazar con fetch real a Supabase si la tabla existe
- Si no hay datos reales, mostrar "No hay contenido disponible" en lugar de mocks

#### 3. URLs placeholder en seguridad
```typescript
// BlockchainConnector.ts
const INFURA_URL = import.meta.env.VITE_INFURA_URL
if (!INFURA_URL) {
  logger.warn("[Blockchain] Infura URL not configured — module disabled")
  this.enabled = false
  return
}
```

```typescript
// ExternalNetworksConnector.ts
const WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL
if (!WEBHOOK_URL) {
  logger.warn("[ExternalNetworks] Discord webhook not configured — module disabled")
  this.enabled = false
  return
}
```

#### 4. Console.log → logger
Usar el logger existente (`src/lib/logger.ts`):
```typescript
import { logger } from "@/lib/logger"

// ANTES
console.log("[AUDIT]", record.action, record.hash)

// DESPUES
logger.info("[AUDIT]", { action: record.action, hash: record.hash })
```

Archivos a modificar:
- `server/src/index.ts` (5 instancias)
- `server/src/core/decision-store.ts` (1)
- `server/src/services/chronus.engine.ts` (1)
- `server/src/middleware/http.ts` (1)
- `serverless/autoRemediate.ts` (2)
- `supabase/functions/stripe-webhook/index.ts` (1)

Para server/ y supabase/, usar `console.log` con `// eslint-disable-next-line no-console` si no hay logger disponible; en server/ hay logger en `src/lib/`.

### Criterio de cierre
- 0 referencias a `/placeholder.svg` en componentes visibles
- 0 URLs placeholder en módulos de seguridad
- 0 `console.log` en código de producción (solo logger)
- `git grep "placeholder\|console.log" src/ --include "*.ts" --include "*.tsx" | grep -v test | grep -v node_modules` produce 0 resultados

---

## BLOQUE 5 — Documentación Operativa y Checklist

**Prioridad**: P2 | **Esfuerzo**: 2 días | **Dependencias**: Bloques 1-4 (para docs precisos)

### CHECKLIST ítems pendientes (15 total)

| ID | Ítem | Acción |
|----|------|--------|
| B-05 | Verificar npm install limpio | Crear script `scripts/verify-lockfile.sh` |
| D-08 | Documentar deploy Vercel | Crear `docs/DEPLOY.md` |
| D-09 | Documentar secrets | Crear `docs/SECRETS.md` |
| D-11 | Documentar Edge Functions | Crear `docs/EDGE-FUNCTIONS.md` |
| D-12 | Documentar CSP | Crear `docs/CSP.md` |
| D-13 | Guía onboarding | Crear `docs/ONBOARDING.md` |
| D-14 | Enlazar desde README | Editar README.md |
| D-15 | Limpiar dependencias | Ejecutar `npm depcheck` |
| H-01 | postinstall script | Crear en package.json |
| H-02 | Revisar "anonymous" en routes | Buscar y reemplazar |
| H-03 | Rate limiting Edge Functions | Implementar |
| H-04 | Health check CI | Añadir step en ci.yml |
| H-05 | Verificación build artefacto | Añadir step en ci.yml |
| H-06 | CSP dinámica | Implementar middleware |
| H-07 | Alternativa Turnstile | Evaluar e informar |

### Documentos a crear

#### `docs/DEPLOY.md`
```markdown
# Deploy — Vercel

## Automático (recomendado)
1. Push a `main` → CI ejecuta lint, typecheck, tests, build
2. Vercel deploya preview automáticamente
3. Merge PR → deploy a producción

## Manual
1. `npm run build`
2. `npx vercel --prod`

## Secrets requeridos
Ver `docs/SECRETS.md`
```

#### `docs/SECRETS.md`
Lista completa de secrets de Vercel:
| Variable | Origen | Uso |
|----------|--------|-----|
| `VITE_SUPABASE_URL` | Supabase dashboard | Cliente Supabase |
| `VITE_SUPABASE_ANON_KEY` | Supabase dashboard | Cliente Supabase anónimo |
| ... | ... | ... |

#### `docs/ONBOARDING.md`
```markdown
# Onboarding — Nuevo Desarrollador

## Requisitos
- Node.js ≥20
- npm ≥10

## Instalación
1. `git clone <repo>`
2. `npm install --legacy-peer-deps`
3. `cp .env.example .env` (llenar variables)
4. `npm run dev`

## Scripts principales
| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Build producción |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm test` | Tests unitarios |
| `npm run e2e` | Tests E2E |

## Estructura del proyecto
(árbol resumido)
```

### Script postinstall
En `package.json`:
```json
"scripts": {
  "postinstall": "node scripts/verify-lockfile.mjs"
}
```
```javascript
// scripts/verify-lockfile.mjs
import { existsSync, readFileSync } from "fs"
const lockfiles = ["package-lock.json", "yarn.lock", "pnpm-lock.yaml"]
const found = lockfiles.filter(f => existsSync(f))
if (found.length > 1) {
  console.error(`ERROR: ${found.length} lockfiles encontrados. Debe haber solo 1.`)
  process.exit(1)
}
```

### Criterio de cierre
- CHECKLIST.md: 15/15 ítems completados
- README.md enlaza a DEPLOY.md, SECRETS.md, ONBOARDING.md
- `npm run postinstall` funciona sin errores

---

## BLOQUE 6 — Seguridad y Roadmap Waves

**Prioridad**: P2 | **Esfuerzo**: 2 días | **Dependencias**: BLOQUE 5 (secrets documentados)

### Wave 2 — Seguridad P0

#### Acción 1: Revisar .env.example
```bash
# Buscar keys hardcodeadas
rg "sk-" .env.example         # Stripe secret key
rg "AIza" .env.example        # Google API key
rg "VITE_GEMINI" .env.example # Gemini key
```
Si aparecen, reemplazar con `your_key_here`.

#### Acción 2: Fix 401 en isabella-ai
Buscar en `src/app/api/isabella/`:
```typescript
// ANTES (permite anonymous)
const { data, error } = await supabase.from("isabella_logs").insert({...})

// DESPUES (requiere JWT)
const { data, error } = await supabase.from("isabella_logs").insert({
  ...payload,
  user_id: session.user.id, // forzar user_id
})
```

### Wave 3 — Hardening CI

#### Configurar secrets Vercel
En GitHub → Settings → Secrets and variables → Actions:
```
VERCEL_TOKEN=<token de Vercel>
VERCEL_ORG_ID=<id de org>
VERCEL_PROJECT_ID=<id de proyecto>
```

En `.github/workflows/ci.yml`:
```yaml
- name: Deploy to Vercel
  if: github.ref == 'refs/heads/main'
  run: npx vercel --token=${{ secrets.VERCEL_TOKEN }} --prod
```

### Wave 4 — Auth de Isabella (Edge Functions)

#### Reemplazar "anonymous"
```bash
rg "\"anonymous\"" src/app/ --files-with-matches
```
Por cada archivo, reemplazar con:
```typescript
const authHeader = request.headers.get("Authorization")
if (!authHeader?.startsWith("Bearer ")) {
  return new Response("Unauthorized", { status: 401 })
}
const jwt = authHeader.slice(7)
// validar JWT...
```

#### Rate limiting
En `server/src/middleware/rateLimit.ts` ya existe. Para Edge Functions de Supabase, usar tabla `rate_limits` con upsert y expiry.

### Wave 5 — Documentación

#### CSP dinámica
```typescript
// src/lib/csp.ts
export function getCSP(env: string): string {
  const base = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  if (env === "development") {
    return `${base}; connect-src 'self' ws://localhost:*`
  }
  return `${base}; connect-src 'self' https://*.supabase.co`
}
```

### Criterio de cierre
- ROADMAP.md: Waves 2-5 marcadas como completadas ✅
- 0 keys hardcodeadas en .env.example
- Edge Functions requieren JWT (no "anonymous")
- CSP dinámica implementada
- Rate limiting activo en endpoints públicos

---

## BLOQUE 7 — Sistema Ciberfísico y Pruebas en Hardware

**Prioridad**: P4 | **Esfuerzo**: Variable | **Dependencias**: Hardware físico

### Diagnóstico
- `node-core/server_core.py` — implementado pero no probado en hardware real
- `hardware/pov_engine.ino` — firmware listo, requiere validación en Arduino
- `api/telemetry.js` — Edge Function creada, no desplegada

### Acciones

#### 1. Validar server_core.py
```bash
# Verificar sintaxis
python -m py_compile node-core/server_core.py

# Verificar dependencias
pip install -r node-core/requirements.txt  # crear si no existe
```

Crear `node-core/requirements.txt`:
```
fastapi[standard]
uvicorn[standard]
websockets
pyserial
psutil
httpx
```

#### 2. Firmware POV — revisión estática
```bash
# Verificar compilación (requiere Arduino CLI)
arduino-cli compile --fqbn arduino:megaavr:nona4809 hardware/pov_engine.ino
```
Si Arduino CLI no está disponible, revisión manual:
- Variables globales volátiles correctas
- Interrupción y main loop sin bloqueos
- Buffer de serial con protección de overflow

#### 3. Desplegar Edge Function
```bash
# Despliegue manual a Vercel
npx vercel deploy api/telemetry.js

# Verificar
curl https://<domain>/api/telemetry
# → {"service":"nodo-cero-telemetry","status":"operational",...}
```

#### 4. Manual de prueba hardware
Crear `docs/HARDWARE-TESTING.md`:
```markdown
# Pruebas de Hardware — Nodo Cero

## Equipo necesario
- Arduino Mega 2560
- LED matrix P10 (32x16) o tira LED personalizada
- Cable USB
- PC con Python 3.11+ y Node.js 20+

## Checklist de prueba
1. [ ] Cargar firmware: `arduino-cli compile --upload ...`
2. [ ] Monitor serie: `python -m serial.tools.miniterm COM3 115200`
3. [ ] Respuesta: `{"status":"ready","device":"pov_engine"}`
4. [ ] Enviar comando: `{"cmd":"display","text":"HOLA","effect":"scroll"}`
5. [ ] Ver display: texto "HOLA" scroll horizontal
6. [ ] Iniciar server_core.py: `python node-core/server_core.py`
7. [ ] Health check: `curl http://localhost:8090/health`
8. [ ] Telemetry push: esperar 10s → display muestra métricas
9. [ ] POST telemetría: `curl -X POST .../api/telemetry`
10. [ ] WS: conectar a `ws://localhost:8090/ws/telemetry`
```

### Criterio de cierre
- `server_core.py` compila y responde a health check
- `pov_engine.ino` compila para target Arduino Mega
- `api/telemetry.js` desplegado y responde 200
- Documento HARDWARE-TESTING.md creado con checklist funcional

---

## BLOQUE 8 — Validación Final y Cierre

**Prioridad**: P0 (validación) | **Esfuerzo**: 4 horas | **Dependencias**: Bloques 1-7

### Gate de CI final
```bash
# Ejecutar toda la batería
npm run lint           # → 0 errores
npm run typecheck      # → 0 errores  
npm run test:unit      # → ≥20 tests pasando
npm run test           # → all tests pass
npm run build          # → build exitoso
```

### Verificaciones de regresión
- `git diff --stat` revisar que solo se modificaron archivos esperados
- `npm run preview` y probar navegación manual en rutas críticas
- `npm run e2e` confirmar que los 6 tests E2E pasan

### Artefactos de cierre
1. PR-1: Tipado Isabella + Core AI ✅
2. PR-2: Tipado Data Atlas + Territorial ✅
3. PR-3: Tipado Componentes + Páginas ✅
4. PR-4: Tests unitarios frontend ✅
5. PR-5: Limpieza packages/ + directorios vacíos ✅
6. PR-6: Placeholders + console.log ✅
7. PR-7: Documentación operativa + CHECKLIST ✅
8. PR-8: Seguridad + Roadmap Waves ✅
9. PR-9: Sistema ciberfísico + hardware testing ✅

### Post-merge
- Push a `main` → CI completo (lint → typecheck → test → build → E2E → deploy)
- Verificar deploy en producción (`www.visitarealdelmonte.online`)
- Monitorear Sentry/PostHog primeras 24h
- Abrir issues para cualquier regresión detectada

---

## Apéndice A — Comandos Útiles

```bash
# Inventario @ts-nocheck
rg "@ts-nocheck" src/ --files-with-matches | wc -l

# Inventario any
rg "\Wany\W" src/ --include "*.ts" --include "*.tsx" -c

# Inventario console.log
rg "console\.\(log\|warn\|error\)" src/ --include "*.ts" --include "*.tsx"

# Inventario placeholder
rg "placeholder" src/ --include "*.ts" --include "*.tsx"

# Verificar lockfile único
ls package-lock.json yarn.lock pnpm-lock.yaml 2>/dev/null | wc -l

# Buscar "anonymous" en API routes
rg "\"anonymous\"" src/app/ -n
```

## Apéndice B — Plantilla de PR

```markdown
## Descripción
Bloque X del AI-OPS-MANUAL: [nombre del bloque]

## Cambios
- [lista de cambios principales]

## Verificación
- [ ] `npm run typecheck` — sin errores
- [ ] `npm run lint` — sin errores
- [ ] `npm test` — todos pasan
- [ ] `npm run build` — build exitoso
- [ ] No se modificó lógica de negocio

## Checklist del manual
- [ ] Criterios de cierre del bloque cumplidos
- [ ] Documentación actualizada
- [ ] Sin regresiones introducidas
```
