-- ============================================================================
-- YUN Architecture — Database Migration
-- Real del Monte Digital Hub
-- 
-- Creates YUN governance tables for event logging, data catalog,
-- federation health, ADR tracking, and observability.
-- ============================================================================

-- ============================================================================
-- 1. YUN DATA CATALOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS yun_data_catalog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL CHECK (domain IN ('identity', 'commerce', 'knowledge', 'telemetry', 'gameplay')),
  entity TEXT NOT NULL,
  owner_federation TEXT NOT NULL CHECK (owner_federation IN (
    'comercio', 'turismo_cultura', 'academia', 'gobierno', 'tech_infra', 'comunidad', 'metaverso_xr'
  )),
  data_class TEXT NOT NULL CHECK (data_class IN ('public', 'internal', 'confidential', 'restricted')),
  storage TEXT NOT NULL CHECK (storage IN ('supabase', 'neon', 'turso', 'd1', 'redis')),
  retention_days INTEGER NOT NULL DEFAULT 365,
  pii_fields TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(domain, entity)
);

-- Seed data catalog with existing tables
INSERT INTO yun_data_catalog (domain, entity, owner_federation, data_class, storage, retention_days, pii_fields, description) VALUES
  ('identity', 'profiles', 'gobierno', 'confidential', 'supabase', 3650, ARRAY['email', 'full_name', 'phone'], 'User profiles with PII'),
  ('identity', 'sessions', 'tech_infra', 'confidential', 'supabase', 90, ARRAY['user_id'], 'User sessions'),
  ('commerce', 'businesses', 'comercio', 'internal', 'neon', 1825, ARRAY['owner_name', 'email'], 'Business listings'),
  ('commerce', 'products', 'comercio', 'internal', 'neon', 1825, ARRAY[], 'Product catalog'),
  ('commerce', 'orders', 'comercio', 'confidential', 'neon', 365, ARRAY['customer_name', 'email', 'address'], 'Order records'),
  ('commerce', 'categories', 'comercio', 'public', 'neon', 9999, ARRAY[], 'Product categories'),
  ('knowledge', 'communities', 'comunidad', 'public', 'turso', 9999, ARRAY[], 'Community groups'),
  ('knowledge', 'posts', 'comunidad', 'internal', 'turso', 1825, ARRAY[], 'Community posts'),
  ('knowledge', 'comments', 'comunidad', 'internal', 'turso', 1825, ARRAY[], 'Post comments'),
  ('knowledge', 'wiki_pages', 'academia', 'public', 'turso', 9999, ARRAY[], 'Wiki documentation'),
  ('knowledge', 'wiki_edits', 'academia', 'internal', 'turso', 365, ARRAY[], 'Wiki edit history'),
  ('knowledge', 'wiki_links', 'academia', 'public', 'turso', 9999, ARRAY[], 'Wiki cross-references'),
  ('telemetry', 'analytics_events', 'tech_infra', 'internal', 'd1', 90, ARRAY['user_id'], 'Analytics events'),
  ('telemetry', 'notifications', 'tech_infra', 'internal', 'd1', 30, ARRAY['user_id'], 'User notifications'),
  ('gameplay', 'gamification_points', 'comunidad', 'internal', 'redis', 365, ARRAY['user_id'], 'User points'),
  ('gameplay', 'badges', 'comunidad', 'public', 'redis', 9999, ARRAY[], 'Achievement badges'),
  ('gameplay', 'leaderboards', 'comunidad', 'public', 'redis', 30, ARRAY[], 'Leaderboard rankings'),
  ('gameplay', 'metaverse_spaces', 'metaverso_xr', 'public', 'redis', 9999, ARRAY[], 'Metaverse spaces'),
  ('gameplay', 'metaverse_objects', 'metaverso_xr', 'public', 'redis', 9999, ARRAY[], 'Metaverse objects'),
  ('gameplay', 'metaverse_interactions', 'metaverso_xr', 'internal', 'redis', 90, ARRAY['user_id'], 'Metaverse interactions'),
  ('gameplay', 'likes', 'comunidad', 'internal', 'redis', 1825, ARRAY['user_id'], 'Post likes');

-- ============================================================================
-- 2. YUN EVENT LOG (immutable audit trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS yun_event_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  federation TEXT,
  domain TEXT,
  classification TEXT DEFAULT 'internal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying events by type and time
CREATE INDEX IF NOT EXISTS idx_yun_event_log_type ON yun_event_log(event_type);
CREATE INDEX IF NOT EXISTS idx_yun_event_log_domain ON yun_event_log(domain);
CREATE INDEX IF NOT EXISTS idx_yun_event_log_created ON yun_event_log(created_at DESC);

-- ============================================================================
-- 3. YUN FEDERATION HEALTH
-- ============================================================================

CREATE TABLE IF NOT EXISTS yun_federation_health (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  federation TEXT NOT NULL CHECK (federation IN (
    'comercio', 'turismo_cultura', 'academia', 'gobierno', 'tech_infra', 'comunidad', 'metaverso_xr'
  )),
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'critical', 'offline')),
  health_score NUMERIC(3,2) DEFAULT 1.0,
  error_rate NUMERIC(5,4) DEFAULT 0,
  p99_latency_ms NUMERIC(10,2) DEFAULT 0,
  active_domains TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_yun_federation_health_fed ON yun_federation_health(federation);
CREATE INDEX IF NOT EXISTS idx_yun_federation_health_time ON yun_federation_health(recorded_at DESC);

-- ============================================================================
-- 4. YUN ADR (Architecture Decision Records)
-- ============================================================================

CREATE TABLE IF NOT EXISTS yun_adr (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  adr_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('proposed', 'accepted', 'deprecated', 'superseded')),
  authors TEXT[] DEFAULT '{}',
  context TEXT NOT NULL,
  decision TEXT NOT NULL,
  consequences TEXT[] DEFAULT '{}',
  superseded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed ADRs
INSERT INTO yun_adr (adr_number, title, status, authors, context, decision, consequences) VALUES
  ('ADR-001', 'Use Supabase as Primary Database', 'accepted', ARRAY['RDM Team'], 
   'Need a reliable, scalable database for identity and core data with built-in auth.',
   'Use Supabase as the primary database for identity, profiles, and authentication. Use PostgreSQL-compatible engines (Neon, Turso) for domain-specific data.',
   ARRAY['Leverages Supabase auth', 'Separation of concerns by domain', 'Potential vendor lock-in']),
  ('ADR-002', 'Edge-First with Express Middleware Fallback', 'accepted', ARRAY['RDM Team'],
   'Need to serve users globally with low latency while maintaining API compatibility.',
   'Deploy edge functions (Vercel Edge) for static content and simple API routes. Use Express middleware for complex business logic that requires Node.js runtime.',
   ARRAY['Lower latency for users', 'Increased deployment complexity', 'Two runtime environments to maintain']),
  ('ADR-003', 'Event-Driven Federation Communication', 'accepted', ARRAY['RDM Team'],
   'Federations need to communicate without tight coupling.',
   'Use an event bus pattern where all cross-federation communication happens through typed events. Each federation owns its domain and publishes events for others.',
   ARRAY['Loose coupling between federations', 'Eventual consistency model', 'Need event versioning strategy']),
  ('ADR-004', 'Progressive Autonomy for Admin Actions', 'accepted', ARRAY['RDM Team'],
   'Admin actions should be safe and reversible by default.',
   'Implement a progressive autonomy model where critical actions require explicit confirmation, and all changes are logged with compensating transactions.',
   ARRAY['Safer admin operations', 'More complex implementation', 'Audit trail for all changes']);
