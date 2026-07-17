
-- ===== PASTE POIs =====
CREATE TABLE public.paste_pois (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'pasteria',
  lat NUMERIC,
  lng NUMERIC,
  svg_x NUMERIC NOT NULL,
  svg_y NUMERIC NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  icon TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.paste_pois TO anon, authenticated;
GRANT ALL ON public.paste_pois TO service_role;
ALTER TABLE public.paste_pois ENABLE ROW LEVEL SECURITY;
CREATE POLICY "paste_pois public read" ON public.paste_pois FOR SELECT USING (active = true);

CREATE TABLE public.paste_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poi_id UUID NOT NULL REFERENCES public.paste_pois(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score BETWEEN 1 AND 5),
  review TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (poi_id, user_id)
);
GRANT SELECT ON public.paste_ratings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.paste_ratings TO authenticated;
GRANT ALL ON public.paste_ratings TO service_role;
ALTER TABLE public.paste_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "paste_ratings public read" ON public.paste_ratings FOR SELECT USING (true);
CREATE POLICY "paste_ratings owner insert" ON public.paste_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "paste_ratings owner update" ON public.paste_ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "paste_ratings owner delete" ON public.paste_ratings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ===== WIKI =====
CREATE TABLE public.wiki_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  excerpt TEXT,
  content_md TEXT NOT NULL,
  hero_image TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  published BOOLEAN NOT NULL DEFAULT true,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wiki_articles TO anon, authenticated;
GRANT ALL ON public.wiki_articles TO service_role;
ALTER TABLE public.wiki_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wiki public read" ON public.wiki_articles FOR SELECT USING (published = true);

-- ===== HEALTH LOG =====
CREATE TABLE public.federation_health_log (
  id BIGSERIAL PRIMARY KEY,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  avg_latency_ms INT NOT NULL,
  integrity NUMERIC NOT NULL,
  online_count INT NOT NULL,
  degraded_count INT NOT NULL,
  offline_count INT NOT NULL,
  snapshot JSONB NOT NULL
);
CREATE INDEX idx_fed_health_recorded ON public.federation_health_log (recorded_at DESC);
GRANT SELECT ON public.federation_health_log TO anon, authenticated;
GRANT ALL ON public.federation_health_log TO service_role;
ALTER TABLE public.federation_health_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "health log public read" ON public.federation_health_log FOR SELECT USING (true);

-- ===== ALERTS =====
CREATE TABLE public.system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  severity TEXT NOT NULL CHECK (severity IN ('info','warning','critical')),
  federation_key TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_alerts_created ON public.system_alerts (created_at DESC);
GRANT SELECT ON public.system_alerts TO anon, authenticated;
GRANT ALL ON public.system_alerts TO service_role;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alerts public read" ON public.system_alerts FOR SELECT USING (true);

-- ===== Triggers updated_at =====
CREATE TRIGGER trg_paste_pois_uat BEFORE UPDATE ON public.paste_pois FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_paste_ratings_uat BEFORE UPDATE ON public.paste_ratings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_wiki_uat BEFORE UPDATE ON public.wiki_articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_alerts_uat BEFORE UPDATE ON public.system_alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== SEED =====
INSERT INTO public.paste_pois (slug, name, description, type, svg_x, svg_y, order_index, icon, lat, lng) VALUES
  ('plaza-principal','Plaza Principal Hidalgo','Punto de partida. Corazón cívico de Real del Monte y kilómetro cero de la Ruta del Paste.','plaza',120,420,1,'🏛',20.1430,-98.6700),
  ('pasteria-real','Paste Real','Receta tradicional cornish-mexicana con papa, carne y poro. Horneados al momento.','pasteria',260,360,2,'🥟',20.1438,-98.6685),
  ('museo-paste','Museo del Paste','Único museo del mundo dedicado al paste. Historia minera cornish de 1824.','museo',420,300,3,'🏛',20.1445,-98.6670),
  ('panaderia-cornish','Panadería Cornish','Hornos de leña centenarios. Pruebas con paste de mole y chorizo verde.','pasteria',560,360,4,'🔥',20.1450,-98.6655),
  ('mina-acosta','Mina La Acosta','Antigua mina cornish. Recorrido subterráneo + degustación de paste minero.','mina',680,260,5,'⛏',20.1460,-98.6640),
  ('panteon-ingles','Panteón Inglés','Memoria viva cornish. Cierre soberano del recorrido con vista panorámica.','memorial',820,200,6,'⚜',20.1475,-98.6625);

