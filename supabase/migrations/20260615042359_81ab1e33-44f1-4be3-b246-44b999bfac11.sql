CREATE TYPE public.app_role AS ENUM ('admin', 'merchant', 'user');
CREATE TYPE public.membership_status AS ENUM ('pending', 'active', 'past_due', 'cancelled');
CREATE TYPE public.content_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.pending_role_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role public.app_role NOT NULL,
  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email, role)
);
GRANT ALL ON public.pending_role_grants TO service_role;
ALTER TABLE public.pending_role_grants ENABLE ROW LEVEL SECURITY;
INSERT INTO public.pending_role_grants (email, role) VALUES ('tamvonlinenetwork@outlook.es', 'admin');

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE TABLE public.merchant_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  business_name text NOT NULL CHECK (char_length(business_name) BETWEEN 2 AND 120),
  description text CHECK (char_length(description) <= 1200),
  category text NOT NULL CHECK (char_length(category) <= 80),
  phone text CHECK (char_length(phone) <= 30),
  address text CHECK (char_length(address) <= 240),
  latitude numeric(9,6),
  longitude numeric(9,6),
  plan_code text NOT NULL DEFAULT 'comercio_299',
  verified boolean NOT NULL DEFAULT false,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.merchant_profiles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.merchant_profiles TO authenticated;
GRANT ALL ON public.merchant_profiles TO service_role;
ALTER TABLE public.merchant_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published merchants are public" ON public.merchant_profiles FOR SELECT USING (status = 'published' OR auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners create merchant profiles" ON public.merchant_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update merchant profiles" ON public.merchant_profiles FOR UPDATE TO authenticated USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners delete merchant profiles" ON public.merchant_profiles FOR DELETE TO authenticated USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  merchant_id uuid REFERENCES public.merchant_profiles(id) ON DELETE CASCADE,
  plan_code text NOT NULL,
  amount_mxn integer NOT NULL CHECK (amount_mxn IN (99,299,399,799)),
  status public.membership_status NOT NULL DEFAULT 'pending',
  provider_customer_id text,
  provider_subscription_id text,
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memberships TO authenticated;
GRANT ALL ON public.memberships TO service_role;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own memberships" ON public.memberships FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create pending memberships" ON public.memberships FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE TABLE public.tourism_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 140),
  category text NOT NULL CHECK (char_length(category) <= 80),
  short_description text NOT NULL CHECK (char_length(short_description) <= 240),
  description text CHECK (char_length(description) <= 3000),
  address text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  opening_hours text,
  phone text,
  website text,
  cover_url text,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tourism_places TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tourism_places TO authenticated;
GRANT ALL ON public.tourism_places TO service_role;
ALTER TABLE public.tourism_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published places are public" ON public.tourism_places FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage places" ON public.tourism_places FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.place_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES public.tourism_places(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text CHECK (char_length(title) <= 120),
  comment text CHECK (char_length(comment) BETWEEN 3 AND 1200),
  status public.content_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (place_id, user_id)
);
GRANT SELECT ON public.place_reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.place_reviews TO authenticated;
GRANT ALL ON public.place_reviews TO service_role;
ALTER TABLE public.place_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published reviews are public" ON public.place_reviews FOR SELECT USING (status = 'published' OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own reviews" ON public.place_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reviews" ON public.place_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users delete own reviews" ON public.place_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  location_name text CHECK (char_length(location_name) <= 140),
  status public.content_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.community_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.community_posts TO authenticated;
GRANT ALL ON public.community_posts TO service_role;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published community posts are public" ON public.community_posts FOR SELECT USING (status = 'published' OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create posts" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update posts" ON public.community_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users delete posts" ON public.community_posts FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.community_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  alt_text text NOT NULL CHECK (char_length(alt_text) BETWEEN 2 AND 240),
  status public.content_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.community_photos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.community_photos TO authenticated;
GRANT ALL ON public.community_photos TO service_role;
ALTER TABLE public.community_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published photos are public" ON public.community_photos FOR SELECT USING (status = 'published' OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users manage own photos" ON public.community_photos FOR ALL TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.forum_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL CHECK (char_length(title) BETWEEN 4 AND 160),
  body text NOT NULL CHECK (char_length(body) BETWEEN 4 AND 4000),
  category text NOT NULL CHECK (char_length(category) <= 80),
  status public.content_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.forum_topics TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.forum_topics TO authenticated;
