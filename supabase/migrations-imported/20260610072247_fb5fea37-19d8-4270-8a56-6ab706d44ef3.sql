
-- ROLES
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','operador','lector');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "self read roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- UMBRALES POR FEDERACION
CREATE TABLE IF NOT EXISTS public.federation_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  federation_key TEXT NOT NULL UNIQUE,
  federation_name TEXT NOT NULL,
  max_latency_ms INTEGER NOT NULL DEFAULT 500,
  min_integrity NUMERIC NOT NULL DEFAULT 0.7,
  max_offline INTEGER NOT NULL DEFAULT 0,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.federation_thresholds TO authenticated;
GRANT ALL ON public.federation_thresholds TO service_role;
ALTER TABLE public.federation_thresholds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read thresholds" ON public.federation_thresholds FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write thresholds" ON public.federation_thresholds FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_thresholds_updated BEFORE UPDATE ON public.federation_thresholds
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.federation_thresholds (federation_key, federation_name) VALUES
 ('auth','Auth Federation'),('ledger','Ledger Federation'),('nexus','Nexus Federation'),
 ('neural','Neural Federation'),('media','Media Federation'),('twin4d','Twin 4D Federation'),
 ('mesh','Mesh Federation')
ON CONFLICT (federation_key) DO NOTHING;

-- AUDITORIA
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  actor_email TEXT,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  detail JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read audit" ON public.audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'operador'));
CREATE POLICY "auth insert audit" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

-- DONACIONES MUSICA
CREATE TABLE IF NOT EXISTS public.music_donation_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  track_id UUID REFERENCES public.music_tracks(id) ON DELETE SET NULL,
  amount_mxn NUMERIC NOT NULL CHECK (amount_mxn >= 25),
  stripe_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.music_donation_intents TO authenticated;
GRANT ALL ON public.music_donation_intents TO service_role;
ALTER TABLE public.music_donation_intents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "self donations" ON public.music_donation_intents FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "insert own donations" ON public.music_donation_intents FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Permitir que admins gestionen music_tracks
DROP POLICY IF EXISTS "admin manage tracks" ON public.music_tracks;
CREATE POLICY "admin manage tracks" ON public.music_tracks FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
