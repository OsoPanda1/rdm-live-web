# RDM Digital LTOS — Política de Seguridad

RDM Digital LTOS es una plataforma territorial crítica para el ecosistema de Real del Monte. La seguridad de los datos, de los usuarios y de la infraestructura es prioritaria.

## Alcance

Esta política aplica a:
- Repositorio `rdm-digital-ltos` y todos sus módulos.
- Aplicaciones web (visitante, admin).
- Servicios de dominio (IA, gemelo territorial, economía, analítica, cultura).
- Librerías base (geo-engine, core-kernel, data-models, ui-kit).

## Reporte responsable de vulnerabilidades

Si detectas una vulnerabilidad de seguridad:

1. **No abras un issue público.**
2. Envía un correo a: `seguridad@rdm.digital` (actualiza con tu correo real).
3. Incluye descripción, pasos para reproducirlo, impacto potencial y cualquier POC disponible.

Nos comprometemos a reconocer recepción en un máximo de 72 horas, investigar y coordinar una solución sin exponer datos sensibles.

## Expectativas

Pedimos a la comunidad no explotar vulnerabilidades en sistemas reales, no acceder a datos personales o confidenciales y no realizar ataques de denegación de servicio.

## Gestión de secretos

- No se deben versionar archivos `.env` ni credenciales.
- Cualquier clave o token debe residir en variables de entorno o gestores de secretos como Vault, Secret Manager o equivalentes por entorno.
- Los mantenedores revisarán periódicamente el repositorio para evitar filtraciones accidentales.

## Actualizaciones de dependencias

- Se ejecutará `npm audit`/`pnpm audit` de forma regular.
- Vulnerabilidades **HIGH/CRITICAL** deben ser atendidas con prioridad y documentadas en los cambios.

## Política de parches

- Vulnerabilidades que afecten módulos T5–T7 (identidad, kernel, ciudadano crítico) se tratarán como incidentes mayores.
- El proceso de Incident Response se rige por los protocolos internos del proyecto (ver `docs/GOVERNANCE.md`).
