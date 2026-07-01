# Isabella Voice Engine

**Pipeline de Voz con Ciencia Abierta · Open Science TTS**

---

## 1. Declaración científica

### Pregunta central

> ¿Cómo convertir texto generado por un LLM en voz sincronizada, estable y contextualizada para Real del Monte, con mínima latencia y máxima reproducibilidad?

### Hipótesis

| Hipótesis | Enunciado |
|-----------|-----------|
| **H0** | El uso exclusivo de Web Speech API ofrece una experiencia aceptable pero no controlable ni reproducible entre navegadores. |
| **H1** | Un modelo mixto (Web Speech + Cloud TTS cacheado en Supabase) mejora consistencia, control de prosodia y auditabilidad. |
| **H2** | La asociación de perfiles SSML por federación (F1–F7) produce una huella vocal diferenciable que mejora la experiencia contextual sin aumentar latencia perceptible. |

### Variables observables

| Variable | Tipo | Unidad | Recolección |
|----------|------|--------|-------------|
| Latencia TTS | Continua | ms | `isabella_voice_logs.latency_ms` |
| Tasa de error de síntesis | Discreta | % | `isabella_voice_logs.status` |
| Razón de caché | Continua | % | `isabella_voice_logs.cache_hit` |
| Uso de SSML por federación | Categórica | perfil | `isabella_voice_logs.ssml_profile` |
| Tasa de interrupción | Continua | % | `isabella_voice_logs.cancelled` |

### Criterios de éxito

- Latencia media < 800ms para modo servidor (con caché) y < 200ms para modo local.
- Tasa de error < 2% en modo servidor.
- Razón de caché > 60% después de 1000 requests.
- Diferenciación perceptual entre perfiles SSML validada por prueba ciega (n ≥ 10).

---

## 2. Arquitectura del pipeline

```
┌──────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│  Usuario     │────▶│  Isabella Chat UI   │────▶│  Edge Function   │
│  (consulta)  │     │  (React component)  │     │  isabella-ai     │
└──────────────┘     └─────────────────────┘     │  (Gemini 2.0)    │
                                                 └────────┬─────────┘
                                                          │ texto + metadatos
                                                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Isabella Voice Engine                          │
│                                                                  │
│  ┌─────────────────────┐        ┌──────────────────────────┐    │
│  │  useIsabellaVoice   │        │  Edge Function tts-      │    │
│  │  (Web Speech API)   │        │  isabella (Cloud TTS)    │    │
│  │  L4 / P4            │        │  L2–L3 / P0–P3          │    │
│  │  Experimental       │        │  Operación crítica       │    │
│  └──────────┬──────────┘        └─────────────┬────────────┘    │
│             │                                  │                 │
│             ▼                                  ▼                 │
│  ┌──────────────────┐              ┌────────────────────┐       │
│  │ speechSynthesis  │              │ SSML Builder       │       │
│  │ (es-MX)          │              │ · Perfil F1–F7     │       │
│  │ rate: 0.9        │              │ · <break>          │       │
│  │ pitch: 1.1       │              │ · <prosody>        │       │
│  └──────────────────┘              │ · <emphasis>       │       │
│                                    └─────────┬──────────┘       │
│                                              │                   │
│                                              ▼                   │
│                                    ┌────────────────────┐       │
│                                    │ Cache lookup       │       │
│                                    │ (SHA-256 hash)     │       │
│                                    └──────┬──────┬──────┘       │
│                                           │      │              │
│                                      cache hit  cache miss     │
│                                           │      │              │
│                                           ▼      ▼              │
│                                    ┌────────────────────┐       │
│                                    │ Cloud TTS API      │       │
│                                    │ → audio/mpeg       │       │
│                                    │ → Storage bucket   │       │
│                                    │ → URL firmada      │       │
│                                    └────────────────────┘       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  useIsabellaAudioQueue (Audio Sequencing Layer)          │    │
│  │  · Cola FIFO con prioridad                               │    │
│  │  · Reproducción secuencial sin solapamiento              │    │
│  │  · cancelAll() en interrupción                           │    │
│  │  · Sincronización por segment_id (karaoke-ready)         │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

### 2.1. Doble modo de síntesis

#### Modo Local (Experimental · L4/P4)

- **Hook:** `useIsabellaVoice` → `window.speechSynthesis`
- **Activación:** Solo si el navegador soporta Web Speech API y el usuario ha consentido audio (flag `audio_enabled` en tabla `profiles`).
- **Ventaja:** Latencia < 200ms, sin costo externo, sin dependencia de red.
- **Limitación:** Voz no reproducible entre navegadores, sin control de prosodia fina.
- **Estado:** Experimental. Se documenta como P4.

```
useIsabellaVoice → getVoice() → es-MX (Mexican) → SpeechSynthesisUtterance
                   rate: 0.9, pitch: 1.1, volume: 1
