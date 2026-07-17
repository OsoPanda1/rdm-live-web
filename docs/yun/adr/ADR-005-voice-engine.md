# ADR-005: Motor de voz Isabella

Fecha: 2026-07-01
Estado: Accepted

---

## Contexto

Isabella necesita una capa de voz para interactuar con usuarios de forma natural. El sistema debe funcionar en modo local (Web Speech API) y en modo servidor (Cloud TTS) con fallback automático.

La alternativa era depender exclusivamente de un proveedor de TTS en la nube, lo cual genera costos crecientes y pérdida de funcionalidad sin conexión.

## Decisión

Implementar un motor de voz dual-mode para Isabella:

- **Modo local**: Web Speech API del navegador, sin costo, funciona offline.
- **Modo servidor**: Google Cloud TTS vía edge function `tts-isabella`, con caché SHA-256.
- **Fallback automático**: Si el modo servidor falla, se degrada al modo local.
- **Cola de prioridad**: Las solicitudes se encolan y procesan en orden.
- **SSML soportado**: El modo servidor acepta SSML para control de entonación.

## Alternativas consideradas

- **Solo Web Speech API**: Limitada en calidad y opciones de voz.
- **Solo Cloud TTS**: Costos crecientes, dependencia de red.
- **Proveedor único de TTS**: Vendor lock-in, menor flexibilidad.

## Consecuencias

- Experiencia de voz disponible tanto online como offline.
- Costos controlados grâce à la caché y el modo local.
- Fallback automático mantiene la experiencia ante fallos.
- SSML permite personalización de entonación y ritmo.
- Cola de prioridad evita saturación del servicio.
