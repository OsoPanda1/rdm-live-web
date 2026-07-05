CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE pending_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)), NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  INSERT INTO public.gamification_profiles (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  SELECT role INTO pending_role FROM public.pending_role_grants WHERE lower(email) = lower(NEW.email) AND claimed_at IS NULL LIMIT 1 FOR UPDATE;
  IF pending_role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, pending_role) ON CONFLICT DO NOTHING;
    UPDATE public.pending_role_grants SET claimed_at = now() WHERE lower(email) = lower(NEW.email) AND role = pending_role AND claimed_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;