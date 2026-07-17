-- RDM Digital SOT · admin anti-abuse, audit trail and stricter write gates

CREATE TABLE IF NOT EXISTS public.admin_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('merchant.approve','merchant.reject','reward.update','catalog.change','business.approval')),
  target_table text NOT NULL CHECK (target_table IN ('merchant_registrations','rewards_catalog','merchant_categories','game_memberships')),
  target_id uuid,
  csrf_token_hash text NOT NULL CHECK (length(csrf_token_hash) = 64),
  before_state jsonb,
  after_state jsonb,
  ip inet DEFAULT inet_client_addr(),
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins read audit events" ON public.admin_audit_events;
DROP POLICY IF EXISTS "admins insert audit events" ON public.admin_audit_events;

CREATE POLICY "admins read audit events" ON public.admin_audit_events
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins insert audit events" ON public.admin_audit_events
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    AND actor_id = auth.uid()
    AND csrf_token_hash ~ '^[0-9a-f]{64}$'
  );

CREATE INDEX IF NOT EXISTS idx_admin_audit_actor_created ON public.admin_audit_events(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_target ON public.admin_audit_events(target_table, target_id, created_at DESC);

-- Force owner edits to remain non-published. Admin-only policies below gate publication/rejection.
DROP POLICY IF EXISTS "owners update own merchants pre-publish" ON public.merchant_registrations;
CREATE POLICY "owners update own merchants pre-publish" ON public.merchant_registrations
  FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id AND status IN ('draft','awaiting_payment','paid'))
  WITH CHECK (auth.uid() = owner_id AND status IN ('draft','awaiting_payment','paid'));

DROP POLICY IF EXISTS "admins manage merchants" ON public.merchant_registrations;
CREATE POLICY "admins manage merchants" ON public.merchant_registrations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins manage rewards" ON public.rewards_catalog;
CREATE POLICY "admins manage rewards" ON public.rewards_catalog
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    AND cost_points >= 0
    AND stock >= -1
    AND length(name) BETWEEN 2 AND 160
    AND length(category) BETWEEN 2 AND 80
  );

-- Consistent RLS for profiles and memberships when these tables exist in prior migrations.
DO $$
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "users read own profile" ON public.profiles;
    DROP POLICY IF EXISTS "users update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "admins read all profiles" ON public.profiles;
    CREATE POLICY "users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF to_regclass('public.game_memberships') IS NOT NULL THEN
    ALTER TABLE public.game_memberships ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "users read own membership" ON public.game_memberships;
    DROP POLICY IF EXISTS "admins read all memberships" ON public.game_memberships;
    DROP POLICY IF EXISTS "admins manage memberships" ON public.game_memberships;
    CREATE POLICY "users read own membership" ON public.game_memberships FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "admins read all memberships" ON public.game_memberships FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    CREATE POLICY "admins manage memberships" ON public.game_memberships FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;
