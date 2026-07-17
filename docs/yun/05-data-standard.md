# YUN Data Standard – Dominios, catálogo y fragmentación

**Versión:** v1.0  
**Fecha:** 2026-07-04  
**Ámbito:** Gobernanza de datos en YUN

---

## 1. Objetivo

Este documento define las reglas de datos de YUN: dominios, catálogo, fragmentación, replicación y roles de gobierno.

---

## 2. Dominios y sus bases

| Dominio | Base | Tipo | Responsabilidad |
|---------|------|------|-----------------|
| **Identity** | Supabase Postgres | Relacional | Usuarios, roles, perfiles, autenticación, badges |
| **Commerce** | Neon Postgres | Relacional | Pagos, suscripciones, facturas, negocios, Stripe |
| **Knowledge** | Turso / libSQL | SQL distribuido | Foro, contribuciones, ontologías, IA |
| **Telemetry** | Cloudflare D1 | SQL ligero | Logs, métricas, auditoría, salud federada |
| **Gameplay** | Upstash Redis | Key-value | Puntos, XP, rachas, sesiones, caché efímero |

---

## 3. Data Catalog

Tabla `data_catalog` en Telemetry. Cada fila representa una entidad de datos:

```sql
CREATE TABLE data_catalog (
  entity TEXT PRIMARY KEY,
  domain TEXT NOT NULL,
  federation_scope TEXT[],
  database TEXT NOT NULL,
  table_or_key TEXT NOT NULL,
  owner TEXT NOT NULL,
  purpose TEXT NOT NULL,
  retention_policy TEXT NOT NULL,
  sensitivity TEXT NOT NULL CHECK (sensitivity IN ('P0', 'P1', 'P2')),
  encryption TEXT NOT NULL DEFAULT 'tls',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.1 Ejemplo de entradas

| entity | domain | database | table_or_key | sensitivity |
|--------|--------|----------|-------------|-------------|
| user_profile | Identity | supabase | profiles | P0 |
| payment_event | Commerce | neon | stripe_events | P0 |
| forum_post | Knowledge | turso | posts | P2 |
| security_log | Telemetry | d1 | security_events | P1 |
| game_session | Gameplay | redis | session:* | P2 |

---

## 4. Clasificación de datos

### Niveles

- **P0:** Identidad, credenciales, datos financieros, PII fuerte.
- **P1:** Auditoría, reputación, logs de seguridad.
- **P2:** Contenido público, datos de juego efímeros, métricas agregadas.

### Tratamiento

- **P0:** Cifrado en reposo + tránsito, acceso estricto, retención mínima.
- **P1:** Cifrado en tránsito, acceso restringido, retención para cumplimiento.
- **P2:** Cifrado en tránsito, uso flexible, retención operativa.

---

## 5. Fragmentación de datos

- Datos P0 se almacenan en dominios dedicados, separados de datos menos sensibles.
- Atributos muy sensibles (documentos, identificadores oficiales) se fragmentan en tablas o dominios específicos con acceso reducido.
- Los datos P1 y P2 pueden compartir espacios de almacenamiento con controles adecuados.

---

## 6. Reglas de réplica y cachés

- Replicación lógica mediante eventos (CDC event-driven).
- Cachés (Redis, Turso) se usan para lecturas frecuentes de datos P2.
- **Regla:** Ningún caché puede considerarse fuente de verdad.
- Datos P0 no deben almacenarse en cachés sin cifrado adicional.

---

## 7. Roles de gobierno de datos

### Data Owner (por dominio)
- Responsable de la verdad del dominio.
- Decide esquemas, retención, clasificación.
- Rinde cuentas al Architecture Board.

### Data Steward (por federación)
- Responsable de cómo se usan los datos en cada federación.
- Asegura cumplimiento de políticas de uso, anonimización, permisos.

### Data Architect (YUN)
- Diseña el modelo general de datos.
- Mantiene el Data Catalog.
- Coordina cambios transversales.

### Security & Privacy Officer
- Vela por clasificación de sensibilidad.
- Revisa cifrado, accesos y cumplimiento regulatorio.

### Operations/SRE
- Responsable de integridad operativa.
- Vela por backups, restauraciones y continuidad de acceso a datos.

### Reglas
- Ningún cambio de modelo de datos sensible se hace sin aprobación del Data Owner y revisión del Data Architect.
- Ninguna exposición de datos hacia terceros se hace sin revisión del Security & Privacy Officer.
