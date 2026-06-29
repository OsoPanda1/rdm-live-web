-- ═══════════════════════════════════════════════
-- RDM DIGITAL: Core Database Schema
-- ═══════════════════════════════════════════════

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ═══ PLACES (Points of Interest) ═══
CREATE TABLE public.places (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'poi',
  description TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  rating NUMERIC(2,1) DEFAULT 0,
  schedule TEXT,
  icon TEXT DEFAULT '📍',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Places are publicly readable" ON public.places FOR SELECT USING (true);

CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON public.places
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ BUSINESSES (B2B Federation) ═══
CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  description TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  monthly_fee NUMERIC(10,2) DEFAULT 0,
  is_subscribed BOOLEAN DEFAULT false,
  contact_email TEXT,
  contact_phone TEXT,
  icon TEXT DEFAULT '🏪',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Businesses are publicly readable" ON public.businesses FOR SELECT USING (true);

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ MINING NODES (Game) ═══
CREATE TABLE public.mining_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  mineral_type TEXT NOT NULL DEFAULT 'cuarzo',
  rarity TEXT NOT NULL DEFAULT 'Común',
  spawn_rate INTEGER DEFAULT 40,
  point_value INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mining_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mining nodes are publicly readable" ON public.mining_nodes FOR SELECT USING (true);

-- ═══ PROFILES (User data) ═══
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  total_minerals INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are publicly readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══ MINING SESSIONS ═══
CREATE TABLE public.mining_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  node_id UUID REFERENCES public.mining_nodes(id),
  minerals_earned INTEGER DEFAULT 0,
  mineral_type TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

ALTER TABLE public.mining_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON public.mining_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessions" ON public.mining_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ═══ TERRITORIAL METRICS ═══
CREATE TABLE public.territorial_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  metric_unit TEXT DEFAULT 'count',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.territorial_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Metrics are publicly readable" ON public.territorial_metrics FOR SELECT USING (true);

-- ═══ SEED DATA: Places ═══
INSERT INTO public.places (name, category, description, lat, lng, rating, schedule, icon) VALUES
('Plaza Principal', 'poi', 'Corazón del pueblo con arquitectura colonial, kiosco y vista panorámica.', 20.1413, -98.6735, 4.9, '24 horas', '🏛️'),
('Panteón Inglés', 'poi', 'Único cementerio británico en Latinoamérica con vistas a la sierra.', 20.1445, -98.6710, 4.8, '8:00-18:00', '⛪'),
('Museo de Medicina Laboral', 'poi', 'Historia de la medicina minera del siglo XIX.', 20.1400, -98.6720, 4.6, '10:00-17:00', '🏥'),
('Cerro del Hiloche', 'poi', 'Mirador natural con vistas panorámicas de la sierra.', 20.1480, -98.6800, 4.7, '6:00-18:00', '🏔️'),
('Mina de Acosta', 'mining', 'Galerías coloniales del siglo XVIII. Nodo de minería digital.', 20.1430, -98.6760, 4.9, '9:00-17:00', '⛏️');

INSERT INTO public.businesses (name, sector, description, lat, lng, monthly_fee, is_subscribed, icon) VALUES
('El Portal', 'Pasterías', 'Pastes tradicionales cornish. Nodo de Energía.', 20.1415, -98.6728, 400, true, '🥧'),
('Real Cornish Pastes', 'Pasterías', 'Pastes artesanales desde 1980.', 20.1410, -98.6740, 400, true, '🥟'),
('La Plata Viva', 'Platerías', 'Joyería y platería fina de Real del Monte.', 20.1418, -98.6722, 400, true, '💍'),
('Artesanías RDM', 'Artesanías', 'Platería, textiles y artesanía local.', 20.1408, -98.6730, 350, true, '🎨'),
('Bar El Socavón', 'Bares', 'Coctelería artesanal y mezcal.', 20.1402, -98.6752, 450, true, '🍺');

INSERT INTO public.mining_nodes (name, lat, lng, mineral_type, rarity, spawn_rate, point_value) VALUES
('Veta La Rica', 20.1395, -98.6705, 'Cuarzo', 'Común', 40, 10),
('Socavón del Rey', 20.1420, -98.6780, 'Plata', 'Raro', 20, 75),
('Galería San Ramón', 20.1460, -98.6745, 'Pirita', 'Frecuente', 30, 25),
('Túnel Cornish', 20.1435, -98.6710, 'Oro', 'Épico', 10, 200);

INSERT INTO public.territorial_metrics (metric_name, metric_value, metric_unit) VALUES
('local_retention', 73, 'percent'),
('active_businesses', 110, 'count'),
('monthly_players', 2340, 'count'),
('direct_revenue', 284000, 'mxn'),
('circular_economy_index', 0.68, 'index');

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.mining_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.territorial_metrics;