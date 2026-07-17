# Manual de Remediación y Migración a Open Science AI

**Meta-documento de referencia · RDM Digital Hub · LDTOCS**

> Ningún cambio se hace "a ojo". Todo se documenta, se prueba y se puede reproducir.

---

## Índice

1. [Propósito del manual](#1-propósito-del-manual)
2. [Remediación P0 · Críticos](#2-remediación-p0--críticos)
   - 2.1 Auth Isabella (Parche 01)
   - 2.2 Build stability (Parche 02)
   - 2.3 Stripe hardening (Parche 03)
3. [Remediación P1 · Altos](#3-remediación-p1--altos)
   - 3.1 RLS CI gate (Parche 04)
   - 3.2 Rate limiting por IP en Edge Functions
   - 3.3 Directorios packages/, services/, apps/
   - 3.4 TypeScript strict
   - 3.5 Health check post-deploy
4. [Remediación P2 · Medios](#4-remediación-p2--medios)
   - 4.1 Cloud TTS real — tts-isabella
   - 4.2 Bucket isabella-voice-cache
   - 4.3 Tabla isabella_voice_logs
   - 4.4 Cola de audio useIsabellaAudioQueue
   - 4.5 Tests y assets
5. [Mejores prácticas P3 · Expansión](#5-mejores-prácticas-p3--expansión)
6. [Manual de migración: de Gemini a modelos de ciencia abierta](#6-manual-de-migración-de-gemini-a-modelos-de-ciencia-abierta)
   - 6.1 Principios de Open Science AI
   - 6.2 Arquitectura de Model Router
   - 6.3 Fases de migración
   - 6.4 Documentación de modelos
7. [Cierre del manual](#7-cierre-del-manual)

---

## 1. Propósito del manual

Este manual define:

- **Cómo corregir** los puntos críticos, altos, medios y bajos identificados (P0–P3).
- **Cómo completar** lo que falta: parches sin aplicar, tablas sin crear, buckets sin configurar, hooks sin implementar, tests sin escribir.
- **Cómo transformar** el uso actual de Gemini en una arquitectura de modelos abiertos compatible con LDTOCS y con principios de Open Science y reproducibilidad.

Cada sección contiene pasos concretos, verificables y ordenados por prioridad. No hay ambigüedad: al final de cada bloque hay un criterio de cierre explícito.

---

## 2. Remediación P0 · Críticos

### 2.1 Auth Isabella (Parche 01)

**Objetivo:** impedir bypass anónimo no deseado, asegurar 401 en bearer inválido y eliminar cualquier fuga de secretos (incluidas claves de modelos futuros).

**Archivos afectados:**
- `supabase/functions/isabella-ai/index.ts`
- `supabase/functions/realito-chat/index.ts`
- `supabase/functions/tts-isabella/index.ts`

**Pasos:**

1. **Validación estricta de JWT en todas las Edge Functions de IA**
   - Extraer JWT del header `Authorization: Bearer <token>`.
   - Verificar token con `supabase.auth.getUser()`.
   - Si `userData?.user?.id` es falsy → retornar `401`.
   - Rama "anónima" solo si existe RFC que la autorice explícitamente (ej. modo demo con rate limiting agresivo).

2. **CORS con allowlist explícita**
   ```ts
   const ALLOWED_ORIGINS = [
     "https://www.visitarealdelmonte.online",
     "https://visitarealdelmonte.online",
     "https://real-del-monte-digital-hub.vercel.app",
     ...(Deno.env.get("ENV") === "development"
       ? ["http://localhost:5173", "http://localhost:8080"]
       : []),
   ];
   ```

3. **Eliminar cualquier uso de `VITE_GEMINI_API_KEY`**
   - Las claves de modelos pasan a estar siempre en variables server-side (`GEMINI_API_KEY`, `OPEN_SOURCE_MODEL_API_KEY`, etc.), **nunca prefijadas con `VITE_`**.
   - Verificar con `npm run build` que ninguna clave aparece en el bundle minificado.

4. **Unificar naming de secrets**
   - Usar una sola variable `GEMINI_API_KEY` en todas las Edge Functions (eliminar `GOOGLE_GENAI_API_KEY`).

**Criterio de cierre:**
- Sin JWT → 401.
- JWT inválido → 401.
- JWT válido → 200.
- `grep -r "VITE_GEMINI" src/ supabase/` → 0 resultados.
- Bundle minificado sin claves.

---

### 2.2 Build stability (Parche 02)

**Objetivo:** que el proyecto construya de manera estable en todas las ramas, sin depender de cambios implícitos de Vite ni de paquetes externos mal resueltos.

**Archivos afectados:**
- `package.json`
- `vite.config.ts`
- `.github/workflows/ci.yml`

**Pasos:**

1. **Version lock de Vite y dependencias de build**
   - En `package.json`, fijar `"vite": "8.1.0"` sin `^`.
   - Fijar versiones de plugins críticos: `@vitejs/plugin-react-swc`, `tailwindcss`, `postcss`.

2. **Configurar `rollupOptions.external` para Sentry y PostHog**
   - Evitar que librerías de observabilidad inflen o rompan el bundle del frontend.
   - Solo incluir lo necesario en el cliente (`@sentry/browser-utils`, `posthog-js`); el resto vía Edge Functions.

3. **CI específico de build**
   - Workflow `ci.yml` debe incluir paso de build explícito después de `npm ci`.
   - Fallar si hay warnings críticos o cambios de versión no esperados.
   - Verificar que `dist/` no contenga archivos con extensión `.map` en producción.

**Criterio de cierre:**
- `npm run build` exitoso en CI.
- Bundle sin Sentry/PostHog del lado servidor.
- Sin source maps en producción.

---

### 2.3 Stripe hardening (Parche 03)

**Objetivo:** impedir webhooks falsificados, asegurar idempotencia y evitar errores que exponen lógica interna.

**Archivos afectados:**
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/create-commerce-checkout/index.ts`
- `supabase/functions/create-premium-checkout/index.ts`
- `supabase/migrations/*stripe_events*`

**Pasos:**

1. **Verificación de firma en stripe-webhook**
   - Usar `stripe.webhooks.constructEventAsync` con `STRIPE_WEBHOOK_SECRET`.
   - Cualquier evento sin firma válida → 400.

2. **Idempotencia vía tabla `stripe_events`**
   - La tabla debe registrar: `event_id` (unique), `type`, `created_at`, `processed_at`.
   - Flujo: si `event_id` ya existe y `processed_at` no es nulo → skip.
   - Si es nuevo → ejecutar lógica de negocio y marcar `processed_at`.

3. **Safe errors**
   - Capturar excepciones y devolver `"Webhook processing error"` sin stack trace.
   - Log detallado solo en Sentry.

**Criterio de cierre:**
- Stripe CLI test: firma inválida → 400.
- Stripe CLI test: evento duplicado → 200 sin ejecutar lógica.
- Stripe CLI test: evento válido → 200 con ejecución.
- Respuesta HTTP sin stack traces.

---

## 3. Remediación P1 · Altos

### 3.1 RLS CI gate (Parche 04)

**Objetivo:** que RLS se verifique automáticamente en cada cambio de base de datos.

**Archivos afectados:**
- `supabase/migrations/`
- `.github/workflows/rls-ci-gate.yml` (nuevo)
- `scripts/audit-rls.sql` (nuevo)

**Pasos:**

1. **Crear script `scripts/audit-rls.sql`**
   - Recorrer todas las tablas de Supabase y validar:
     - RLS habilitado (`relrowsecurity = true`).
     - Políticas definidas por rol (`anon`, `authenticated`, `service_role`).
     - Tablas sensibles sin acceso público (`rate_limits`, `stripe_events`, `audit_log`, `isabella_voice_logs`).

2. **Crear GitHub Action `rls-ci-gate.yml`**
   - Se ejecuta tras cada migración SQL.
   - Conecta a la base de datos de preview/staging y ejecuta el script de auditoría.
   - Si una tabla nueva no tiene RLS → pipeline falla.

3. **Actualizar documentación**
   - `docs/ROADMAP.md`: marcar "RLS CI gate" como completado.

**Criterio de cierre:**
- `scripts/audit-rls.sql` existe y es ejecutable.
- RLS CI gate activo en GitHub Actions.
- Pipeline falla si una migración introduce tabla sin RLS.

---

### 3.2 Rate limiting por IP en Edge Functions

**Objetivo:** evitar abuso de APIs de IA, voz y pagos incluyendo IP como factor de rate limiting.

**Archivos afectados:**
- `supabase/functions/_shared/rate-limit.ts`
- 19 Edge Functions públicas

**Pasos:**

1. **Extender `_shared/rate-limit.ts`**
   - Añadir soporte para `ip` (desde header `x-forwarded-for` o `x-real-ip`).
   - Guardar registros en `rate_limits` con campos: `ip`, `route`, `window_start`, `count`.

2. **Definir límites por categoría**

   | Categoría | Límite | Ventana | Consecuencia |
   |-----------|--------|---------|-------------|
   | IA (chat) | 30 req | 1 min | 429 + degradar a texto |
   | TTS cloud | 10 req | 1 min | 429 + degradar a Web Speech |
   | Pagos | 5 req | 1 min | 429 |
   | Anónimos | 5 req | 1 min | 429 |

3. **Aplicar a todas las Edge Functions públicas**
   - Importar rate-limit helper al inicio de cada handler.
   - Usuarios autenticados: límites 2x respecto a anónimos.

**Criterio de cierre:**
- 19 Edge Functions con rate limit por IP.
- 429 en exceso de requests desde misma IP.
- Requests distribuidos pasan correctamente.

---

### 3.3 Directorios packages/, services/, apps/

**Objetivo:** alinear la estructura real del repo con lo que describe `docs/STATUS.md`.

**Pasos (Opción A — recomendada):**

1. Crear directorios raíz:
   ```
   packages/
   services/
   apps/
   ```

2. Cada directorio con un `README.md` interno:
   ```markdown
   # packages/
   
   **Estado:** planned — no implementado todavía.
   
   Propósito futuro: módulos compartidos del monorepo (geo-engine, core-kernel,
   data-models, ui-kit). Ver `docs/STATUS.md` para la arquitectura objetivo.
   ```

3. Actualizar `docs/STATUS.md` para reflejar que `packages/`, `services/`, `apps/` son contenedores planificados, no directorios activos.

**Criterio de cierre:**
- Directorios creados con README.
- STATUS.md actualizado con nota "planned only".

---

### 3.4 TypeScript strict

**Objetivo:** reducir deuda técnica y mejorar calidad de tipo en todo el código base.

**Pasos:**

1. **Activar `strict: true` en `tsconfig.app.json`**
   - Documentar el cambio en `docs/TECHNICAL_DEBT.md`.

2. **Plan de limpieza de `@ts-nocheck`**
   - Listar archivos con `@ts-nocheck`:
     - `src/components/ExplorerView.tsx`
     - `src/components/Dashboard.tsx`
     - `src/hooks/useAuth.tsx`
     - `src/core/experience.orchestrator.ts`
     - Archivos en `src/data/imported/`
   - Migrar primero los que afectan seguridad/IA (hooks, edge functions, security).
   - Reemplazar `@ts-nocheck` con `@ts-expect-error` específico solo donde sea justificable.

3. **Política de CI**
   - No permitir nuevas funciones con `@ts-nocheck`.
   - Revisar PRs por presencia de anotaciones de escape no justificadas.

**Criterio de cierre:**
- `strict: true` activo.
- Cero archivos con `@ts-nocheck` en `src/hooks/`, `src/security/`, `supabase/functions/`.
- `@ts-expect-error` solo donde hay justificación documentada.

---

### 3.5 Health check post-deploy

**Objetivo:** asegurar que el sistema está sano después de cada despliegue.

**Pasos:**

1. **Endpoint de health federado**
   - Usar `api/telemetry.js` o `api/cron/health-check.js` como endpoint estándar.
   - Debe devolver estado de F1–F7.

2. **Job de CI post-deploy**
   - Workflow que, después de `vercel --prod`, llama al endpoint y valida:
     - HTTP 200.
     - F1–F7 sin estados críticos.

3. **Reporte**
   - Guardar resultado en logs de CI.
   - Documentar en `docs/ROADMAP.md`.

**Criterio de cierre:**
- CI verifica health después de cada deploy.
- Falla si el endpoint responde error o federación crítica.

---

## 4. Remediación P2 · Medios

### 4.1 Cloud TTS real — tts-isabella

**Objetivo:** que la Edge Function `tts-isabella` funcione con un proveedor real.

**Pasos:**

1. **Elegir proveedor**
   - **Open-source:** Coqui TTS o Piper TTS en infraestructura propia (requiere GPU).
   - **Servicio:** ElevenLabs, Google Cloud TTS, Azure Speech.
   - Recomendación inicial: Google Cloud TTS (es-MX-Wavenet-B) por calidad/precio.

2. **Implementar la llamada real en `supabase/functions/tts-isabella/index.ts`**
   - Recibir `{ text, context }`.
   - Generar SSML según federación (perfiles F1–F7).
   - Llamar a API de TTS y obtener buffer de audio.
   - Guardar en `isabella-voice-cache` (ver 4.2).
   - Devolver `{ audioUrl, mode: "cloud" }`.

3. **Configurar API key**
   - Variable de entorno `GOOGLE_TTS_API_KEY` en Supabase Edge Functions.
   - Nunca en `VITE_`.

4. **Documentar**
   - Actualizar `docs/ISABELLA-VOICE-ENGINE.md` con proveedor, parámetros y costos estimados.

**Criterio de cierre:**
- `POST /api/tts-isabella` con texto devuelve `{ audioUrl, mode: "cloud" }`.
- Audio reproducible desde URL firmada.
- Sin clave en bundle frontend.

---

### 4.2 Bucket isabella-voice-cache

**Objetivo:** caché de audio reproducible con naming determinista.

**Pasos:**

1. **Crear bucket en Supabase Storage**
   - Nombre: `isabella-voice-cache`.
   - Políticas RLS:
     - `service_role`: escritura y lectura.
     - `authenticated`: lectura vía URL firmada.
     - `anon`: sin acceso directo.

2. **Naming determinista**
   - `SHA256(text + ssml_profile + voice_model).mp3`.
   - Mismo input → mismo archivo → reproducible.

3. **Migración SQL para registro del bucket**
   - Opcional: registrar creación del bucket en migración para trazabilidad.

**Criterio de cierre:**
- Bucket existe y es accesible desde `tts-isabella`.
- Archivos con nombre hash predecible.

---

### 4.3 Tabla isabella_voice_logs

**Objetivo:** trazabilidad completa de cada síntesis de voz.

**Pasos:**

1. **Nueva migración SQL**

   ```sql
   create table isabella_voice_logs (
     id uuid primary key default gen_random_uuid(),
     text_hash text not null,
     raw_text text not null,
     ssml_applied text,
     tts_provider text,
     voice_model text,
     ssml_profile text,
     audio_url text,
     cache_hit boolean default false,
     latency_ms integer,
     status text default 'success',
     federation_id text,
     use_case text,
     user_id uuid,
     created_at timestamptz default now()
   );

   alter table isabella_voice_logs enable row level security;

   -- Políticas
   create policy "admins can read all logs"
     on isabella_voice_logs for select
     using (auth.role() = 'service_role');

   create policy "service can insert logs"
     on isabella_voice_logs for insert
     with check (auth.role() = 'service_role');
   ```

2. **Integrar en `tts-isabella`**
   - Cada síntesis registra una fila con todos los metadatos.
   - Permite reproducir experimentos y auditar cambios de voz.

**Criterio de cierre:**
- Migración aplicada.
- Cada request TTS genera una fila en la tabla.
- RLS activo.

---

### 4.4 Cola de audio useIsabellaAudioQueue

**Objetivo:** desacoplar la cola de audio del hook principal y hacerla testeable.

**Pasos:**

1. **Implementar `src/hooks/useIsabellaAudioQueue.ts`**

   ```typescript
   interface AudioClip {
     id: string;
     url?: string;
     text?: string;
     priority: 0 | 1 | 2;
     federation?: string;
     segment_id?: string;
   }

   export function useIsabellaAudioQueue() {
     // enqueue(clip), dequeue(), peek(), clear(), isEmpty()
     // FIFO con inserción ordenada por prioridad
     // Sin dependencia de Web Speech ni HTMLAudioElement
   }
   ```

2. **Integrar en `useIsabellaVoice`**
   - `useIsabellaVoice` usa la cola para reproducir ordenadamente clips locales o cloud.
   - `cancelAll()` vacía la cola y detiene reproducción actual.

3. **Tests unitarios**
   - Encolar 3 clips → `dequeue()` devuelve el de mayor prioridad.
   - `clear()` vacía la cola.
   - `isEmpty()` refleja estado correcto.

**Criterio de cierre:**
- Hook implementado y exportado.
- `useIsabellaVoice` lo consume.
- Tests unitarios pasan.

---

### 4.5 Cobertura de tests y assets reales

**Objetivo:** subir cobertura y eliminar dependencia de mock visuals.

**Pasos:**

1. **Tests para hooks de voz**
   - `useIsabellaAudioQueue` (unitario, sin audio).
   - `useIsabellaVoice` (con mock de fetch y Web Speech).

2. **Tests para Edge Functions críticas**
   - `isabella-ai`: 401 sin auth, 200 con JWT válido.
   - `stripe-webhook`: firma inválida, duplicado, válido.
   - `tts-isabella`: texto vacío, texto válido, cache hit.

3. **Reemplazar `picsum.photos`**
   - Migrar a imágenes reales del territorio.
   - Documentar origen y licencia de cada asset.
   - Ubicación sugerida: `public/assets/territorial/`.

**Criterio de cierre:**
- Suite de tests ejecutándose en CI.
- Cobertura > 60% en módulos de voz y auth.
- Cero referencias a `picsum.photos` en el código.

---

## 5. Mejores prácticas P3 · Expansión

| Práctica | Descripción | Prioridad |
|----------|-------------|-----------|
| **CSP dinámica por entorno** | `Content-Security-Policy-Report-Only` en staging, enforcement en producción. Diferencias documentadas en `docs/security/`. | P3 |
| **Pruebas ciegas de percepción SSML** | n ≥ 10 participantes. Validar que los perfiles F1–F7 se distinguen perceptualmente. Resultados en `docs/ISABELLA-VOICE-SSML-SAMPLES.md`. | P3 |
| **Dashboard federado público** | Exponer datos agregados de F3 (territorio) y F7 (salud del sistema) bajo licencia abierta. | P3 |
| **App móvil nativa** | React Native + WebView para el core, módulos nativos para cámara, GPS, LoRa. Roadmap en `docs/ROADMAP.md`. | P3 |
| **Mesh LoRa / Meshtastic** | Conectividad territorial resiliente para zonas sin internet. Integración con gemelo digital. | P3 |

---

## 6. Manual de migración: de Gemini a modelos de ciencia abierta

### 6.1 Principios de Open Science AI

| Principio | Implementación en RDM |
|-----------|----------------------|
| **Transparencia** | Documentar qué modelo se usa, versión, contexto. Tabla `ai_models_config` + docs. |
| **Reproducibilidad** | Inputs, parámetros, prompts y outputs rastreables en `isabella_voice_logs` y `audit_log`. Configuración de modelos (temperatura, seed) accesible. |
| **Apertura de pesos** | Usar modelos open-weight (Qwen3, Gemma 4, GLM) cuando sea posible. |
| **Gobernanza** | Qué modelos se usan por federación y caso de uso, como política documentada en RFC. |

---

### 6.2 Arquitectura de Model Router

**Objetivo:** desacoplar el código de un proveedor de IA concreto.

```
┌─────────────────────────────────────────────────────┐
│                 Edge Function                       │
│  isabella-ai / realito-chat / tts-isabella          │
│                                                     │
│  modelProvider.generateText(input, context)         │
│       ↓                                            │
│  ┌─────────────────────────────────────────────┐   │
│  │            Model Router                     │   │
│  │  Lee ai_models_config según federación      │   │
│  │  y use_case → selecciona provider           │   │
│  └──────┬──────────┬──────────┬───────────────┘   │
│         ↓          ↓          ↓                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │ Gemini   │ │ OpenLLM  │ │ FutureProvider   │   │
│  │ Provider │ │ Provider │ │ (HuggingFace,    │   │
│  │ (actual) │ │ (Qwen3,  │ │  Ollama, etc.)   │   │
│  │          │ │ Gemma 4) │ │                  │   │
│  └──────────┘ └──────────┘ └──────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Componentes:**

1. **Interfaz `ModelProvider`**

   ```typescript
   interface ModelProvider {
     generateText(input: GenerateTextInput): Promise<GenerateTextResult>;
     // generateEmbedding, etc. según necesidad
   }

   interface GenerateTextInput {
     prompt: string;
     system?: string;
     temperature?: number;
     maxTokens?: number;
     federation?: string;
     useCase?: string;
   }
   ```

2. **Tabla `ai_models_config` en Supabase**

   ```sql
   create table ai_models_config (
     id uuid primary key default gen_random_uuid(),
     name text not null,
     provider text not null,       -- 'gemini', 'openllm', 'huggingface'
     version text not null,
     federation text,              -- F1..F7, null = cualquier
     use_case text,                -- 'general', 'turismo', 'comercio'
     enabled boolean default true,
     config jsonb,                 -- temperatura, top_p, seed, etc.
     created_at timestamptz default now()
   );
   ```

3. **Router en Edge Functions**
   - En lugar de `callGemini(text)`, usar `modelProvider.generateText(input)`.
   - El router lee `ai_models_config` según `federation` y `useCase` del contexto.
   - Instancia el provider correspondiente.

---

### 6.3 Fases de migración

#### Fase 1: Abstracción (P1)

| Tarea | Archivos | Dependencia |
|-------|----------|-------------|
| Definir interfaz `ModelProvider` | `supabase/functions/_shared/model-provider.ts` | — |
| Implementar `GeminiProvider` | `supabase/functions/_shared/providers/gemini.ts` | GEMINI_API_KEY |
| Refactorizar `isabella-ai` | `supabase/functions/isabella-ai/index.ts` | Interfaces anteriores |
| Refactorizar `realito-chat` | `supabase/functions/realito-chat/index.ts` | Interfaces anteriores |
| Tests de integración | `tests/` | Edge Functions desplegadas |

**Criterio de cierre:** `isabella-ai` y `realito-chat` usan `modelProvider.generateText()` sin cambiar comportamiento.

#### Fase 2: Inclusión de modelos abiertos (P2)

| Tarea | Archivos | Dependencia |
|-------|----------|-------------|
| Integrar `OpenLLMProvider` (Qwen3 / Gemma 4) | `supabase/functions/_shared/providers/openllm.ts` | API key de modelo open-source |
| Configurar en `ai_models_config` | Migración SQL | Fase 1 completa |
| Probar en staging | — | Fase 2 completa |

**Criterio de cierre:** Al menos un modelo open-weight funcionando para un caso de uso (turismo o comunidad).

#### Fase 3: Transición (P2)

| Tarea | Descripción |
|-------|-------------|
| Definir en `ai_models_config` | Gemini como fallback, modelos abiertos como principales |
| Monitorear | Latencia, calidad percibida, costos |
| Ajustar umbrales | Según datos recolectados |

**Criterio de cierre:** Modelos abiertos manejan >50% de requests de IA.

#### Fase 4: Gemini mínimo o retiro (P3)

| Escenario | Acción |
|-----------|--------|
| Modelos abiertos satisfacen casos críticos | Gemini solo en casos donde su ecosistema añada valor irreemplazable |
| Compatibilidad necesaria | Mantener Gemma (derivado open-weight de Gemini) |
| Retiro total | Eliminar `GeminiProvider`, limpiar secrets |

**Criterio de cierre:** Cero dependencia de API Gemini o migración completa a Gemma.

---

### 6.4 Documentación de modelos

Crear `docs/AI-MODELS-OPEN-SCIENCE.md` con:

| Sección | Contenido |
|---------|-----------|
| **Lista de modelos** | Nombre, versión, proveedor, licencia (Apache 2.0, MIT, CC-BY, etc.) |
| **Tareas** | Qué hace cada modelo (chat general, turismo, comercio, voz) |
| **Parámetros** | Temperatura, maxTokens, top_p, seed, voz (SSML profile) |
| **Evaluación** | Cómo fueron seleccionados (pruebas internas, benchmarks externos) |
| **Casos de uso por federación** | Mapeo F1–F7 → modelo recomendado |

Esto convierte la IA del sistema en algo que puede ser auditado y replicado por otros equipos.

---

## 7. Cierre del manual

Este manual debe:

- **Vivir en `docs/`** y estar enlazado desde `README.md` y desde `/documentacion` en el frontend.
- **Actualizarse** cada vez que se aplica un parche, se integra un nuevo modelo o se modifica una política de seguridad/voz.
- **Servir como mapa maestro** para cualquier equipo que quiera corregir cosas, extender el sistema, o estudiar RDM Digital Hub como caso de ciencia abierta aplicada a territorio.

### Checklist de aplicación

| # | Sección | Estado | Fecha |
|---|---------|--------|-------|
| 1 | P0 — Auth Isabella (Parche 01) | 🔴 Pendiente | |
| 2 | P0 — Build stability (Parche 02) | 🔴 Pendiente | |
| 3 | P0 — Stripe hardening (Parche 03) | 🔴 Pendiente | |
| 4 | P1 — RLS CI gate (Parche 04) | 🔴 Pendiente | |
| 5 | P1 — Rate limiting por IP | 🔴 Pendiente | |
| 6 | P1 — Directorios packages/services/apps | 🔴 Pendiente | |
| 7 | P1 — TypeScript strict | 🔴 Pendiente | |
| 8 | P1 — Health check post-deploy | 🔴 Pendiente | |
| 9 | P2 — Cloud TTS real | 🔴 Pendiente | |
| 10 | P2 — Bucket isabella-voice-cache | 🔴 Pendiente | |
| 11 | P2 — Tabla isabella_voice_logs | 🔴 Pendiente | |
| 12 | P2 — Cola de audio useIsabellaAudioQueue | 🔴 Pendiente | |
| 13 | P2 — Tests y assets | 🔴 Pendiente | |
| 14 | F1 — Abstracción Model Router | 🔴 Pendiente | |
| 15 | F2 — Inclusión modelos abiertos | 🔴 Pendiente | |
| 16 | F3 — Transición | 🔴 Pendiente | |
| 17 | F4 — Gemini mínimo/retiro | 🔴 Pendiente | |

---

*Este manual es un documento vivo. Cada vez que se aplica un paso, se marca la fecha y se actualiza el estado. El objetivo no es "terminar", sino tener un registro reproducible de cada decisión técnica.*
