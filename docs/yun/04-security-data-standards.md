# YUN Security & Data Standards

**Versión:** v1.0  
**Fecha:** 2026-07-04  
**Ámbito:** Seguridad de aplicación, infraestructura y datos en YUN

---

## 1. Objetivo

Este documento define los estándares obligatorios de seguridad y manejo de datos que deben cumplir todos los sistemas que operan bajo YUN.

---

## 2. Estándares de seguridad

### 2.1 Perímetro y Gateway

- TLS obligatorio en todos los endpoints externos.
- Uso de certificados gestionados centralmente.
- Autenticación:
  - JWT emitidos por el dominio de identidad.
  - OAuth2 para integraciones externas donde aplique.
- Filtros WAF:
  - Bloqueo de patrones conocidos de inyección y abuso.
- Rate limiting:
  - Por usuario.
  - Por federación.
  - Por origen.

**Nunca:**
- Exponer endpoints sin TLS.
- Permitir acceso directo a servicios internos sin Gateway.

### 2.2 Servicios y lógica de negocio

- Validación de entrada:
  - Uso de esquemas (JSON Schema o equivalentes).
  - Rechazo de parámetros fuera de rango o formato.
- Consultas a bases:
  - Siempre parametrizadas.
  - Nunca construidas por concatenación de strings.
- Manejo de errores:
  - Mensajes genéricos al cliente.
  - Detalles internos solo en logs seguros.

**Nunca:**
- Insertar directamente input de usuario en consultas SQL/NoSQL.
- Mostrar detalles de stack trace o estructura de base al usuario final.

### 2.3 Bases de datos

- Acceso:
  - Cuentas con mínimo privilegio.
  - Separación de roles de lectura y escritura.
- Cifrado:
  - En reposo para datos sensibles.
  - En tránsito para todas las conexiones.
- Auditoría:
  - Registro de operaciones críticas (altas, bajas, cambios en datos sensibles).
  - Monitoreo de patrones anómalos.

**Nunca:**
- Compartir cuentas de base entre múltiples servicios.
- Abrir acceso de administración de base hacia Internet.

### 2.4 Gestión de secretos

- Centralización:
  - Todos los secretos se almacenan en el sistema de gestión de secretos.
- Distribución:
  - Los servicios obtienen secretos al iniciar, usando autenticación de servicio.
- Rotación:
  - Claves se rotan periódicamente según criticidad.
- Auditoría:
  - Todo acceso a secretos queda registrado.

**Nunca:**
- Commitear secretos en repositorios.
- Usar `.env` sin cifrado como fuente definitiva de configuración.

---

## 3. Estándares de datos

### 3.1 Clasificación de datos

| Nivel | Contenido |
|-------|-----------|
| **P0** | Identidad, credenciales, datos financieros, PII fuerte |
| **P1** | Auditoría, reputación, logs de seguridad |
| **P2** | Contenido público, datos de juego efímeros, métricas agregadas |

Cada entidad en el `data_catalog` debe tener nivel de sensibilidad asignado.

### 3.2 Tratamiento por nivel

- **P0:**
  - Cifrado en reposo.
  - Cifrado en tránsito.
  - Acceso estrictamente controlado.
  - Retención mínima necesaria según regulación.
- **P1:**
  - Cifrado en tránsito.
  - Acceso restringido a roles específicos.
  - Retención para análisis y cumplimiento.
- **P2:**
  - Cifrado en tránsito.
  - Uso más flexible (paneles, experiencias, etc.)
  - Retención según utilidad operativa.

### 3.3 Fragmentación de datos

- Datos P0 se almacenan en dominios dedicados, separados de datos menos sensibles.
- Fragmentación: Separar atributos muy sensibles (ej. documentos, identificadores oficiales) en tablas o dominios específicos, con acceso reducido.
- Los datos P1 y P2 pueden compartir espacios de almacenamiento con controles adecuados.

### 3.4 Replicación y cachés

- La replicación de datos entre sistemas se realiza mediante eventos (CDC), nunca con copias directas no controladas.
- Cachés: Redis/Turso pueden almacenar datos menos sensibles y efímeros.
- P0 no debe almacenarse en cachés sin cifrado adicional.

### 3.5 Políticas de retención

- Cada entidad en `data_catalog` debe tener:
  - Política de retención definida (ej. 1 año, 5 años, indefinido).
  - Razón (regulación, operación, análisis).
- Datos P0: se borran o anonimizan cuando ya no son necesarios.
- Datos P1/P2: se retienen según necesidades operativas y legales.

---

## 4. Cumplimiento

- Ningún servicio puede entrar a producción sin cumplir este estándar.
- Las revisiones de arquitectura deben incluir verificación de:
  - seguridad perimetral,
  - seguridad de servicios,
  - seguridad de datos,
  - correcta clasificación y tratamiento de datos.

---

## 5. Evolución

Este documento se versiona junto con YUN:
- Cambios se proponen como PR.
- Se revisan por el Architecture Board y seguridad.
- Se documentan en ADR.
