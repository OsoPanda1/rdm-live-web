-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles public read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- GAME MEMBERSHIPS
-- =========================================================
CREATE TABLE public.game_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'inactive',
  price_mxn INTEGER NOT NULL DEFAULT 129,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_memberships TO authenticated;
GRANT ALL ON public.game_memberships TO service_role;

ALTER TABLE public.game_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own membership" ON public.game_memberships FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins read all memberships" ON public.game_memberships FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER memberships_set_updated_at BEFORE UPDATE ON public.game_memberships
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- MINERAL BALANCES
-- =========================================================
CREATE TABLE public.mineral_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  oro NUMERIC NOT NULL DEFAULT 0,
  plata NUMERIC NOT NULL DEFAULT 0,
  cuarzo NUMERIC NOT NULL DEFAULT 0,
  carbon NUMERIC NOT NULL DEFAULT 0,
  puntos INTEGER NOT NULL DEFAULT 0,
  energy INTEGER NOT NULL DEFAULT 100,
  energy_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_mined INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.mineral_balances TO authenticated;
GRANT ALL ON public.mineral_balances TO service_role;

ALTER TABLE public.mineral_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own balance" ON public.mineral_balances FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins read all balances" ON public.mineral_balances FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER balances_set_updated_at BEFORE UPDATE ON public.mineral_balances
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- MINING EVENTS (log)
-- =========================================================
CREATE TABLE public.mining_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mineral TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.mining_events TO authenticated;
GRANT ALL ON public.mining_events TO service_role;

ALTER TABLE public.mining_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own mining events" ON public.mining_events FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_mining_events_user ON public.mining_events (user_id, created_at DESC);

-- =========================================================
-- REWARDS CATALOG
-- =========================================================
CREATE TABLE public.rewards_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  cost_points INTEGER NOT NULL,
  image_url TEXT,
  stock INTEGER NOT NULL DEFAULT -1,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.rewards_catalog TO anon;
GRANT SELECT ON public.rewards_catalog TO authenticated;
GRANT ALL ON public.rewards_catalog TO service_role;

ALTER TABLE public.rewards_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rewards public read" ON public.rewards_catalog FOR SELECT USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage rewards" ON public.rewards_catalog FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER rewards_set_updated_at BEFORE UPDATE ON public.rewards_catalog
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- REWARD REDEMPTIONS
-- =========================================================
CREATE TABLE public.reward_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_id UUID NOT NULL,
  reward_name TEXT NOT NULL,
  cost_points INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.reward_redemptions TO authenticated;
GRANT ALL ON public.reward_redemptions TO service_role;

ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own redemptions" ON public.reward_redemptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins manage redemptions" ON public.reward_redemptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_redemptions_user ON public.reward_redemptions (user_id, created_at DESC);

-- =========================================================
-- AUTO-PROVISION NEW USERS
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_game_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.mineral_balances (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.game_memberships (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'visitor')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_game ON auth.users;
CREATE TRIGGER on_auth_user_created_game
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_game_user();

-- =========================================================
-- SEED REWARDS (real products)
-- =========================================================
INSERT INTO public.rewards_catalog (name, description, category, cost_points) VALUES
  ('Refresco frío local', 'Un refresco artesanal o embotellado en comercios del catálogo RDM.', 'refrescos', 500),
  ('Orden de Pastes (4 pzas)', 'Cuatro pastes tradicionales recién horneados, el sabor minero de Real del Monte.', 'gastronomia', 1200),
  ('Café de altura + postre', 'Café specialty de la sierra acompañado de repostería casera.', 'gastronomia', 1500),
  ('Dije de plata artesanal', 'Joyería de plata .925 hecha por plateros locales.', 'plata', 8000),
  ('Anillo de plata RDM', 'Anillo de plata artesanal con diseño minero exclusivo.', 'plata', 12000),
  ('Paseo guiado por la mina', 'Recorrido subterráneo guiado por la historia de la plata.', 'experiencias', 6000),
  ('Cena romántica para 2', 'Cena de tres tiempos en restaurante colonial con vista al pueblo.', 'experiencias', 15000),
  ('Noche de hospedaje boutique', 'Una noche en hotel boutique con vista panorámica y desayuno.', 'hospedaje', 30000),
  ('Ruta nocturna de leyendas', 'Caminata nocturna con guías de época y relatos de fantasmas.', 'experiencias', 4500),
  ('Artesanía de cantera', 'Pieza decorativa tallada en cantera rosa local.', 'artesania', 7000);