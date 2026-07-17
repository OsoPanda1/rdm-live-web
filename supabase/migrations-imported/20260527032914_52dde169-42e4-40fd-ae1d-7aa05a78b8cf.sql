-- =========== DIGITAL TWIN LAYERS ===========
CREATE TABLE public.dt_layers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  color text DEFAULT '#D4AF37',
  icon text DEFAULT '🗺️',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.dt_layers TO anon, authenticated;
GRANT ALL ON public.dt_layers TO service_role;
ALTER TABLE public.dt_layers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Layers public read" ON public.dt_layers FOR SELECT USING (true);
CREATE POLICY "Service manages layers" ON public.dt_layers FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE public.dt_layer_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_id uuid NOT NULL REFERENCES public.dt_layers(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  weight numeric DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(layer_id, entity_type, entity_id)
);
CREATE INDEX idx_dt_layer_items_layer ON public.dt_layer_items(layer_id);
CREATE INDEX idx_dt_layer_items_entity ON public.dt_layer_items(entity_type, entity_id);
GRANT SELECT ON public.dt_layer_items TO anon, authenticated;
GRANT ALL ON public.dt_layer_items TO service_role;
ALTER TABLE public.dt_layer_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Layer items public read" ON public.dt_layer_items FOR SELECT USING (true);
CREATE POLICY "Service manages layer items" ON public.dt_layer_items FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =========== TRACKING EVENTS ===========
CREATE TABLE public.tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text,
  event_type text NOT NULL,
  entity_type text,
  entity_id uuid,
  payload jsonb DEFAULT '{}'::jsonb,
  route text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_tracking_events_type ON public.tracking_events(event_type);
CREATE INDEX idx_tracking_events_created ON public.tracking_events(created_at DESC);
CREATE INDEX idx_tracking_events_user ON public.tracking_events(user_id);
GRANT INSERT ON public.tracking_events TO anon, authenticated;
GRANT SELECT ON public.tracking_events TO authenticated;
GRANT ALL ON public.tracking_events TO service_role;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert tracking" ON public.tracking_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Users see own tracking" ON public.tracking_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service manages tracking" ON public.tracking_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =========== FOOT TRAFFIC ===========
CREATE TABLE public.foot_traffic (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid,
  business_id uuid,
  zone_key text,
  count integer NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'estimate',
  recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_foot_traffic_place ON public.foot_traffic(place_id);
CREATE INDEX idx_foot_traffic_recorded ON public.foot_traffic(recorded_at DESC);
GRANT SELECT ON public.foot_traffic TO anon, authenticated;
GRANT ALL ON public.foot_traffic TO service_role;
ALTER TABLE public.foot_traffic ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Foot traffic public read" ON public.foot_traffic FOR SELECT USING (true);
CREATE POLICY "Service manages foot traffic" ON public.foot_traffic FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =========== SEED DEFAULT LAYERS ===========
INSERT INTO public.dt_layers (key, name, description, color, icon, sort_order) VALUES
  ('cultural', 'Capa Cultural', 'Minas, panteones, plazas, museos.', '#D4AF37', '🏛️', 1),
  ('economic', 'Capa Económica', 'Comercios verificados y B2B.', '#2DD4BF', '🏪', 2),
  ('events', 'Capa de Eventos', 'Agenda territorial activa.', '#E77C40', '🎭', 3),
  ('mining', 'Capa de Minería Digital', 'Nodos de Veta Soberana.', '#3B82F6', '⛏️', 4),
  ('traffic', 'Afluencia Territorial', 'Densidad estimada de personas.', '#EF4444', '🔥', 5);