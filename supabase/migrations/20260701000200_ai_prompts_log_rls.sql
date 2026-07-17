-- supabase/migrations/20260701000200_ai_prompts_log_rls.sql
-- Fix: Habilitar RLS en ai_prompts_log (la migración anterior solo creó la tabla)

-- 1. Habilitar RLS
ALTER TABLE ai_prompts_log ENABLE ROW LEVEL SECURITY;

-- 2. Política de lectura: solo el propietario del prompt
CREATE POLICY "ai_prompts_log_select_own"
  ON ai_prompts_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Política de inserción: solo el propietario puede insertar sus propios prompts
CREATE POLICY "ai_prompts_log_insert_own"
  ON ai_prompts_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Política de admin: administradores pueden leer todo
CREATE POLICY "ai_prompts_log_admin_select"
  ON ai_prompts_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- 5. Política de service_role: permite acceso completo (para edge functions)
CREATE POLICY "ai_prompts_log_service_role_all"
  ON ai_prompts_log
  FOR ALL
  USING (auth.role() = 'service_role');

-- 6. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_ai_prompts_log_user_id ON ai_prompts_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_log_created_at ON ai_prompts_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_log_model ON ai_prompts_log(model);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_log_trace_id ON ai_prompts_log(trace_id);
