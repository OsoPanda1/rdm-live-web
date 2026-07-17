# YUN Operations Manual – Continuidad, recuperación y monitoreo

Versión: v1.0
Ámbito: Operación diaria, respuesta a incidentes, recuperación y continuidad

---

## 1. Objetivo

Este manual define cómo operar YUN en producción:

- qué monitorear,
- cómo reaccionar a fallos,
- cómo recuperar dominios y federaciones,
- y cómo mantener continuidad operativa.

---

## 2. Panel de observabilidad YUN

### 2.1 Vistas obligatorias

- **Vista de dominios**
  - Estado de Identity, Commerce, Knowledge, Telemetry, Gameplay.
  - Latencia y errores por dominio.
- **Vista de federaciones**
  - Estado (HEALTHY, DEGRADED, DOWN) de Fed1–Fed7.
  - Eventos recientes de salud/incident/policy.
- **Vista de seguridad**
  - Alertas actuales.
  - Incidentes en curso.
  - Intentos de ataque detectados.
- **Vista de rendimiento**
  - Latencia general.
  - Throughput.
  - Saturación de recursos.
- **Vista de auditoría**
  - Cambios en configuración.
  - Operaciones administrativas.
  - Acceso a datos P0.

---

## 3. Modos de operación

### 3.1 Modo Normal

- Todos los dominios y federaciones en estado HEALTHY.
- Operaciones críticas habilitadas.
- Métricas dentro de rangos aceptables.

### 3.2 Modo Degradado por dominio

- Un dominio en estado DEGRADED o DOWN:
  - Ejemplo: Commerce Domain falla.
- Acciones:
  - Suspender operaciones críticas de ese dominio (ej. nuevos pagos).
  - Mantener operaciones de lectura seguras si es posible.
  - Mantener los otros dominios operando.

### 3.3 Modo Degradado por federación

- Una federación en estado DEGRADED:
  - Ejemplo: Fed1 (Comercio local).
- Acciones:
  - Ajustar comportamiento del sistema en esa federación:
    - desactivar funciones dependientes de dominios en fallo,
    - activar modo simulación donde aplique.
  - Comunicar estado a los usuarios cuando corresponda.

### 3.4 Modo Recuperación

- Estado en el que se están ejecutando acciones de:
  - restauración de servicios,
  - recuperación de datos,
  - rehidratación de estados efímeros.

---

## 4. Protocolo de recuperación ante fallos en dominios federados

### 4.1 Pasos generales

1. **Detección**
   - Alertas de observabilidad indican:
     - aumento de errores,
     - fallas de health checks,
     - latencias anómalas.
   - La federación o dominio pasa a estado DEGRADED.

2. **Aislamiento**
   - Gateway:
     - Bloquea operaciones críticas hacia el dominio/federación afectado.
   - Fabric:
     - Evita nuevas sagas que dependan de ese dominio.
   - Servicios:
     - Cambian a modo limitado (solo lectura, simulación, etc.).

3. **Diagnóstico**
   - Revisar logs, métricas y trazas.
   - Identificar causa raíz:
     - infraestructura,
     - base de datos,
     - despliegue defectuoso,
     - ataque externo.

4. **Mitigación**
   - Si es falla de despliegue:
     - ejecutar rollback.
   - Si es falla de base:
     - restaurar servicio,
     - aplicar backups si necesario.
   - Si es incidente de seguridad:
     - seguir playbook del Security Standard,
     - aislar componentes comprometidos.

5. **Rehidratación**
   - Restaurar estados efímeros desde datos de identidad y eventos.
   - Verificar integridad de datos:
     - chequear inconsistencias,
     - corregir mediante procesos definidos.

6. **Reentrada en servicio**
   - Cambiar estado de dominio/federación a HEALTHY.
   - Gateway reabre operaciones críticas.
   - Fabric vuelve a usar el dominio normalmente.
   - Registrar evento `FederationHealthChanged` o `DomainHealthChanged`.

7. **Post-mortem**
   - Documentar:
     - qué pasó,
     - qué se hizo,
     - qué debe mejorar.
   - Crear ADR si hubo cambios arquitectónicos.
   - Actualizar manual si se requiere nuevo procedimiento.

---

## 5. Playbooks de incidentes

### 5.1 Incidente de seguridad

- Pasos:
  - Activar equipo de seguridad.
  - Aislar componentes sospechosos.
  - Revisar `security_events`, `security_alerts`, `security_incident_traces`.
  - Aplicar medidas:
    - bloqueo de IPs,
    - rotación de secretos,
    - revisión de logs.
  - Informar a las federaciones afectadas.
  - Ejecutar recuperación si hubo compromiso de datos.
  - Documentar en ADR y en reporte de incidente.

### 5.2 Caída de dominio

- Ejemplo: Commerce Domain DOWN.
- Acciones:
  - Cambiar a modo degradado.
  - Suspender cobros nuevos.
  - Mantener experiencia de lectura.
  - Recuperar dominio:
    - revisar despliegue, base, dependencias.
  - Rehidratar estados de negocio pendientes mediante eventos.

### 5.3 Caída de federación

- Ejemplo: Fed1 DOWN.
- Acciones:
  - Cambiar operaciones de esa federación a modo seguro.
  - Ajustar comportamiento de otras federaciones (ej. Fed7 simulación).
  - Seguir protocolo general de recuperación.

---

## 6. Operación diaria

### 6.1 Tareas rutinarias

- Revisar panel de observabilidad.
- Verificar estados de dominios y federaciones.
- Revisar alertas abiertas.
- Ejecutar mantenimiento programado:
  - rotación de claves,
  - limpieza de logs según retención,
  - validación de backups.

### 6.2 Cambios planificados

- Cualquier cambio que afecte:
  - Gateway,
  - Fabric,
  - Dominios,
  - Bus de eventos,
  - Telemetría,
  - debe:
    - programarse,
    - comunicarse,
    - tener plan de rollback,
    - ser monitoreado en tiempo real.

---

## 7. Relación con otros documentos YUN

- La Constitución YUN define cómo debe comportarse el sistema bajo fallo.
- El Blueprint define la arquitectura a operar.
- El Security & Data Standards define qué controles respetar durante incidentes.
- El Event Standard define cómo se comunican los cambios de estado.
- El ADR Index recoge decisiones que afecten la operación futura.

---

## 8. Actualización del manual

- Cualquier nueva experiencia operativa relevante (incidente grande, mejora sustancial) puede:
  - generar una nueva sección de este manual,
  - ser acompañada por ADR,
  - y requerir aprobación del Architecture Board antes de convertirse en estándar.
