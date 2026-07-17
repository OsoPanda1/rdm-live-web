-- =============================================================================
-- PLATFORM COMPLETE FIX — author_id, businesses, storage, leaderboard, avatars
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) ADD author_id COLUMNS to forum tables (needed by RLS policies)
-- -----------------------------------------------------------------------------
ALTER TABLE public.forum_posts
  ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.forum_comments
  ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Backfill author_id from existing posts where author_name matches a profile
-- (best-effort; posts without match keep NULL which RLS handles gracefully)
UPDATE public.forum_posts fp
  SET author_id = p.id
  FROM public.profiles p
  WHERE fp.author_id IS NULL
    AND (p.display_name = fp.author_name OR p.id::text = fp.author_name);

UPDATE public.forum_comments fc
  SET author_id = p.id
  FROM public.profiles p
  WHERE fc.author_id IS NULL
    AND (p.display_name = fc.author_name OR p.id::text = fc.author_name);

-- -----------------------------------------------------------------------------
-- 2) RECREATE RLS POLICIES for forum tables (handle NULL author_id gracefully)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "forum_posts_auth_insert" ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts_author_update" ON public.forum_posts;
DROP POLICY IF EXISTS "forum_posts_author_delete" ON public.forum_posts;
DROP POLICY IF EXISTS "forum_comments_auth_insert" ON public.forum_comments;
DROP POLICY IF EXISTS "forum_comments_author_update" ON public.forum_comments;
DROP POLICY IF EXISTS "forum_comments_author_delete" ON public.forum_comments;

-- forum_posts: authenticated users can insert; author_id defaults to auth.uid()
CREATE POLICY "forum_posts_auth_insert"
  ON public.forum_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    COALESCE(author_id, auth.uid()) = auth.uid()
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

CREATE POLICY "forum_comments_auth_insert"
  ON public.forum_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    COALESCE(author_id, auth.uid()) = auth.uid()
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
-- 3) ADD image_url and update trigger to forum_posts
-- -----------------------------------------------------------------------------
ALTER TABLE public.forum_posts
  ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE public.forum_posts
  ADD COLUMN IF NOT EXISTS video_url TEXT;

-- -----------------------------------------------------------------------------
-- 4) BUSINESSES TABLE — full schema with all UI fields
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  owner_name TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  short_description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'OTROS',
  subcategory TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  email TEXT DEFAULT '',
  website TEXT DEFAULT '',
  address TEXT DEFAULT '',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  image_url TEXT DEFAULT '',
  image_url2 TEXT DEFAULT '',
  image_url3 TEXT DEFAULT '',
  video_url TEXT DEFAULT '',
  schedule_display TEXT DEFAULT '',
  facebook TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  tiktok TEXT DEFAULT '',
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pending',
  views_count INTEGER NOT NULL DEFAULT 0,
  rating DOUBLE PRECISION DEFAULT 0,
  price_range TEXT DEFAULT 'MODERADO',
  giro TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON public.businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_premium ON public.businesses(is_premium) WHERE is_premium = true;

GRANT SELECT ON public.businesses TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
GRANT ALL ON public.businesses TO service_role;

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "businesses_public_read"
  ON public.businesses FOR SELECT
  USING (true);

CREATE POLICY "businesses_auth_insert"
  ON public.businesses FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "businesses_owner_update"
  ON public.businesses FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "businesses_owner_delete"
  ON public.businesses FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- -----------------------------------------------------------------------------
-- 5) FIX profiles_public VIEW — include total_points and level for Leaderboard
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS public.profiles_public;
CREATE OR REPLACE VIEW public.profiles_public
  WITH (security_invoker=on) AS
  SELECT id, display_name, avatar_url, total_points, level, location, created_at
  FROM public.profiles;
GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 6) STORAGE BUCKET for avatars and business images
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Public read access to media bucket
CREATE POLICY "media_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'media');

-- Authenticated users can upload to media/{userId}/
CREATE POLICY "media_auth_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update/delete their own files
CREATE POLICY "media_owner_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media' AND owner = auth.uid());

CREATE POLICY "media_owner_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media' AND owner = auth.uid());

-- -----------------------------------------------------------------------------
-- 7) ADD updated_at TRIGGER to businesses
-- -----------------------------------------------------------------------------
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 8) MERCHANT ROLE auto-assign on business verification
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.auto_assign_merchant_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_verified = true AND (OLD.is_verified = false OR OLD IS NULL) AND NEW.owner_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.owner_id, 'merchant')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_business_verified
  AFTER INSERT OR UPDATE OF is_verified ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_merchant_role();
