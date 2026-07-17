-- =============================================================================
-- ISABELLA ONTOLOGY — Grafo de Abstracción Crónico (1000_abstraction_colors)
-- =============================================================================
-- Almacena el árbol de abstracción como DAG de dependencias inmutables mapeado
-- a las 7 Federaciones y 9 Ejes Temáticos con codificación cromática ontológica.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1) ONTOLOGY FEDERATIONS (7 Capas Federadas del Espectro Cromático)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ontology_federations (
  id INT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  chromatic_range TEXT[] NOT NULL,   -- ej. ARRAY['#1a1a2e','#16213e','#0f3460']
  hex_primary VARCHAR(7) NOT NULL,   -- color representativo
  responsibility TEXT NOT NULL
);

INSERT INTO public.ontology_federations (id, code, name, description, chromatic_range, hex_primary, responsibility) VALUES
  (1, 'F1', 'Core & Kernel',       'Tonos oscuros / azules profundos — ledger central y serverless',            ARRAY['#0a0a1a','#1a1a2e','#16213e','#0f3460'], '#1a1a2e', 'Vigilancia del estado de serverless functions y consistencia del ledger'),
  (2, 'F2', 'Mesh & Conectividad',  'Púrpuras / morados intensos — sincronización offline',                     ARRAY['#2d1b69','#4a0e4e','#6b21a8','#7c3aed'], '#4a0e4e', 'Orquestación de colas de sincronización diferida en IndexedDB'),
  (3, 'F3', 'Territorial',          'Verde azulado / aqua — PostGIS y coordenadas',                             ARRAY['#0f766e','#14b8a6','#2dd4bf','#5eead4'], '#0f766e', 'Validación de coordenadas geográficas e indexaciones espaciales'),
  (4, 'F4', 'Cognitiva',            'Destellos amarillos / dorados — ejecución de Isabella AI',                 ARRAY['#b8860b','#d4a017','#f5c71a','#ffd700'], '#d4a017', 'Espacio nativo de ejecución de Isabella AI bajo protocolo TIME UP'),
  (5, 'F5', 'Interfaz (Nexo)',      'Gris técnico / pizarrón — renderizado atómico en cliente',                 ARRAY['#374151','#4b5563','#6b7280','#9ca3af'], '#4b5563', 'Monitoreo del renderizado atómico y experiencia de interacción'),
  (6, 'F6', 'Criptográfica',        'Violetas / índigo criptográfico — Dekateotl y tokens',                     ARRAY['#312e81','#3730a3','#4338ca','#4f46e5'], '#3730a3', 'Auditoría de payloads JSONB, hashing y validación de tokens'),
  (7, 'F7', 'Resiliencia',          'Esmeralda / verde resiliente — mitigación autónoma de fallos',             ARRAY['#065f46','#047857','#059669','#10b981'], '#047857', 'Mitigación autónoma de fallos, balanceo de cargas y pooler Supavisor')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2) ONTOLOGY THEMES (9 Ejes Temáticos)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ontology_themes (
  id INT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL
);

INSERT INTO public.ontology_themes (id, code, name, description) VALUES
  (1, 'T1', 'Ética y Gobernanza',    'Directrices EOCT, privacidad, transparencia y consentimiento informado'),
  (2, 'T2', 'Territorio y Espacio',  'Geolocalización, minería, turismo y cartografía digital de Real del Monte'),
  (3, 'T3', 'Memoria y Patrimonio',  'Archivo histórico, leyendas, pastes, dichos y tradiciones mineras'),
  (4, 'T4', 'Economía y Comercio',   'Negocios locales, membresías, donaciones y tokenización'),
  (5, 'T5', 'Tecnología e Infra',    'Serverless, Edge Functions, Vercel, Supabase y redes mesh'),
  (6, 'T6', 'Sociedad y Comunidad',  'Foro, perfiles, leaderboard y participación ciudadana'),
  (7, 'T7', 'Resiliencia',           'Alta disponibilidad, mitigación de fallos, backup y continuidad'),
  (8, 'T8', 'Identidad Digital',     'Auth, SSO, roles, wallets criptográficas y firmas'),
  (9, 'T9', 'Conocimiento Abierto',  'Documentación, atlas, wikis técnicas y transferencia de saber')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3) ISABELLA ONTOLOGY — Grafo de Abstracción (Adjacency List)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.isabella_ontology (
  node_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_node_id UUID REFERENCES public.isabella_ontology(node_id) ON DELETE CASCADE,
  federation_id INT NOT NULL REFERENCES public.ontology_federations(id),
  theme_id INT NOT NULL REFERENCES public.ontology_themes(id),
  node_name TEXT NOT NULL,
  chromatic_hex VARCHAR(7) NOT NULL,
  abstraction_level INT NOT NULL CHECK (abstraction_level BETWEEN 1 AND 10),
  semantic_rules JSONB DEFAULT '{"allow_external_inference": false}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------------------------
-- 4) INDEXES
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_ontology_parent ON public.isabella_ontology(parent_node_id);
CREATE INDEX IF NOT EXISTS idx_ontology_matrix_lookup ON public.isabella_ontology(federation_id, theme_id);
CREATE INDEX IF NOT EXISTS idx_ontology_federation ON public.isabella_ontology(federation_id);
CREATE INDEX IF NOT EXISTS idx_ontology_theme ON public.isabella_ontology(theme_id);
CREATE INDEX IF NOT EXISTS idx_ontology_rules_gin ON public.isabella_ontology USING GIN (semantic_rules);
CREATE INDEX IF NOT EXISTS idx_ontology_level ON public.isabella_ontology(abstraction_level);
CREATE INDEX IF NOT EXISTS idx_ontology_chromatic ON public.isabella_ontology(chromatic_hex);

