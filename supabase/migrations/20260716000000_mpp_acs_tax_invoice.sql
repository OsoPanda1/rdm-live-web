-- ============================================================
-- MPP (Machine Payments), ACS, Tax, Invoicing tables
-- 2026-07-16
-- ============================================================

-- MPP: track machine-to-machine payments
CREATE TABLE IF NOT EXISTS mpp_transactions (
  id BIGSERIAL PRIMARY KEY,
  payment_intent_id TEXT UNIQUE NOT NULL,
  amount BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  resource_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE mpp_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to mpp_transactions"
  ON mpp_transactions
  USING (true)
  WITH CHECK (true);

-- Invoicing: track Stripe invoices synced via webhook
CREATE TABLE IF NOT EXISTS invoices (
  id BIGSERIAL PRIMARY KEY,
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  customer_id TEXT NOT NULL,
  number TEXT,
  amount_due BIGINT NOT NULL DEFAULT 0,
  amount_paid BIGINT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'mxn',
  status TEXT NOT NULL DEFAULT 'draft',
  hosted_url TEXT,
  pdf_url TEXT,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices"
  ON invoices
  FOR SELECT
  USING (
    customer_id IN (
      SELECT stripe_customer_id FROM subscriptions_premium WHERE user_id = auth.uid()
      UNION
      SELECT stripe_customer_id FROM commerce_subscriptions
    )
  );

CREATE POLICY "Admin full access to invoices"
  ON invoices
  USING (true)
  WITH CHECK (true);

-- Tax settings per business/user
CREATE TABLE IF NOT EXISTS tax_settings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id TEXT,
  tax_enabled BOOLEAN NOT NULL DEFAULT true,
  automatic_tax BOOLEAN NOT NULL DEFAULT true,
  tax_behavior TEXT NOT NULL DEFAULT 'exclusive',
  default_country TEXT NOT NULL DEFAULT 'MX',
  default_postal_code TEXT NOT NULL DEFAULT '42000',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, business_id)
);

ALTER TABLE tax_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tax settings"
  ON tax_settings
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ACS: agentic commerce session log
CREATE TABLE IF NOT EXISTS acs_sessions (
  id BIGSERIAL PRIMARY KEY,
  stripe_session_id TEXT UNIQUE NOT NULL,
  seller_profile_id TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  amount_total BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  customer_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE acs_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to acs_sessions"
  ON acs_sessions
  USING (true)
  WITH CHECK (true);