GRANT ALL ON public.forum_topics TO service_role;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published topics are public" ON public.forum_topics FOR SELECT USING (status = 'published' OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create topics" ON public.forum_topics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update topics" ON public.forum_topics FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users delete topics" ON public.forum_topics FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  status public.content_status NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.forum_replies TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.forum_replies TO authenticated;
GRANT ALL ON public.forum_replies TO service_role;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published replies are public" ON public.forum_replies FOR SELECT USING (status = 'published' OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create replies" ON public.forum_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update replies" ON public.forum_replies FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users delete replies" ON public.forum_replies FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.gamification_profiles (
  user_id uuid PRIMARY KEY,
  points integer NOT NULL DEFAULT 0 CHECK (points >= 0),
  level integer NOT NULL DEFAULT 1 CHECK (level >= 1),
  badges jsonb NOT NULL DEFAULT '[]'::jsonb,
  streak_days integer NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.gamification_profiles TO authenticated;
GRANT ALL ON public.gamification_profiles TO service_role;
ALTER TABLE public.gamification_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read gamification" ON public.gamification_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users initialize gamification" ON public.gamification_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND points = 0 AND level = 1);

CREATE TABLE public.gamification_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL CHECK (char_length(event_type) <= 80),
  points integer NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gamification_events TO authenticated;
GRANT ALL ON public.gamification_events TO service_role;
ALTER TABLE public.gamification_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own game events" ON public.gamification_events FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.music_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 140),
  artist text NOT NULL CHECK (char_length(artist) BETWEEN 1 AND 140),
  theme text CHECK (char_length(theme) <= 180),
  kind text NOT NULL DEFAULT 'tradicional',
  tags text[] NOT NULL DEFAULT '{}',
  description text CHECK (char_length(description) <= 1200),
  audio_url text,
  cover_url text,
  year smallint CHECK (year BETWEEN 1800 AND 2100),
  duration_seconds integer NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  popularity integer NOT NULL DEFAULT 0 CHECK (popularity >= 0),
  status public.content_status NOT NULL DEFAULT 'draft',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.music_tracks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.music_tracks TO authenticated;
GRANT ALL ON public.music_tracks TO service_role;
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published tracks are public" ON public.music_tracks FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage tracks" ON public.music_tracks FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.store_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 140),
  description text CHECK (char_length(description) <= 2000),
  price_mxn integer NOT NULL CHECK (price_mxn > 0),
  inventory integer NOT NULL DEFAULT 0 CHECK (inventory >= 0),
  image_url text,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.store_products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.store_products TO authenticated;
GRANT ALL ON public.store_products TO service_role;
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published products are public" ON public.store_products FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage products" ON public.store_products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.store_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_mxn integer NOT NULL CHECK (total_mxn >= 0),
  status text NOT NULL DEFAULT 'pending',
  provider_payment_id text,
  shipping_address jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.store_orders TO authenticated;
GRANT ALL ON public.store_orders TO service_role;
ALTER TABLE public.store_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own orders" ON public.store_orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create pending orders" ON public.store_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER merchant_profiles_updated_at BEFORE UPDATE ON public.merchant_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER memberships_updated_at BEFORE UPDATE ON public.memberships FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tourism_places_updated_at BEFORE UPDATE ON public.tourism_places FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER place_reviews_updated_at BEFORE UPDATE ON public.place_reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER community_posts_updated_at BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER forum_topics_updated_at BEFORE UPDATE ON public.forum_topics FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER forum_replies_updated_at BEFORE UPDATE ON public.forum_replies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER music_tracks_updated_at BEFORE UPDATE ON public.music_tracks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER store_products_updated_at BEFORE UPDATE ON public.store_products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER store_orders_updated_at BEFORE UPDATE ON public.store_orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX tourism_places_category_status_idx ON public.tourism_places(category, status);
CREATE INDEX place_reviews_place_created_idx ON public.place_reviews(place_id, created_at DESC);
CREATE INDEX community_posts_created_idx ON public.community_posts(created_at DESC);
CREATE INDEX forum_topics_category_created_idx ON public.forum_topics(category, created_at DESC);
CREATE INDEX memberships_user_status_idx ON public.memberships(user_id, status);
CREATE INDEX gamification_events_user_created_idx ON public.gamification_events(user_id, created_at DESC);