-- ---------------------------------------------------------------------------
-- 5) RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.ontology_federations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ontology_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.isabella_ontology ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ontology_federations_select_anon" ON public.ontology_federations FOR SELECT USING (true);
CREATE POLICY "ontology_themes_select_anon" ON public.ontology_themes FOR SELECT USING (true);
CREATE POLICY "isabella_ontology_select_anon" ON public.isabella_ontology FOR SELECT USING (true);

-- Solo Isabella AI (service role) puede insertar/actualizar/eliminar nodos
CREATE POLICY "isabella_ontology_insert_service" ON public.isabella_ontology FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "isabella_ontology_update_service" ON public.isabella_ontology FOR UPDATE
  USING (auth.role() = 'service_role');
CREATE POLICY "isabella_ontology_delete_service" ON public.isabella_ontology FOR DELETE
  USING (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- 6) HELPER: ontología de semilla para los primeros nodos raíz
-- ---------------------------------------------------------------------------
-- ---------------------------------------------------------------------------
-- 6) RECURSIVE ANCESTOR LOOKUP (para navegación del DAG)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_ontology_ancestors(node_uuid UUID)
RETURNS TABLE(
  node_id UUID, parent_node_id UUID, federation_id INT, theme_id INT,
  node_name TEXT, chromatic_hex VARCHAR(7), abstraction_level INT,
  semantic_rules JSONB, created_at TIMESTAMPTZ, depth INT
) LANGUAGE SQL STABLE AS $$
  WITH RECURSIVE ancestors AS (
    SELECT n.*, 0 AS depth
    FROM public.isabella_ontology n WHERE n.node_id = node_uuid
    UNION ALL
    SELECT n.*, a.depth + 1
    FROM public.isabella_ontology n
    INNER JOIN ancestors a ON n.node_id = a.parent_node_id
  )
  SELECT * FROM ancestors ORDER BY depth DESC;
$$;

-- ---------------------------------------------------------------------------
-- 7) HELPER: ontología de semilla para los primeros nodos raíz
-- ---------------------------------------------------------------------------
INSERT INTO public.isabella_ontology (node_id, parent_node_id, federation_id, theme_id, node_name, chromatic_hex, abstraction_level, semantic_rules)
VALUES
  ('00000000-0000-0000-0000-000000000001', NULL,      1, 1, 'Sistema RDM Digital LTOS',                   '#0a0a1a', 10, '{"allow_external_inference": false, "axiom": true}'),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 1, 5, 'Core y Kernel del Sistema',            '#1a1a2e', 9, '{"allow_external_inference": false}'),
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 2, 5, 'Mesh y Conectividad',                  '#2d1b69', 9, '{"allow_external_inference": false}'),
  ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000001', 3, 2, 'Territorio y Cartografía',            '#0f766e', 9, '{"allow_external_inference": false}'),
  ('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000001', 4, 9, 'Cognición y Conocimiento Abierto',    '#d4a017', 9, '{"allow_external_inference": false}'),
  ('00000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000001', 5, 6, 'Interfaz y Comunidad',                '#4b5563', 9, '{"allow_external_inference": false}'),
  ('00000000-0000-0000-0000-000000000060', '00000000-0000-0000-0000-000000000001', 6, 8, 'Criptografía e Identidad',            '#3730a3', 9, '{"allow_external_inference": false}'),
  ('00000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000001', 7, 7, 'Resiliencia y Continuidad',           '#047857', 9, '{"allow_external_inference": false}')
ON CONFLICT (node_id) DO NOTHING;
