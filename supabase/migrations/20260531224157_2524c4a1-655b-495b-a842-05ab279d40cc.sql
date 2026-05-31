ALTER TABLE public.forum_posts
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Tighten the update policy: only allow updating the `likes` column, nothing else.
DROP POLICY IF EXISTS "forum_posts_public_like" ON public.forum_posts;

CREATE OR REPLACE FUNCTION public.forum_posts_only_likes_changed()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.id <> OLD.id
     OR NEW.author_name IS DISTINCT FROM OLD.author_name
     OR NEW.author_avatar IS DISTINCT FROM OLD.author_avatar
     OR NEW.title IS DISTINCT FROM OLD.title
     OR NEW.content IS DISTINCT FROM OLD.content
     OR NEW.image_url IS DISTINCT FROM OLD.image_url
     OR NEW.video_url IS DISTINCT FROM OLD.video_url
     OR NEW.place_name IS DISTINCT FROM OLD.place_name
     OR NEW.category IS DISTINCT FROM OLD.category
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'Only the likes column may be updated by public users';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS forum_posts_only_likes ON public.forum_posts;
CREATE TRIGGER forum_posts_only_likes
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.forum_posts_only_likes_changed();

CREATE POLICY "forum_posts_public_like" ON public.forum_posts
  FOR UPDATE USING (true) WITH CHECK (true);