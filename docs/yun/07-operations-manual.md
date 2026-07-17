# YUN Operations Manual – Continuidad, recuperación y monitoreo

**Versión:** v1.0  
**Fecha:** 2026-07-04  
**Ámbito:** Operación diaria, respuesta a incidentes, recuperación y continuidad

---

## 1. Objetivo

Este manual define cómo operar YUN en producción: qué monitorear, cómo reaccionar a fallos, cómo recuperar dominios y federaciones, y cómo mantener continuidad operativa.

---

## 2. Panel de observabilidad YUN

### 2.1 Vistas obligatorias

- **Vista de dominios:** Estado de Identity, Commerce, Knowledge, Telemetry, Gameplay. Latencia y errores por dominio.
- **Vista de federaciones:** Estado (HEALTHY, DEGRADED, DOWN) de Fed1–Fed7. Eventos recientes de salud/incident/policy.
- **Vista de seguridad:** Alertas actuales. Incidentes en curso. Intentos de ataque detectados.
- **Vista de rendimiento:** Latencia general. Throughput. Saturación de recursos.
- **Vista de auditoría:** Cambios en configuración. Operaciones administrativas. Acceso a datos P0.

### 2.2 Stack de observabilidad

| Capa | Tecnología |
|------|-----------|
| Métricas | Prometheus + Thanos |
| Logs | Loki + promtail |
| Trazas | Jaeger / OpenTelemetry |
| Panel | Grafana |

### 2.3 Regla YUN

Ningún servicio se considera "deployable" en producción sin estar instrumentado.

---

## 3. Modos de operación

### 3.1 Modo Normal
- Todos los dominios y federaciones en estado HEALTHY.
- Operaciones críticas habilitadas.
- Métricas dentro de rangos aceptables.

### 3.2 Modo Degradado por dominio
- Un dominio en estado DEGRADED o DOWN.
- Acciones:
  - Suspender operaciones críticas de ese dominio.
  - Mantener operaciones de lectura seguras si es posible.
  - Mantener los otros dominios operando.

### 3.3 Modo Degradado por federación
- Una federación en estado DEGRADED.
- Acciones:
  - Ajustar comportamiento del sistema en esa federación.
  - Desactivar funciones dependientes de dominios en fallo.
  - Activar modo simulación donde aplique.

### 3.4 Modo Recuperación
- Estado en el que se ejecutan acciones de restauración, recuperación de datos y rehidratación de estados efímeros.

---

## 4. Protocolo de recuperación ante fallos en dominios federados

### 4.1 Pasos del protocolo

1. **Detección**
   - Alertas de observabilidad indican fallo (errores, health checks, latencia).
   - La federación o dominio pasa a estado DEGRADED.

2. **Aislamiento**
   - Gateway: Bloquea operaciones críticas hacia el dominio/federación afectado.
   - Fabric: Evita nuevas sagas que dependan de ese dominio.
   - Servicios: Cambian a modo limitado (solo lectura, simulación).

3. **Comunicación**
   - Evento `FederationHealthChanged` emitido en `federations.events`.
   - Alertas automáticas a seguridad/ops.

4. **Diagnóstico**
   - Revisar logs, métricas y trazas.
   - Identificar causa raíz (infraestructura, base, despliegue, ataque).

5. **Mitigación**
   - Rollback si es falla de despliegue.
   - Restaurar servicio si es falla de base.
   - Aplicar medidas del Security Standard si es incidente de seguridad.

6. **Rehidratación**
   - Restaurar estados efímeros desde datos de identidad y eventos.
   - Verificar integridad de datos.

7. **Reentrada en servicio**
   - Cambiar estado a HEALTHY.
   - Gateway reabre operaciones críticas.
   - Registrar evento `FederationHealthChanged`.

8. **Post-mortem**
   - Documentar qué pasó, qué se hizo, qué debe mejorar.
   - Crear ADR si hubo cambios arquitectónicos.
   - Actualizar manual si se requiere nuevo procedimiento.

---

## 5. Playbooks de incidentes

### 5.1 Incidente de seguridad
1. Activar equipo de seguridad.
2. Aislar componentes sospechosos.
3. Revisar `security_events`, `security_alerts`, `security_incident_traces`.
4. Aplicar medidas: bloqueo de IPs, rotación de secretos, revisión de logs.
5. Informar a federaciones afectadas.
6. Ejecutar recuperación si hubo compromiso de datos.
7. Documentar en ADR y reporte de incidente.

### 5.2 Caída de dominio
1. Cambiar a modo degradado.
2. Suspender operaciones críticas del dominio.
3. Mantener experiencia de lectura.
4. Recuperar dominio (revisar despliegue, base, dependencias).
5. Rehidratar estados pendientes mediante eventos.

### 5.3 Caída de federación
1. Cambiar operaciones de esa federación a modo seguro.
2. Ajustar comportamiento de otras federaciones.
3. Seguir protocolo general de recuperación.

---

## 6. Operación diaria

### 6.1 Tareas rutinarias
- Revisar panel de observabilidad.
- Verificar estados de dominios y federaciones.
- Revisar alertas abiertas.
- Ejecutar mantenimiento programado: rotación de claves, limpieza de logs, validación de backups.

### 6.2 Cambios planificados
- Programarse, comunicarse, tener plan de rollback, ser monitoreado en tiempo real.

---

## 7. Relación con otros documentos YUN

| Documento | Relación |
|-----------|----------|
| Constitución YUN | Define cómo debe comportarse el sistema bajo fallo |
| Blueprint | Define la arquitectura a operar |
| Security & Data Standard | Define qué controles respetar durante incidentes |
| Event Standard | Define cómo se comunican los cambios de estado |
| ADR Index | Recoge decisiones que afecten la operación futura |
