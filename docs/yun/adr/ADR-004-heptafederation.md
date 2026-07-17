# ADR-004 – Modelo heptafederado

**Fecha:** 2026-07-04  
**Estado:** Accepted  
**Decisor(es):** YUN Architecture Board

---

## Contexto

El ecosistema TAMV Online representa múltiples dimensiones de la realidad de Real del Monte y de la civilización digital: gobierno, academia, industria, ciudadanía, infraestructura, comunidad y metaverso. Estas dimensiones necesitan una estructura organizativa que permita coordinación sin mezclar responsabilidades.

## Decisión

Organizar el sistema en **7 federaciones coordinadas** bajo el modelo Heptafederado TAMV MD-X4:

| Federación | Dominio | Glyph |
|------------|---------|-------|
| **ANUBIS** | Doctrina / Kernel ontológico | 𓃣 |
| **MDD-TAMV** | Territorio / Gemelo digital | ◈ |
| **BOOKPI** | Conocimiento / Tomos & corpus | ✦ |
| **PHOENIX** | Comercio / Ciclo de renacimiento | 𓅓 |
| **KAOS** | Caos creador / Investigación soberana | Ϟ |
| **CHRONOS** | Tiempo / Timeline civilizatorio | ◷ |
| **DEKATEOTL** | Decimación divina / IPFS & pagos | ✺ |

Cada federación:
- Tiene su dominio de responsabilidad.
- Se coordina con las demás a través del Data Fabric y eventos.
- Puede degradarse independientemente sin colapsar el sistema.

## Alternativas consideradas

- **Monolito sin federación:** Simple pero inescalable y frágil.
- **Microservicios sin estructura:** Desacoplamiento sin coordinación, caos.
- **Federaciones por tecnología:** Mezcla responsabilidades de negocio con infraestructura.

## Consecuencias

### Positivas
- Cada federación tiene claridad de responsabilidad.
- El sistema puede degradar por federación sin colapsar.
- Escalabilidad orgánica (nuevas federaciones sin romper diseño).
- Modelo alineado con la realidad territorial de Real del Monte.

### Negativas
- Complejidad de coordinación entre federaciones.
- Requiere coordinadores de federación para gestionar estado.
- Cada federación necesita su propio Data Steward.

### Riesgos
- Complejidad mitigada con estándares de eventos y contratos claros.
- Coordinación facilitada por el Data Fabric como orquestador central.

---

## Referencias

- [YUN Blueprint – Federaciones](../03-blueprint.md)
- [YUN Constitution – Principio 2.8](../01-constitution.md)
- [src/lib/federation.ts](../../src/lib/federation.ts)