INSERT INTO public.wiki_articles (slug, title, category, excerpt, content_md, tags, order_index) VALUES
  ('fundacion-real-del-monte','Fundación de Real del Monte','Historia','Pueblo Mágico minero fundado en el siglo XVI sobre vetas de plata.','# Fundación de Real del Monte\n\nReal del Monte (Mineral del Monte) fue fundado en el siglo XVI alrededor de las vetas de plata más ricas de Nueva España. Su nombre original era "Real de Minas del Monte".\n\n## Hitos\n- **1552** — Primer registro minero documentado.\n- **1766** — Primera huelga laboral de América (mineros vs. Pedro Romero de Terreros).\n- **1824** — Llegada de mineros cornish desde Cornwall, Inglaterra.',ARRAY['historia','mineria','fundacion'],1),
  ('herencia-cornish','La Herencia Cornish','Cultura','En 1824 llegaron 350 mineros de Cornwall trayendo el paste, el fútbol y los hornos de leña.','# La Herencia Cornish\n\nEn **1824** la Compañía Real del Monte y Pachuca contrató mineros de Cornwall (Inglaterra) por su experticia en minas profundas. Trajeron:\n\n- **El paste** — empanada de papa y carne, adaptada con chiles y moles locales.\n- **El fútbol** — primer partido documentado en México (1900).\n- **Los hornos de leña** — siguen activos en panaderías centenarias.\n- **El panteón inglés** — único en su tipo en Latinoamérica.',ARRAY['cornish','cultura','paste','futbol'],2),
  ('paste-patrimonio','El Paste, Patrimonio Vivo','Gastronomía','Más de 50 variedades. Denominación de origen en proceso. Festival anual.','# El Paste\n\nEl paste es **empanada cornish-mexicana** rellena tradicionalmente de papa, carne, poro y especias. Hoy existen más de **50 variedades** documentadas: mole, chorizo verde, piña, arroz con leche.\n\n## Festival del Paste\nCada octubre desde 2009. Más de **80,000 visitantes** anuales y **300 toneladas** producidas.',ARRAY['paste','gastronomia','festival'],3),
  ('leyenda-aguila','Leyenda del Águila de la Mina','Leyendas','Un águila dorada custodia las vetas. Quien la vea encuentra fortuna o muerte.','# La Leyenda del Águila\n\nLos viejos mineros cuentan que un **águila dorada** habita las galerías abandonadas de la Mina La Rica. Quien la vea recibe **fortuna o muerte** según la pureza de su corazón.\n\nLa leyenda nació en 1872 tras el derrumbe de la Veta Vizcaína, donde tres mineros juraron haber visto el ave antes del colapso.',ARRAY['leyenda','mineria','folklore'],4),
  ('manifiesto-ltos','Manifiesto LTOS Territorial','LTOS','Real del Monte como Nodo Cero del Sistema Operativo Territorial Soberano.','# LTOS — Local Territorial Operating System\n\nLTOS es el primer **sistema operativo territorial soberano** del mundo. Real del Monte es su **Nodo Cero**.\n\n## Los 7 ejes\n1. Identity Core — DID + Auth soberano\n2. Ledger 2DBD — Bitácora dual de bienes digitales\n3. Compute Edge — Cómputo distribuido en territorio\n4. Alamexa Nexus — Gemelo territorial vivo\n5. uTAMV Neural — IA contextual cultural (Realito)\n6. Media Broadcast — RDM Radio + Music\n7. RDM Twin 4D — Gemelo 4D temporal\n\n## Fórmula I_TAMV\n`I_TAMV = Σ(Wn · σ(Vn) / Δt) × E_Dignity`\n\nMide la **integridad soberana** del sistema en tiempo real.',ARRAY['ltos','tamv','soberania','manifiesto'],5);