```

#### Modo Servidor (Operación Crítica · L2–L3/P0–P3)

- **Edge Function:** `tts-isabella` (nueva función Supabase/Deno)
- **Input:** `{ text, federation_id, context, style, language }`
- **Pipeline:**
  1. Calcular hash SHA-256 del texto + parámetros.
  2. Buscar en bucket `isabella-voice-cache` por nombre = hash.
  3. Si existe: devolver URL firmada (cache hit).
  4. Si no existe: llamar a Cloud TTS API (Google Cloud TTS o ElevenLabs) con SSML generado.
  5. Almacenar resultado en bucket + registrar en `isabella_voice_logs`.
  6. Devolver URL firmada + metadatos.
- **Ventaja:** Voz consistente, reproducible, cacheable, con control SSML completo.
- **Caché:** Nombres deterministas por hash SHA-256 → mismo input siempre produce el mismo archivo.

### 2.2. Streaming y sincronización

El canal SSE (Server-Sent Events) existente en `isabella-ai` se extiende con tipos de evento adicionales:

```
event: chunk        → texto parcial (existente)
event: final_text   → texto completo generado por Gemini
event: tts_ready    → { url, segment_id, mode: "cloud" | "local" }
event: tts_error    → { segment_id, error }
```

El frontend escucha estos eventos y decide cuándo iniciar síntesis:

1. Recibe `final_text`.
2. Si modo servidor: espera `tts_ready` → reproduce URL.
3. Si modo local: llama a `useIsabellaVoice.speak()` inmediatamente.
4. Si timeout (> 3s sin `tts_ready`): fallback automático a modo local.

### 2.3. Cola de audio formalizada

`useIsabellaAudioQueue` es un hook independiente (no reutiliza `useMusicPlayer`):

```typescript
interface AudioClip {
  id: string;
  url?: string;         // para cloud TTS
  text?: string;         // para Web Speech
  priority: 0 | 1 | 2;   // 0=crítico, 1=narrativa, 2=ambiental
  federation?: string;
  segment_id?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

const queue = useIsabellaAudioQueue();
queue.enqueue(clip);     // agregar con prioridad
queue.play();            // iniciar reproducción secuencial
queue.cancelAll();       // detener todo (interrupción de usuario)
queue.pause();           // pausar
queue.resume();          // reanudar
```

### 2.4. Prosodia y huella vocal (SSML)

Para el modo servidor, se utilizan perfiles SSML predefinidos por federación:

| Federación | Perfil SSML | Ritmo | Tono | Pausas | Énfasis |
|------------|-------------|-------|------|--------|---------|
| **F1** Gobernanza | `governance` | slow | -2% | En términos normativos | Palabras clave legales |
| **F2** Identidad | `identity` | medium | 0% | En saltos de sección | Nombres de usuario, roles |
| **F3** Territorio | `territorial` | medium | +1% | En nombres de calles y lugares | Topónimos, fechas |
| **F4** Comercio | `commerce` | fast | +2% | Mínimas | Precios, ofertas |
| **F5** IA | `intelligence` | medium | +1% | En conceptos técnicos | Términos clave |
| **F6** Comunidad | `community` | slow | -1% | En nombres de personas, lugares | Nombres, fechas |
| **F7** Seguridad | `security` | slow | -2% | En alertas, estados | Términos críticos |

---

## 3. Seguridad, recursos y reproducibilidad

### 3.1. Caché trazable

- **Bucket:** `isabella-voice-cache` (privado, lectura vía URL firmada)
- **Naming:** `sha256(text + ssml_profile + voice_model).mp3`
- **Ventaja:** El mismo input produce exactamente el mismo archivo. Cualquier audio es reproducible bajo demanda.

### 3.2. Trazabilidad (Open Science)

Tabla `isabella_voice_logs`:

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | Clave primaria |
| `original_text` | TEXT | Texto de entrada |
| `ssml_applied` | TEXT | SSML enviado al TTS |
| `tts_provider` | TEXT | `google` / `elevenlabs` / `web_speech` |
| `voice_model` | TEXT | Modelo de voz usado |
| `ssml_profile` | TEXT | Perfil SSML aplicado (F1–F7) |
| `audio_url` | TEXT | URL del archivo generado |
| `cache_hit` | BOOLEAN | `true` si se sirvió desde caché |
| `latency_ms` | INTEGER | Tiempo total de síntesis |
| `status` | TEXT | `success` / `error` / `cancelled` |
| `federation_id` | TEXT | Federación asociada |
| `user_id` | UUID | Usuario que solicitó (si autenticado) |
| `created_at` | TIMESTAMP | Cuándo ocurrió |

### 3.3. Rate limiting

Extensiones a la tabla `rate_limits`:

| Categoría | Límite por ventana | Ventana | Consecuencia al exceder |
|-----------|-------------------|---------|------------------------|
| `tts_local` | 60 requests | 1 minuto | Silenciar voz, solo texto |
| `tts_cloud` | 20 requests | 1 minuto | Degradar a Web Speech |
| `tts_cloud_F1` | 5 requests | 1 minuto | Degradar a Web Speech |
| `tts_cloud_F4` | 3 requests | 1 minuto | Degradar a Web Speech |

Reglas:
- Requests P0/P3 (información crítica) siempre permitidos dentro de umbrales.
- Requests P4 (experimentales) se degradan a texto-only al alcanzar límites.
- Usuarios autenticados tienen límites 2x respecto a anónimos.

---

## 4. Mapa de implementación

| Componente | Estado | Prioridad | Dependencias |
|------------|--------|-----------|--------------|
| `useIsabellaVoice` (Web Speech) | ✅ Existente | — | — |
| `useIsabellaAudioQueue` | 🔴 No existe | P0 | — |
| SSE event types extendidos | 🔴 No existe | P0 | `isabella-ai` edge function |
| `tts-isabella` edge function | 🔴 No existe | P1 | Supabase storage + Cloud TTS API |
| Bucket `isabella-voice-cache` | 🔴 No existe | P1 | Supabase storage |
| Tabla `isabella_voice_logs` | 🔴 No existe | P1 | Migración SQL |
| Perfiles SSML por federación | 🔴 No existe | P2 | Documentación SSML |
| Rate limiting `tts_*` | 🔴 No existe | P2 | Tabla `rate_limits` |
| Fallback automático cloud→local | 🔴 No existe | P2 | `useIsabellaAudioQueue` |
| Prueba ciega de percepción | 🔴 No existe | P3 | n ≥ 10 participantes |

---

## 5. Referencias

- Web Speech API: [MDN SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
- SSML 1.1: [W3C Recommendation](https://www.w3.org/TR/speech-synthesis11/)
- Google Cloud Text-to-Speech: [cloud.google.com/text-to-speech](https://cloud.google.com/text-to-speech)
- ElevenLabs: [elevenlabs.io](https://elevenlabs.io)
- Open Science Framework: [osf.io](https://osf.io)
