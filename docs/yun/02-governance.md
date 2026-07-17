# YUN Architecture Governance – Marco de decisión y control

**Versión:** v1.0  
**Fecha:** 2026-07-04  
**Ámbito:** Gobernanza arquitectónica de TAMV Online, Nodo Cero, RDM Digital, Isabella

---

## 1. Objetivo

La Architecture Governance asegura que YUN no se rompa por decisiones improvisadas. Define quién decide, cómo se decide y qué queda registrado.

---

## 2. YUN Architecture Board

### 2.1 Composición

- Responsables técnicos de TAMV Online.
- Responsables del Nodo Cero.
- Representantes de federaciones clave (mínimo 3 de las 7).
- Responsable de seguridad.

### 2.2 Funciones

- Definir principios y estándares.
- Revisar propuestas de cambio arquitectónico.
- Aprobar o rechazar nuevos dominios.
- Gestionar excepciones.
- Mantener el roadmap de YUN.

---

## 3. Procesos formales

### 3.1 Creación de nuevo dominio

1. Propuesta formal con justificación técnica y de negocio.
2. Evaluación de impacto en datos, seguridad y federaciones.
3. ADR asociado.
4. Aprobación del Architecture Board.

### 3.2 Cambio mayor en arquitectura

1. Evaluación contra la Constitución YUN.
2. Clasificación:
   - Aprobado.
   - Aprobado con condiciones.
   - Rechazado.
   - Excepción justificada.
3. ADR obligatorio.

### 3.3 Aceptación de excepción

- Debe tener motivo claro.
- Debe tener fecha de revisión.
- Debe quedar registrada como ADR con estado "Excepción".

### 3.4 Deprecación de servicio

- Plan de migración.
- Ventana de convivencia.
- Comunicación a todas las federaciones afectadas.
- Registro en ADR como "Superseded".

### 3.5 Versionado de decisiones

- Cada decisión significativa se documenta como ADR con estado:
  - **Proposed** – En revisión.
  - **Accepted** – Aprobada.
  - **Deprecated** – Obsoleta.
  - **Superseded** – Reemplazada por otra decisión.

---

## 4. Flujo de decisión

```
Propuesta → Revisión (Architecture Board) → Decisión → ADR → Implementación
     ↓              ↓                           ↓
  Issue/PR    Evaluación Constitución    Registro en ADR Index
```

---

## 5. Registro

Todas las decisiones se registran en `/docs/yun/08-adr-index.md` y en archivos ADR individuales bajo `/docs/yun/adr/`.
