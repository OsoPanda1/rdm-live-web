
CREATE POLICY "read music" ON storage.objects FOR SELECT TO authenticated, anon
  USING (bucket_id = 'music-uploads');
CREATE POLICY "admin upload music" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'music-uploads' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update music" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'music-uploads' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete music" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'music-uploads' AND public.has_role(auth.uid(),'admin'));
