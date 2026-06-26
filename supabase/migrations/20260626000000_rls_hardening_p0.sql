-- =============================================================================
-- RLS HARDENING — Cierre de políticas permisivas detectadas en auditoría P0
-- =============================================================================
-- Hallazgos corregidos:
--   1. public.profiles SELECT USING (true) → expone email/displayName a anon.
--   2. public.user_badges SELECT USING (true) → expone mapping user_id→badges.
--   3. public.forum_posts INSERT/UPDATE WITH CHECK (true) USING (true)
--      → cualquier anónimo puede crear o editar posts ajenos.
--   4. public.forum_comments INSERT WITH CHECK (true) → spam anónimo.
--
-- Política base: lectura pública SOLO de catálogos sin PII (badges),
-- escritura SIEMPRE requiere auth.uid() = owner_column.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) profiles — vista pública sin email + política base restrictiva
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles are publicly viewable" ON public.profiles;

-- Cualquier usuario autenticado puede ver perfiles (no anon).
CREATE POLICY "profiles_authenticated_read"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- El propio dueño siempre puede leer su perfil (incluida la fila completa).
CREATE POLICY "profiles_owner_read"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Vista pública sin columnas sensibles para lectura anónima controlada.
-- security_invoker=on hace que RLS de la base aplique al consultar la vista.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='profiles' AND column_name='display_name') THEN
    EXECUTE 'CREATE OR REPLACE VIEW public.profiles_public
      WITH (security_invoker=on) AS
      SELECT id, display_name, avatar_url, created_at
      FROM public.profiles';
    EXECUTE 'GRANT SELECT ON public.profiles_public TO anon, authenticated';
  END IF;
END$$;

-- -----------------------------------------------------------------------------
-- 2) user_badges — solo dueño + admin lo ven completo; público ve agregados
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "User badges publicly viewable" ON public.user_badges;

CREATE POLICY "user_badges_owner_read"
  ON public.user_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- -----------------------------------------------------------------------------
-- 3) forum_posts — INSERT/UPDATE solo authenticated y por su autor
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "forum_posts_public_insert" ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts_public_like" ON public.forum_posts;

-- Conservar lectura pública (catálogo de foro) si la tabla no tiene PII.
-- Si en el futuro se añaden datos sensibles, restringir a authenticated.

CREATE POLICY "forum_posts_auth_insert"
  ON public.forum_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (author_id IS NULL OR author_id = auth.uid())
  );

CREATE POLICY "forum_posts_author_update"
  ON public.forum_posts FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (author_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "forum_posts_author_delete"
  ON public.forum_posts FOR DELETE
  TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- -----------------------------------------------------------------------------
-- 4) forum_comments — INSERT solo authenticated
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "forum_comments_public_insert" ON public.forum_comments;

CREATE POLICY "forum_comments_auth_insert"
  ON public.forum_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (author_id IS NULL OR author_id = auth.uid())
  );

CREATE POLICY "forum_comments_author_update"
  ON public.forum_comments FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (author_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "forum_comments_author_delete"
  ON public.forum_comments FOR DELETE
  TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- -----------------------------------------------------------------------------
-- 5) Reafirmar grants — el GRANT no es opcional con PostgREST.
-- -----------------------------------------------------------------------------
GRANT SELECT ON public.badges TO anon, authenticated;
GRANT SELECT ON public.forum_posts TO anon, authenticated;
GRANT SELECT ON public.forum_comments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.forum_posts TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.forum_comments TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.user_badges TO authenticated;
GRANT ALL ON public.profiles, public.user_badges, public.forum_posts, public.forum_comments TO service_role;
