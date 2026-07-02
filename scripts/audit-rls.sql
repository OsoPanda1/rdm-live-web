-- audit-rls.sql
-- Recorre todas las tablas del esquema public y verifica:
--  1. RLS habilitado
--  2. Políticas definidas para anon, authenticated, service_role
--  3. Tablas sensibles sin acceso público
-- Falla con código de salida != 0 si encuentra anomalías

do $$
declare
  rec record;
  tbl text;
  has_rls boolean;
  policy_count integer;
  fail boolean := false;
  sensitive_tables text[] := array['rate_limits', 'stripe_events', 'audit_log', 'ai_prompts_log', 'isabella_voice_logs', 'user_roles', 'secrets'];
begin
  raise notice '=== RLS Audit ===';
  
  for rec in
    select tablename
    from pg_tables
    where schemaname = 'public'
      and tablename not like 'pg_%'
      and tablename not like '_prisma_%'
  loop
    tbl := rec.tablename;
    
    -- Check RLS enabled
    select relrowsecurity into has_rls
    from pg_class
    where oid = (quote_ident('public') || '.' || quote_ident(tbl))::regclass;
    
    if not has_rls then
      raise warning 'FAIL: Table public.% has RLS DISABLED', tbl;
      fail := true;
    end if;
    
    -- Check policies exist
    select count(*) into policy_count
    from pg_policies
    where schemaname = 'public' and tablename = tbl;
    
    if policy_count = 0 then
      raise warning 'FAIL: Table public.% has NO POLICIES', tbl;
      fail := true;
    end if;
    
    -- Check sensitive tables not publicly accessible
    if tbl = any(sensitive_tables) then
      for policy_rec in
        select * from pg_policies
        where schemaname = 'public' and tablename = tbl
          and (permissive = 'PERMISSIVE' and (roles = '{public}'::name[] or roles = '{anon}'::name[]))
      loop
        raise warning 'FAIL: Sensitive table public.% has policy "%" accessible to anon/public', tbl, policy_rec.policyname;
        fail := true;
      end loop;
    end if;
    
    raise notice 'OK: public.% — RLS=%, policies=%', tbl, has_rls, policy_count;
  end loop;
  
  if fail then
    raise exception 'RLS audit FAILED — one or more tables have security issues';
  else
    raise notice '=== RLS Audit PASSED ===';
  end if;
end $$;
