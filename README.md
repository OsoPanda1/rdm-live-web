# Real del Monte Digital Hub · LTOS

Plataforma territorial soberana para turismo, cultura, economía local y memoria viva del Pueblo Mágico de Real del Monte.

---

> **Norma de producción:** antes de promover RDM Digital a producción institucional, todo cambio debe alinearse con el [Manual extremo RDM Digital](docs/rdm-operational-hardening-manual.md).

## 1. Visión y propósito

Real del Monte Digital Hub es un **sistema operativo territorial** (LTOS) que conecta patrimonio minero, experiencias turísticas, comercio local y capas de inteligencia artificial en una sola infraestructura abierta y auditable.

El proyecto busca:

- Convertir la narrativa histórica y cultural de Real del Monte en servicios digitales vivos.
- Fortalecer la economía local mediante herramientas de descubrimiento, reputación y donaciones.
- Garantizar soberanía de datos, trazabilidad y observabilidad de extremo a extremo.

---

## 2. Capas funcionales del ecosistema

### 2.1. Capa de experiencia (Turismo y Cultura)

- Historia minera y patrimonio cultural (minas, museos, sitios históricos).
- Gastronomía: pastes, cocina serrana, barbacoa, café y panadería local.
- Arte, artesanías y platería de autor.
- Ecoturismo, miradores y rutas de naturaleza.
- Relatos, mitos y leyendas mineras.
- Comercios locales con mapa turístico interactivo.
- Agenda de eventos culturales y recomendaciones contextuales.

### 2.2. Capa de interacción y economía

- Perfiles de visitantes y comercios.
- Foros, muros turísticos y contenidos generados por la comunidad.
- Catálogo y tienda de productos locales.
- Gamificación territorial (misiones, puntos, logros, premios).
- Membresías, reservas y beneficios recurrentes.
- Calificaciones y reseñas verificadas de negocios.
- Módulo de donaciones para infraestructura y proyectos comunitarios.

### 2.3. Capa institucional y de soporte

- Configuración, accesibilidad y preferencias del usuario.
- Preguntas frecuentes y centro de ayuda.
- Quiénes somos, contacto y directorio institucional.
- Buzón de sugerencias y reporte de incidentes.

### 2.4. Capa de infraestructura y conocimiento

- Arquitectura territorial y gemelos digitales (Digital Twins).
- Gobernanza de datos y modelos de consentimiento.
- Seguridad, privacidad y cumplimiento normativo.
- Documentación técnica, académica y de política pública.

---

## 3. Arquitectura técnica

### 3.1. Frontend

- **Stack:** React + Vite, con animaciones y microinteracciones (Framer Motion).
- **Mapa interactivo:** SVG semántico, navegación por teclado, ARIA roles.
- **Rutas principales:**
  - Exploración territorial (mapa, rutas, puntos de interés).
  - Catálogo de comercios y experiencias.
  - Panel de usuario, logros y misiones.
  - Archivo sonoro, relatos y contenidos multimedia.

### 3.2. Backend y datos

- **Backend principal:** Node.js / TypeScript sobre Express.
- **Base de datos y auth:** Supabase (auth, RLS, storage, SQL migrations).
- **Servicios internos:**
  - `ai-core`: servicios de IA conversacional y módulos de guardrails.
  - `economy`: rutas de donaciones, membresías y métricas económicas.
  - `digital-twins`: gestión de twins operativos de territorio y comercios.

### 3.3. Núcleos y kernels

- **`core-kernel`:**
  - Kernel de métricas LTOS (RED/USE/AI/Territorial).
  - Kernel de tracing distribuido (W3C Trace Context + OTEL-compatible).
  - Primitivas de observabilidad y auditoría interna.
- **`tamv-kernel`:**
  - Motor de reglas y modelos territoriales.
  - Utilidades para representación de experiencias y flujos de usuario.

### 3.4. Orquestación de experiencias

- **Realito / Isabella AI:**
  - Orquestador territorial conversacional (rutas, historia, gastronomía).
  - Uso de gemelos digitales y telemetría en tiempo casi real.
- **Archivo sonoro y multimedia:**
  - Integración con relatos, música local y paisajes sonoros.
- **Orquestador de experiencias:**
  - `experience.orchestrator.ts`: coordina mapas, IA, twin y economía para construir experiencias coherentes.

---

## 4. Observabilidad, seguridad y gobernanza

### 4.1. Observabilidad LTOS

- **Métricas:**
  - Núcleo de métricas en memoria, acotado y consciente de cardinalidad.
  - Soporte para:
    - HTTP (RED: Rate, Errors, Duration).
    - Sistema (USE: Utilization, Saturation, Errors).
    - IA (latencia, tokens, errores, riesgo de alucinación, guardrails).
    - Territorial (vistas de rutas, clics de comercios).
  - Export a Prometheus con histograms y buckets compatibles.

