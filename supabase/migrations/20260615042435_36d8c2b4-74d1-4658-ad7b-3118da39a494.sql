REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
CREATE POLICY "Backend manages pending roles" ON public.pending_role_grants FOR ALL TO service_role USING (true) WITH CHECK (true);