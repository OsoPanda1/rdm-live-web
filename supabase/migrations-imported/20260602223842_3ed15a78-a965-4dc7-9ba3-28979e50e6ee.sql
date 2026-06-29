REVOKE ALL ON FUNCTION public.handle_new_game_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.auto_publish_on_payment() FROM PUBLIC, anon, authenticated;