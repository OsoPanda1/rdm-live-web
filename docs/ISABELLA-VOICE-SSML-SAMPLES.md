# Isabella Voice SSML Samples

**Huella vocal · Perfiles de voz por federación**

Estos ejemplos SSML definen la prosodia de Isabella AI para cada federación del ecosistema LDTOCS. Cualquier implementación de Cloud TTS (Google Cloud TTS, ElevenLabs, Azure Speech) debe producir el mismo output dado el mismo input SSML, garantizando reproducibilidad.

---

## Perfiles disponibles

| Perfil | Ritmo | Tono | Pausa entre párrafos | Uso principal |
|--------|-------|------|----------------------|---------------|
| `F1` | slow | -2% | 400ms | Gobernanza, términos normativos |
| `F2` | medium | 0% | 300ms | Identidad, autenticación |
| `F3` | medium | +1% | 300ms | Geografía, topónimos, datos territoriales |
| `F4` | fast | +2% | 200ms | Comercio, precios, ofertas |
| `F5` | medium | +1% | 300ms | Conceptos técnicos, IA |
| `F6` | slow | -1% | 500ms | Narrativa, cultura, comunidad |
| `F7` | slow | -2% | 400ms | Alertas, seguridad, estados críticos |

---

## Ejemplos por federación

### F1 · Gobernanza

```xml
<?xml version="1.0"?>
<speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="es-MX">
  <prosody rate="slow" pitch="-2%">
    El <emphasis level="strong">Reglamento Interno del Ecosistema</emphasis> establece que toda modificación al kernel requiere aprobación de al menos tres federaciones.
    <break time="400ms"/>
    El RFC-007 define el procedimiento para <emphasis level="moderate">propuestas de cambio</emphasis> y su ventana de revisión de 14 días.
  </prosody>
</speak>
```

### F2 · Identidad

```xml
<?xml version="1.0"?>
<speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="es-MX">
  <prosody rate="medium" pitch="0%">
    Bienvenido, <emphasis level="strong">usuario autenticado</emphasis>.
    <break time="300ms"/>
    Tu identidad está protegida por la <emphasis level="moderate">Heptafederación F2</emphasis> y el ledger SHA-256 del sistema.
  </prosody>
</speak>
```

### F3 · Datos Territoriales

```xml
<?xml version="1.0"?>
<speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="es-MX">
  <prosody rate="medium" pitch="+1%">
    La <emphasis level="strong">Plaza de la Independencia</emphasis> se encuentra a 200 metros al norte.
    <break time="300ms"/>
    Su construcción data de <emphasis level="moderate">1865</emphasis>, durante el auge minero de la región.
  </prosody>
</speak>
```

### F4 · Comercio

```xml
<?xml version="1.0"?>
<speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="es-MX">
  <prosody rate="fast" pitch="+2%">
    El paste de <emphasis level="strong">pollo con mole</emphasis> tiene un costo de <emphasis level="strong">$45 MXN</emphasis>.
    <break time="200ms"/>
    La membresía premium comercial tiene un valor de <emphasis level="moderate">$199 MXN mensuales</emphasis> e incluye promoción destacada.
  </prosody>
</speak>
```

### F5 · IA y Automatización

```xml
<?xml version="1.0"?>
<speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="es-MX">
  <prosody rate="medium" pitch="+1%">
    El <emphasis level="strong">Pipeline Hexagonal de Conciencia</emphasis> procesa la entrada en seis etapas: <emphasis level="moderate">Recibir, Evaluar, Planificar, Ejecutar, Consolidar, Reconciliar</emphasis>.
    <break time="300ms"/>
    Isabella AI opera sobre el modelo <emphasis level="moderate">Gemini 2.0 Flash</emphasis> con temperatura de 0.85.
  </prosody>
</speak>
```

### F6 · Comunidad y Cultura

```xml
<?xml version="1.0"?>
<speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="es-MX">
  <prosody rate="slow" pitch="-1%">
    Cuenta la leyenda que en el <emphasis level="strong">Callejón del Beso</emphasis>, dos enamorados sellaron su amor para siempre.
    <break time="500ms"/>
    <emphasis level="strong">Real del Monte</emphasis> no es solo un pueblo, es un <emphasis level="moderate">LDTOCS</emphasis>: un sistema operativo territorial vivo.
    <break time="500ms"/>
    "<emphasis level="moderate">BABAS significa TE AMO</emphasis>" — Anubis Villaseñor.
  </prosody>
</speak>
```

### F7 · Seguridad y Observabilidad

```xml
<?xml version="1.0"?>
<speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="es-MX">
  <prosody rate="slow" pitch="-2%">
    <emphasis level="strong">Alerta del sistema:</emphasis> La federación F4 presenta latencia superior al umbral crítico.
    <break time="400ms"/>
    <emphasis level="moderate">Estado actual:</emphasis> degradado. Se recomienda revisar el dashboard de telemetría.
  </prosody>
</speak>
```

---

## Guía de etiquetas SSML usadas

| Etiqueta | Propósito | Uso en Isabella |
|----------|-----------|-----------------|
| `<prosody rate="..." pitch="...">` | Control de ritmo y tono | Perfiles F1–F7 |
| `<break time="..."/>` | Pausa entre ideas | Cambios de tema o párrafo |
| `<emphasis level="strong">` | Énfasis máximo | Nombres de lugares, personas, términos críticos |
| `<emphasis level="moderate">` | Énfasis medio | Conceptos secundarios, fechas, precios |
| `<say-as interpret-as="...">` | Pronunciación específica | Números, fechas, siglas (futuro) |

---

## Cómo probar

1. Copia cualquier ejemplo SSML de arriba.
2. Pégalo en el [Google Cloud TTS Playground](https://cloud.google.com/text-to-speech) (gratuito).
3. Selecciona voz `es-MX-Wavenet-B` o `es-MX-Standard-A`.
4. Escucha el resultado y compáralo con otro perfil.

---

## Referencias

- [SSML 1.1 W3C Recommendation](https://www.w3.org/TR/speech-synthesis11/)
- [Google Cloud TTS SSML Documentation](https://cloud.google.com/text-to-speech/docs/ssml)
- [ElevenLabs SSML Support](https://elevenlabs.io/docs/api-reference/ssml)
