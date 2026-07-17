-- MUSIC TRACKS
CREATE TABLE public.music_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  artist text NOT NULL DEFAULT 'TAMV ONLINE Records',
  cover_url text,
  audio_url text,
  duration_seconds integer DEFAULT 0,
  moods text[] DEFAULT '{}'::text[],
  territories text[] DEFAULT '{}'::text[],
  donation_url text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.music_tracks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.music_tracks TO authenticated;
GRANT ALL ON public.music_tracks TO service_role;
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tracks public read" ON public.music_tracks FOR SELECT USING (true);
CREATE POLICY "Service manages tracks" ON public.music_tracks FOR ALL TO service_role USING (true) WITH CHECK (true);

-- MUSIC PLAYS
CREATE TABLE public.music_plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid NOT NULL REFERENCES public.music_tracks(id) ON DELETE CASCADE,
  user_id uuid,
  played_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.music_plays TO anon;
GRANT SELECT, INSERT ON public.music_plays TO authenticated;
GRANT ALL ON public.music_plays TO service_role;
ALTER TABLE public.music_plays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plays public read" ON public.music_plays FOR SELECT USING (true);
CREATE POLICY "Anyone can insert play" ON public.music_plays FOR INSERT WITH CHECK (true);
CREATE INDEX idx_music_plays_track ON public.music_plays(track_id);

-- MUSIC DONATIONS
CREATE TABLE public.music_donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid NOT NULL REFERENCES public.music_tracks(id) ON DELETE CASCADE,
  user_id uuid,
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'MXN',
  provider text,
  provider_session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.music_donations TO anon;
GRANT SELECT, INSERT ON public.music_donations TO authenticated;
GRANT ALL ON public.music_donations TO service_role;
ALTER TABLE public.music_donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Donations public read" ON public.music_donations FOR SELECT USING (true);
CREATE POLICY "Users create own donations" ON public.music_donations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE INDEX idx_music_donations_track ON public.music_donations(track_id);

-- TRIVIA QUESTIONS
CREATE TABLE public.trivia_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  options text[] NOT NULL,
  correct_index integer NOT NULL,
  category text DEFAULT 'general',
  difficulty text DEFAULT 'medio',
  explanation text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.trivia_questions TO anon;
GRANT SELECT ON public.trivia_questions TO authenticated;
GRANT ALL ON public.trivia_questions TO service_role;
ALTER TABLE public.trivia_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trivia public read" ON public.trivia_questions FOR SELECT USING (true);
CREATE POLICY "Service manages trivia" ON public.trivia_questions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- SEEDS música (placeholders, sin audio aún)
INSERT INTO public.music_tracks (slug, title, artist, moods, territories, duration_seconds, sort_order) VALUES
  ('real-del-monte-mi-tesoro', 'Real del Monte Mi Tesoro', 'TAMV ONLINE Records', ARRAY['romantica','territorial'], ARRAY['plaza-principal','callejon-del-dicho'], 252, 1),
  ('niebla-de-la-montana', 'Niebla de la Montaña', 'TAMV ONLINE Records', ARRAY['ambiental','niebla'], ARRAY['bosque-hiloche'], 218, 2),
  ('socavon-del-rey', 'Socavón del Rey', 'TAMV ONLINE Records', ARRAY['epica','mineria'], ARRAY['mina-acosta'], 305, 3),
  ('paste-de-domingo', 'Paste de Domingo', 'TAMV ONLINE Records', ARRAY['alegre','gastronomia'], ARRAY['mercado'], 198, 4),
  ('panteon-ingles-vals', 'Vals del Panteón Inglés', 'TAMV ONLINE Records', ARRAY['melancolica','historica'], ARRAY['panteon-ingles'], 274, 5);

-- SEEDS trivia
INSERT INTO public.trivia_questions (question, options, correct_index, category, difficulty, explanation) VALUES
  ('¿En qué año se fundó la Mina de Acosta?', ARRAY['1727','1810','1535','1900'], 0, 'mineria', 'medio', 'La Mina de Acosta fue fundada en 1727 y hoy es museo vivo.'),
  ('¿Cuál es el origen del paste en Real del Monte?', ARRAY['Mexicano','Cornish (Cornualles)','Español','Francés'], 1, 'gastronomia', 'facil', 'Los pastes llegaron con los mineros cornish de Cornualles, Inglaterra.'),
  ('¿Qué cementerio único en Latinoamérica está en RDM?', ARRAY['Panteón Francés','Panteón Inglés','Panteón Alemán','Panteón Italiano'], 1, 'historia', 'facil', 'El Panteón Inglés es el único cementerio británico en Latinoamérica.'),
  ('¿A qué altitud aproximada se encuentra Real del Monte?', ARRAY['1500m','2100m','2700m','3200m'], 2, 'geografia', 'medio', 'RDM se ubica a ~2,700 metros sobre el nivel del mar.'),
  ('¿Qué mineral principal se extraía en Real del Monte?', ARRAY['Oro','Plata','Cobre','Hierro'], 1, 'mineria', 'facil', 'La plata fue el mineral principal explotado por la Compañía Real del Monte y Pachuca.'),
  ('¿Qué leyenda local habla de una mujer que vaga por las minas?', ARRAY['La Llorona Minera','El Charro Negro','El Duende de la Veta','La Mulata'], 0, 'leyendas', 'medio', 'La Llorona Minera es una de las leyendas más conocidas del subsuelo de RDM.'),
  ('¿Cuántas Federaciones componen el ecosistema TAMV?', ARRAY['5','7','9','12'], 1, 'tamv', 'dificil', 'El kernel TAMV se organiza en 7 Federaciones soberanas.'),
  ('¿Cuál es el cerro icónico mirador de Real del Monte?', ARRAY['Cerro del Cubilete','Cerro del Hiloche','Cerro Gordo','Cerro de la Estrella'], 1, 'geografia', 'medio', 'El Cerro del Hiloche ofrece vistas panorámicas del pueblo.');