-- Migration: rate_limits table + storage bucket policies

-- 1. rate_limits table for edge function rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  count INT NOT NULL DEFAULT 1
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service_role can access rate_limits
CREATE POLICY rate_limits_service_only ON rate_limits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. Ensure storage buckets exist (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('songs', 'songs', false, 52428800, '{audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/flac}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('media', 'media', true, 10485760, '{image/png,image/jpeg,image/gif,image/webp,application/pdf}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('music-uploads', 'music-uploads', false, 52428800, '{audio/mpeg,audio/mp3,audio/wav,audio/ogg}')
ON CONFLICT (id) DO NOTHING;

-- 3. Storage policies for songs bucket (SELECT public authenticated, INSERT/UPDATE/DELETE admin only)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'songs_select_public') THEN
    CREATE POLICY songs_select_public ON storage.objects
      FOR SELECT USING (bucket_id = 'songs');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'songs_insert_admin') THEN
    CREATE POLICY songs_insert_admin ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'songs' AND auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'songs_update_admin') THEN
    CREATE POLICY songs_update_admin ON storage.objects
      FOR UPDATE USING (bucket_id = 'songs' AND auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'songs_delete_admin') THEN
    CREATE POLICY songs_delete_admin ON storage.objects
      FOR DELETE USING (bucket_id = 'songs' AND auth.role() = 'service_role');
  END IF;
END $$;

-- 4. Storage policies for media bucket (SELECT public, INSERT/UPDATE/DELETE by owner)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'media_select_public') THEN
    CREATE POLICY media_select_public ON storage.objects
      FOR SELECT USING (bucket_id = 'media');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'media_insert_owner') THEN
    CREATE POLICY media_insert_owner ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'media_update_owner') THEN
    CREATE POLICY media_update_owner ON storage.objects
      FOR UPDATE USING (bucket_id = 'media' AND owner = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'media_delete_owner') THEN
    CREATE POLICY media_delete_owner ON storage.objects
      FOR DELETE USING (bucket_id = 'media' AND owner = auth.uid());
  END IF;
END $$;

-- 5. Storage policies for music-uploads bucket (SELECT authenticated, INSERT/UPDATE/DELETE admin)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'music_uploads_select_auth') THEN
    CREATE POLICY music_uploads_select_auth ON storage.objects
      FOR SELECT USING (bucket_id = 'music-uploads' AND auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'music_uploads_insert_admin') THEN
    CREATE POLICY music_uploads_insert_admin ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'music-uploads' AND auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'music_uploads_update_admin') THEN
    CREATE POLICY music_uploads_update_admin ON storage.objects
      FOR UPDATE USING (bucket_id = 'music-uploads' AND auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'music_uploads_delete_admin') THEN
    CREATE POLICY music_uploads_delete_admin ON storage.objects
      FOR DELETE USING (bucket_id = 'music-uploads' AND auth.role() = 'service_role');
  END IF;
END $$;
