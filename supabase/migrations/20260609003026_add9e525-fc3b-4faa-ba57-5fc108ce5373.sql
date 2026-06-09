
-- 1. Defensa en profundidad: revocar EXECUTE público en funciones SECURITY DEFINER sensibles
REVOKE EXECUTE ON FUNCTION public.award_points(uuid, text, integer, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
-- has_role debe permanecer ejecutable por authenticated/anon: lo usan políticas RLS
-- update_updated_at_column y forum_posts_only_likes_changed son triggers: no callable directamente

-- 2. CHECK constraints contra abuso en foro público
ALTER TABLE public.forum_posts
  ADD CONSTRAINT forum_posts_title_length CHECK (char_length(title) BETWEEN 1 AND 200),
  ADD CONSTRAINT forum_posts_content_length CHECK (content IS NULL OR char_length(content) <= 5000),
  ADD CONSTRAINT forum_posts_author_length CHECK (char_length(author_name) BETWEEN 1 AND 80);

ALTER TABLE public.forum_comments
  ADD CONSTRAINT forum_comments_content_length CHECK (char_length(content) BETWEEN 1 AND 2000);

-- 3. activity_log: whitelist de acciones permitidas para evitar poisoning del audit trail
DROP POLICY IF EXISTS "Users can insert their own activity" ON public.activity_log;
CREATE POLICY "Users can insert their own activity"
  ON public.activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND char_length(action) BETWEEN 1 AND 64
    AND action ~ '^[a-z][a-z0-9_]{0,63}$'
    AND (target_type IS NULL OR char_length(target_type) <= 64)
  );

-- 4. Auditoría: índice para consultas de cooldown (Etapa 4 — performance)
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_action_created
  ON public.point_transactions (user_id, action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_created
  ON public.activity_log (user_id, created_at DESC);
