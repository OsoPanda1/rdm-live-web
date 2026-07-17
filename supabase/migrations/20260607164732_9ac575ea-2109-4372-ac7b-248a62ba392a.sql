CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  federation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)), NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.telemetry_pulses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  federation TEXT NOT NULL,
  pulse_type TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.telemetry_pulses TO anon, authenticated;
GRANT ALL ON public.telemetry_pulses TO service_role;
ALTER TABLE public.telemetry_pulses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "telemetry_public_read" ON public.telemetry_pulses FOR SELECT USING (true);

INSERT INTO public.telemetry_pulses (federation, pulse_type, value, metadata) VALUES
('MDD_TAMV','citizen_register',128,'{"node":"NodoCero"}'),
('BOOKPI','knowledge_write',412,'{"corpus":"TAMV"}'),
('PHOENIX','commerce_tx',78,'{"currency":"MXN"}'),
('KAOS','twin_sync',55,'{"layer":"geo"}'),
('CHRONOS','timeline_event',23,'{}'),
('ANUBIS','governance_vote',12,'{}'),
('DEKATEOTL','ipfs_pin',64,'{}');