- **Tracing distribuido:**
  - Kernel de tracing `core-kernel/tracing`:
    - W3C Trace Context (`traceparent`/`tracestate`) ready.
    - Sampling determinístico por `traceId`.
    - AsyncLocalStorage para propagación automática de contexto.
    - Integración opcional con métricas y sistemas de auditoría.
  - Preparado para conectarse a OTEL / Jaeger / Tempo / Grafana vía adapters.

### 4.2. Seguridad y privacidad

- Autenticación y autorización gestionadas por Supabase + reglas de acceso.
- Diseño orientado a minimización de datos y redacción de campos sensibles en trazas.
- Roadmap de cumplimiento:
  - GDPR / LGPD / LFPDPPP (México).
  - Política de uso de datos académica y comunitaria.
- Protección de la infraestructura de IA:
  - Guardrails, detección de PII y riesgo de alucinación en servicios críticos.
  - Trazabilidad de decisiones relevantes: quién, cuándo, qué módulo e IA intervinieron.

### 4.3. Gobernanza territorial

- Enfoque de **infraestructura cultural y territorial**.
- Licenciamiento abierto orientado a comunidades, instituciones académicas y actores locales.
- Mecanismos de participación comunitaria en la evolución del mapa, relatos y catálogo.

---

## 5. Estado actual del proyecto

> Estas puntuaciones son una foto honesta del estado actual, no del ideal.

| Área           | Estado aproximado |
| ------------- | ----------------- |
| Seguridad     | 78/100 — Base sólida en TS y Supabase; pendiente WAF, SIEM, IDS. |
| DevOps        | 68/100 — CI razonable; falta CD, despliegues blue/green y canary. |
| Testing       | 61/100 — Cobertura inicial; falta cubrir unit, integration, contract, load y chaos. |
| Observabilidad| En progreso avanzado — métricas y tracing LTOS listos para integración OTEL. |
| Documentación | 52/100 — README y docs mejorando; falta formalizar manual técnico y políticas. |

---

## 6. Roadmap crítico

### 6.1. Documentación y políticas

- `README.md` — guía principal (este documento).
- `SECURITY.md` — política de seguridad, CVE, responsible disclosure.
- `PRIVACY.md` — privacidad y tratamiento de datos personales.
- `DATA-POLICY.md` — gobernanza de datos territoriales y académicos.
- `ARCHITECTURE.md` — descripción detallada de kernels, orquestadores y flujos.

### 6.2. Plataforma y DevOps

- Ampliar CI (`.github/workflows/ci.yml`):
  - SAST, DAST, escaneo de dependencias y coverage gates.
- Definir pipelines de CD:
  - Entornos staging / producción con estrategias blue-green / canary.
- Automatizar migraciones y backups de datos.

### 6.3. Núcleo técnico

- Consolidar `core-kernel` como paquete independiente:
  - métricas, tracing, audit logging.
- Evolucionar `tamv-kernel` como biblioteca reutilizable para otros territorios.
- Reforzar `experience.orchestrator.ts` con pruebas masivas y telemetría completa.
- Blindar `services/ai-core`:
  - guardrails, detección de inyección de prompts, control de costos y SLAs.

### 6.4. Experiencia de usuario y contenido

- Completar y pulir la Cinematic Intro (imágenes, accesibilidad, performance).
- Profundizar en los módulos `territory-heart` y `rdm-livos` sin romper la build.
- Definir juegos, HUD y dinámicas de gamificación territorial prioritarias.
- Expandir la documentación académica y la narrativa para instituciones y visitantes.

---

## 7. Cómo contribuir

1. **Explora el código**
   - Revisa la estructura de `packages/`, `server/` y `frontend/`.
   - Identifica módulos donde tu experiencia (IA, frontend, DevOps, datos) pueda aportar.

2. **Sigue las guías**
   - Respeta las convenciones de TypeScript, formato y linting.
   - Mantén la lógica de observabilidad (métricas y tracing) en cada nueva funcionalidad crítica.

3. **Propón mejoras**
   - Abre issues con propuestas claras: contexto, impacto territorial y alcance técnico.
   - Para cambios sensibles (seguridad, datos, IA), acompaña con análisis de riesgo.

4. **Enfócate en el territorio**
   - Toda contribución debe reforzar el objetivo: mejorar la experiencia de Real del Monte y su comunidad, no solo el stack tecnológico.

---

## 8. Licencia y marco de uso

Este proyecto se concibe como **infraestructura cultural y territorial**.  
El modelo de licencia combinará:

- Apertura para usos comunitarios, académicos y de investigación.
- Salvaguardas para evitar explotación extractiva del territorio y sus datos.

Los términos específicos se definirán en `LICENSE`, en coordinación con actores locales e instituciones asociadas.

---
