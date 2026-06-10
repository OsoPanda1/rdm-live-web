# Gobernanza y antifragilidad — RDM Digital LTOS

## Protocolo de Cambios

Cada cambio relevante debe incluir:

1. **Evidencia**: archivos, módulos, imports, rutas runtime, logs o métricas que justifican el cambio.
2. **Beneficio vs riesgo**: mejora esperada y posibles roturas.
3. **Rollback**: revert PR, feature flag, restauración de config o plan de proveedor alterno.
4. **Validación mínima**: lint, build, tests y verificación manual/E2E del flujo afectado.

## Incident Response Mode

Se activa cuando build, tests, auth, datos, IA, mapas, pagos, donaciones o flujos críticos fallan. Mientras esté activo:

- No se aceptan refactors cosméticos.
- Se prioriza restaurar servicio y capturar evidencia.
- Se registra incidente, causa raíz, mitigación, validación y seguimiento.

## Territorial Criticality Index (TCI)

- T0: experimental, sin impacto runtime.
- T1–T2: contenido/UX no crítico.
- T3–T4: comercio, rutas, mapas, analítica operativa.
- T5: identidad, privacidad, permisos, pagos/donaciones.
- T6: kernel, datos territoriales, telemetría crítica.
- T7: seguridad ciudadana, incidentes, continuidad territorial.

## Telemetry Exposure (TE)

- TE0: sin telemetría.
- TE1: métricas locales no sensibles.
- TE2: eventos agregados de producto.
- TE3: sensores/red/ubicación agregada.
- TE4: señales críticas, seguridad o continuidad operativa.
