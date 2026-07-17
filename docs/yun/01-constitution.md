# YUN Constitution – Principios inmutables de arquitectura

**Versión:** v1.0  
**Fecha:** 2026-07-04  
**Ámbito:** TAMV Online, Nodo Cero, RDM Digital, Isabella, 7 Federaciones

---

## 1. Propósito

La Constitución YUN define los principios inmutables de la arquitectura. Estos principios no son recomendaciones: son reglas obligatorias que limitan y guían el diseño, la implementación y la operación de todos los sistemas que se ejecutan sobre YUN.

---

## 2. Principios inmutables

### 2.1 Una sola verdad por dominio

- Cada dominio (Identity, Commerce, Knowledge, Telemetry, Gameplay) tiene una única fuente de verdad para sus datos.
- Ningún otro sistema puede asumir el rol de fuente de verdad de ese dominio.
- Toda lectura y escritura que afecte la verdad de un dominio debe pasar por sus contratos oficiales (API o eventos).

**Prohibiciones:**
- Nunca duplicar la verdad de un dominio en otra base como si fuera primaria.
- Nunca escribir directamente en la base de otro dominio.

---

### 2.2 Evento antes que acoplamiento

- Todo cambio significativo en estado de negocio (creación, actualización, eliminación de entidades relevantes) debe generar un evento en el sistema nervioso de YUN.
- Los dominios deben comunicarse preferentemente mediante eventos, no por llamadas directas acopladas.

**Prohibiciones:**
- Nunca diseñar lógica crítica que dependa de múltiples dominios sin eventos trazables.
- Nunca introducir dependencias directas entre servicios que puedan romperse sin registro.

---

### 2.3 Secreto fuera del código

- Ningún secreto (contraseñas, tokens, claves de cifrado, credenciales de base de datos) puede vivir en:
  - código fuente,
  - archivos `.env` sin cifrar,
  - documentación sin control.
- Todos los secretos se gestionan por un sistema de gestión de secretos central (por ejemplo, Vault).

**Prohibiciones:**
- Nunca commitear secretos en Git.
- Nunca configurar secretos manualmente en servidores sin pasar por el sistema de gestión.
- Nunca compartir secretos entre equipos por canales no seguros.

---

### 2.4 Sin acceso directo entre dominios

- Ningún dominio puede acceder directamente a la base de datos de otro dominio.
- Toda interacción entre dominios debe ser:
  - vía Data Fabric,
  - vía contratos (APIs internas),
  - y/o vía eventos.

**Prohibiciones:**
- Nunca abrir conexión de aplicación a la base de otro dominio.
- Nunca usar consultas cross-database para operar sobre datos de múltiples dominios.

---

### 2.5 Una sola entrada: Gateway YUN

- Todo tráfico externo (web, móvil, XR, integraciones) debe entrar por el Gateway YUN.
- Ningún cliente externo puede comunicarse directamente con servicios internos o bases.

**Prohibiciones:**
- Nunca exponer servicios internos directamente a Internet.
- Nunca omitir el Gateway en flujos de autenticación, autorización o auditoría.

---

### 2.6 Observabilidad obligatoria

- Toda operación crítica debe:
  - generar logs,
  - emitir métricas,
  - y permitir trazas.
- Ningún servicio de producción puede desplegarse sin instrumentación mínima definida.

**Prohibiciones:**
- Nunca desplegar servicios no instrumentados en producción.
- Nunca ignorar alertas críticas generadas por observabilidad.

---

### 2.7 Resiliencia degradable

- Ante la falla de un dominio o federación, el sistema debe entrar en modo degradado:
  - suspender funciones críticas,
  - mantener funciones seguras,
  - evitar apagado total.
- La degradación debe ser observable y reversible.

**Prohibiciones:**
- Nunca diseñar operaciones que dependan absolutamente de todos los dominios al mismo tiempo.
- Nunca permitir que la caída de un dominio derribe toda la plataforma.

---

### 2.8 Gobernanza formal

- Ningún cambio arquitectónico significativo puede hacerse sin:
  - propuesta formal,
  - revisión,
  - decisión registrada,
  - ADR asociado.
- La gobernanza se ejerce a través del YUN Architecture Board.

**Prohibiciones:**
- Nunca introducir nuevos dominios sin proceso de gobernanza.
- Nunca modificar principios de esta Constitución sin versionado y aprobación formal.

---

## 3. Aplicación

Todos los diseños, implementaciones, despliegues y operaciones sobre YUN deben:

- ser contrastados contra esta Constitución,
- documentar cualquier conflicto,
- y obtener aprobación explícita para excepciones.

Las excepciones se consideran **eventos extraordinarios**, deben tener fecha de revisión y se documentan como ADR en estado "Excepción".

---

## 4. Versionado

- Este documento se versiona en Git.
- Cada cambio requiere:
  - branch dedicada,
  - revisión del Architecture Board,
  - ADR que explique la decisión.
- Las versiones se etiquetan como:
  - `yun-constitution-vX.Y`.

---

## 5. Vigencia

La versión v1.0 entra en vigor en el momento en que TAMV Online y Nodo Cero adoptan YUN como arquitectura oficial. Toda nueva versión debe especificar en qué fecha entra en vigencia y qué cambios introduce sobre la anterior.
