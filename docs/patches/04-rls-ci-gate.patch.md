# Parche 04 — RLS audit + CI gate (Fase 4, riesgo alto)

Script SQL que audita todas las tablas de `public` y falla el CI si encuentra tablas sin RLS o políticas peligrosas (`USING (true)` en escritura, sin `GRANT`, etc.).

---

## Archivo nuevo: `scripts/audit-rls.sql`

```sql
-- audit-rls.sql — falla con exit code != 0 si detecta violaciones
-- Uso: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/audit-rls.sql

\set QUIET on

-- 1. Tablas sin RLS habilitado
DO $$
DECLARE
  offending record;
  found_issue boolean := false;
BEGIN
  FOR offending IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT IN ('schema_migrations', 'supabase_migrations')
      AND NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = pg_tables.schemaname
          AND c.relname = pg_tables.tablename
          AND c.relrowsecurity = true
      )
  LOOP
    RAISE WARNING 'RLS DISABLED: %.%', offending.schemaname, offending.tablename;
    found_issue := true;
  END LOOP;
  IF found_issue THEN RAISE EXCEPTION 'RLS is disabled on one or more public tables'; END IF;
END$$;

-- 2. Políticas de escritura con USING (true) o WITH CHECK (true)
DO $$
DECLARE
  offending record;
  found_issue boolean := false;
BEGIN
  FOR offending IN
    SELECT schemaname, tablename, policyname, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND cmd IN ('INSERT', 'UPDATE', 'DELETE', 'ALL')
      AND (qual = 'true' OR with_check = 'true')
  LOOP
    RAISE WARNING 'DANGEROUS POLICY: %.%.% (cmd=%, using=%, with_check=%)',
      offending.schemaname, offending.tablename, offending.policyname,
      offending.cmd, offending.qual, offending.with_check;
    found_issue := true;
  END LOOP;
  IF found_issue THEN RAISE EXCEPTION 'One or more policies use USING (true) or WITH CHECK (true) on write operations'; END IF;
END$$;

-- 3. Tablas con RLS pero sin ninguna policy (efectivamente inaccesibles — probable bug)
DO $$
DECLARE
  offending record;
  found_issue boolean := false;
BEGIN
  FOR offending IN
    SELECT c.relname AS tablename
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relrowsecurity = true
      AND NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.tablename = c.relname AND p.schemaname = 'public')
  LOOP
    RAISE WARNING 'RLS ON BUT NO POLICIES: public.% (table is unreachable via Data API)', offending.tablename;
    found_issue := true;
  END LOOP;
  IF found_issue THEN RAISE EXCEPTION 'Tables with RLS enabled but no policies detected'; END IF;
END$$;

-- 4. Tablas sin GRANT explícito a authenticated (probable falla silenciosa 401 en Data API)
DO $$
DECLARE
  offending record;
  found_issue boolean := false;
BEGIN
  FOR offending IN
    SELECT c.relname AS tablename
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relrowsecurity = true
      AND NOT has_table_privilege('authenticated', format('public.%I', c.relname), 'SELECT')
  LOOP
    RAISE WARNING 'MISSING GRANT: public.% has no SELECT grant to authenticated', offending.tablename;
    found_issue := true;
  END LOOP;
  IF found_issue THEN RAISE EXCEPTION 'Tables without SELECT grant to authenticated detected'; END IF;
END$$;

\echo 'RLS audit passed ✓'
```

---

## Archivo nuevo: `.github/workflows/rls-audit.yml`

```yaml
name: RLS Audit
on:
  pull_request:
    paths: ['supabase/migrations/**']
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: rls_audit
        ports: ['5432:5432']
        options: >-
          --health-cmd="pg_isready -U postgres"
          --health-interval=5s --health-timeout=5s --health-retries=10
    steps:
      - uses: actions/checkout@v4

      - name: Install Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Apply migrations to fresh DB
        env:
          PGPASSWORD: postgres
        run: |
          for f in supabase/migrations/*.sql; do
            echo "→ $f"
            psql -h localhost -U postgres -d rls_audit -v ON_ERROR_STOP=1 -f "$f"
          done

      - name: Run RLS audit
        env:
          PGPASSWORD: postgres
        run: psql -h localhost -U postgres -d rls_audit -v ON_ERROR_STOP=1 -f scripts/audit-rls.sql
```

---

## Checklist post-aplicación

- [ ] `psql "$DATABASE_URL" -f scripts/audit-rls.sql` corre localmente sin errores contra el schema actual.
- [ ] Si falla, corregir tablas antes de mergear el workflow.
- [ ] Workflow verde en el PR de introducción.
- [ ] Añadir `rls-audit` como **required check** en la protección de rama `main` (Settings → Branches).
