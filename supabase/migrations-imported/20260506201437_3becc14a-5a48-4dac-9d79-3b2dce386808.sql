
-- Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin', 'merchant', 'visitor');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'visitor',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admins read all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Timestamp helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Categories
CREATE TABLE public.merchant_categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  fee_mxn integer NOT NULL,
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.merchant_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.merchant_categories FOR SELECT USING (true);
CREATE POLICY "admins manage categories" ON public.merchant_categories FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.merchant_categories (id, name, fee_mxn) VALUES
  ('hotel', 'Hoteles', 500),
  ('pasteria', 'Pasterías', 400),
  ('plateria', 'Platerías', 350),
  ('restaurante', 'Restaurantes', 300),
  ('bar', 'Bares', 350),
  ('artesanias', 'Artesanías', 300),
  ('abarrotes', 'Abarrotes / Misceláneas', 250),
  ('gondola', 'Góndolas / Semifijo', 150),
  ('camion_rojo', 'Camiones Rojos', 500),
  ('cuatrimoto', 'Cuatrimotos', 400),
  ('racer', 'Racers', 500),
  ('recorrido_teatral', 'Recorridos Teatrales', 300);

-- Registrations
CREATE TYPE public.merchant_publication_status AS ENUM ('draft', 'awaiting_payment', 'paid', 'published', 'rejected');

CREATE TABLE public.merchant_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id text NOT NULL REFERENCES public.merchant_categories(id),
  name text NOT NULL,
  slug text UNIQUE,
  description text NOT NULL,
  address text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  phone text,
  website text,
  main_image text,
  tags text[] NOT NULL DEFAULT '{}',
  status public.merchant_publication_status NOT NULL DEFAULT 'draft',
  paid_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.merchant_registrations ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_merch_status ON public.merchant_registrations(status);
CREATE INDEX idx_merch_owner ON public.merchant_registrations(owner_id);

CREATE POLICY "public reads published merchants" ON public.merchant_registrations
  FOR SELECT USING (status = 'published');
CREATE POLICY "owners read own merchants" ON public.merchant_registrations
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "admins read all merchants" ON public.merchant_registrations
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "owners insert own merchants" ON public.merchant_registrations
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owners update own merchants pre-publish" ON public.merchant_registrations
  FOR UPDATE USING (auth.uid() = owner_id AND status IN ('draft','awaiting_payment','paid','published'))
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "admins manage merchants" ON public.merchant_registrations
  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_merch_updated BEFORE UPDATE ON public.merchant_registrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Payments
CREATE TYPE public.payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

CREATE TABLE public.merchant_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchant_registrations(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'pending',
  provider_session_id text,
  provider_payment_id text,
  amount_mxn integer NOT NULL,
  currency text NOT NULL DEFAULT 'mxn',
  status public.payment_status NOT NULL DEFAULT 'pending',
  webhook_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.merchant_payments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_pay_merchant ON public.merchant_payments(merchant_id);
CREATE INDEX idx_pay_session ON public.merchant_payments(provider_session_id);

CREATE POLICY "owners read own payments" ON public.merchant_payments
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "admins read all payments" ON public.merchant_payments
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_pay_updated BEFORE UPDATE ON public.merchant_payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-publish on payment success
CREATE OR REPLACE FUNCTION public.auto_publish_on_payment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'succeeded' AND (OLD.status IS DISTINCT FROM 'succeeded') THEN
    UPDATE public.merchant_registrations
       SET status = 'published',
           paid_at = COALESCE(paid_at, now()),
           published_at = COALESCE(published_at, now())
     WHERE id = NEW.merchant_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_publish AFTER INSERT OR UPDATE ON public.merchant_payments
  FOR EACH ROW EXECUTE FUNCTION public.auto_publish_on_payment();
