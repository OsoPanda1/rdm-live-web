
-- ENUMS
CREATE TYPE public.subscription_plan AS ENUM ('mensual', 'trimestral');
CREATE TYPE public.subscription_status AS ENUM ('activa', 'pendiente', 'cancelada', 'expirada');
CREATE TYPE public.booking_status AS ENUM ('pendiente', 'confirmada', 'completada', 'cancelada');
CREATE TYPE public.reward_type AS ENUM ('descuento', 'producto', 'experiencia');

-- COMMERCE SUBSCRIPTIONS
CREATE TABLE public.commerce_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL,
  plan public.subscription_plan NOT NULL DEFAULT 'mensual',
  amount numeric NOT NULL DEFAULT 0,
  status public.subscription_status NOT NULL DEFAULT 'pendiente',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.commerce_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subscriptions readable" ON public.commerce_subscriptions FOR SELECT USING (true);

-- TOUR GUIDES
CREATE TABLE public.tour_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bio text,
  languages text[] DEFAULT ARRAY['Español'],
  avatar_url text,
  rating numeric DEFAULT 5.0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tour_guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guides readable" ON public.tour_guides FOR SELECT USING (true);

-- TOUR PACKAGES
CREATE TABLE public.tour_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  duration_min integer NOT NULL DEFAULT 90,
  price numeric NOT NULL DEFAULT 0,
  max_capacity integer NOT NULL DEFAULT 10,
  image_url text,
  includes text[] DEFAULT ARRAY[]::text[],
  difficulty text DEFAULT 'Fácil',
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tour_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Packages readable" ON public.tour_packages FOR SELECT USING (true);

-- TOUR AVAILABILITY
CREATE TABLE public.tour_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.tour_packages(id) ON DELETE CASCADE,
  guide_id uuid REFERENCES public.tour_guides(id) ON DELETE SET NULL,
  date date NOT NULL,
  time time NOT NULL,
  capacity_left integer NOT NULL DEFAULT 10,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tour_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Availability readable" ON public.tour_availability FOR SELECT USING (true);

-- TOUR BOOKINGS
CREATE TABLE public.tour_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  package_id uuid NOT NULL REFERENCES public.tour_packages(id),
  availability_id uuid REFERENCES public.tour_availability(id),
  persons integer NOT NULL DEFAULT 1,
  total_paid numeric NOT NULL DEFAULT 0,
  status public.booking_status NOT NULL DEFAULT 'pendiente',
  contact_name text,
  contact_phone text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tour_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own bookings" ON public.tour_bookings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own bookings" ON public.tour_bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users cancel own bookings" ON public.tour_bookings FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- EVENTS
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  location text,
  image_url text,
  category text DEFAULT 'cultural',
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events readable" ON public.events FOR SELECT USING (true);

-- REWARDS
CREATE TABLE public.rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  type public.reward_type NOT NULL DEFAULT 'descuento',
  monetary_value numeric NOT NULL DEFAULT 0,
  points_cost integer NOT NULL DEFAULT 0,
  stock integer DEFAULT 100,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rewards readable" ON public.rewards FOR SELECT USING (true);

-- REWARD REDEMPTIONS
CREATE TABLE public.reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reward_id uuid NOT NULL REFERENCES public.rewards(id),
  code text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)),
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  used_at timestamptz
);
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own redemptions" ON public.reward_redemptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own redemptions" ON public.reward_redemptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- PREMIUM SUBSCRIPTIONS
CREATE TABLE public.subscriptions_premium (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  status public.subscription_status NOT NULL DEFAULT 'pendiente',
  amount numeric NOT NULL DEFAULT 99,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions_premium ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own premium" ON public.subscriptions_premium FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own premium" ON public.subscriptions_premium FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- SEED DATA
INSERT INTO public.tour_guides (name, bio, languages, rating) VALUES
('María Hernández', 'Guía certificada con 12 años de experiencia en historia minera.', ARRAY['Español','Inglés'], 4.9),
('Carlos Vega', 'Especialista en gastronomía cornish y rutas culturales.', ARRAY['Español','Inglés'], 4.8),
('Ana Robles', 'Experta en mitos, leyendas y recorridos nocturnos.', ARRAY['Español'], 5.0);

INSERT INTO public.tour_packages (title, description, duration_min, price, max_capacity, includes, difficulty) VALUES
('Ruta de la Plata Cornish', 'Recorrido por la Mina de Acosta, Panteón Inglés y casco histórico.', 180, 450, 12, ARRAY['Guía bilingüe','Entrada a mina','Degustación de paste'], 'Fácil'),
('Sendero del Hiloche', 'Caminata al mirador con vista panorámica a 2,800 msnm.', 240, 350, 10, ARRAY['Guía','Hidratación','Snack montañés'], 'Moderado'),
('Noche de Leyendas', 'Recorrido nocturno por callejones, panteones y minas embrujadas.', 120, 250, 15, ARRAY['Guía narrador','Lámpara','Chocolate caliente'], 'Fácil');

INSERT INTO public.events (title, description, starts_at, location, category) VALUES
('Festival del Paste 2026', 'Celebración anual de la herencia cornish con concursos y degustaciones.', '2026-10-15 10:00:00+00', 'Plaza Principal', 'gastronómico'),
('Noche de Muertos Minera', 'Procesión y altares en panteones históricos.', '2026-11-01 19:00:00+00', 'Panteón Inglés', 'cultural'),
('Concierto Sinfónico en la Mina', 'Música clásica en las galerías de la Mina de Acosta.', '2026-12-05 20:00:00+00', 'Mina de Acosta', 'cultural');

-- Mark some businesses as subscribed for demo
INSERT INTO public.businesses (name, sector, description, lat, lng, icon, is_subscribed, monthly_fee) VALUES
('Pastes El Portal', 'Gastronomía', 'Pastes tradicionales cornish desde 1985.', 20.1415, -98.6728, '🥧', true, 499),
('Plata Real', 'Artesanías', 'Joyería de plata fina diseño autóctono.', 20.1418, -98.6722, '💍', true, 499),
('Hotel Mineral', 'Hospedaje', 'Hotel boutique en el corazón del pueblo.', 20.1408, -98.6735, '🏨', true, 999),
('Bar Socavón', 'Gastronomía', 'Coctelería de mezcal y mixología.', 20.1402, -98.6752, '🍺', true, 499);

INSERT INTO public.rewards (title, description, type, monetary_value, points_cost, stock) VALUES
('20% en pastes Portal', 'Descuento en cualquier orden de pastes.', 'descuento', 50, 170, 200),
('Aretes de plata gratis', 'Par de aretes diseño cornish.', 'producto', 350, 1170, 30),
('Noche en Hotel Mineral', 'Noche para 2 personas con desayuno.', 'experiencia', 1800, 6000, 10),
('Cena romántica para 2', 'Menú de 3 tiempos en restaurante.', 'experiencia', 600, 2000, 20),
('Mezcal artesanal', 'Botella de mezcal local 750ml.', 'producto', 280, 940, 50);
