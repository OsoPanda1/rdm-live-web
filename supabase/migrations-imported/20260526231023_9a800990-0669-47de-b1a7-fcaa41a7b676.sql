
-- Premium subscriptions: add Stripe linkage
ALTER TABLE public.subscriptions_premium
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS idx_subs_premium_stripe_sub
  ON public.subscriptions_premium(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- Allow service_role to manage (webhook syncs)
GRANT ALL ON public.subscriptions_premium TO service_role;
DROP POLICY IF EXISTS "Service role manages premium" ON public.subscriptions_premium;
CREATE POLICY "Service role manages premium" ON public.subscriptions_premium
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users update own premium" ON public.subscriptions_premium;
CREATE POLICY "Users update own premium" ON public.subscriptions_premium
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Commerce subscriptions: link to paying user + Stripe
ALTER TABLE public.commerce_subscriptions
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS idx_commerce_subs_stripe_sub
  ON public.commerce_subscriptions(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

GRANT SELECT, INSERT, UPDATE ON public.commerce_subscriptions TO authenticated;
GRANT ALL ON public.commerce_subscriptions TO service_role;

DROP POLICY IF EXISTS "Users see own commerce subs" ON public.commerce_subscriptions;
CREATE POLICY "Users see own commerce subs" ON public.commerce_subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create own commerce subs" ON public.commerce_subscriptions;
CREATE POLICY "Users create own commerce subs" ON public.commerce_subscriptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role manages commerce subs" ON public.commerce_subscriptions;
CREATE POLICY "Service role manages commerce subs" ON public.commerce_subscriptions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Businesses: add owner + allow service_role/webhook to toggle is_subscribed
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS owner_id uuid;

GRANT UPDATE ON public.businesses TO authenticated;
GRANT ALL ON public.businesses TO service_role;

DROP POLICY IF EXISTS "Owners update own business" ON public.businesses;
CREATE POLICY "Owners update own business" ON public.businesses
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Service role manages businesses" ON public.businesses;
CREATE POLICY "Service role manages businesses" ON public.businesses
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Profiles: allow service_role to update (webhook flips is_premium)
GRANT ALL ON public.profiles TO service_role;
DROP POLICY IF EXISTS "Service role manages profiles" ON public.profiles;
CREATE POLICY "Service role manages profiles" ON public.profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Trigger to keep updated_at fresh
DROP TRIGGER IF EXISTS trg_subs_premium_updated ON public.subscriptions_premium;
CREATE TRIGGER trg_subs_premium_updated
  BEFORE UPDATE ON public.subscriptions_premium
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_commerce_subs_updated ON public.commerce_subscriptions;
CREATE TRIGGER trg_commerce_subs_updated
  BEFORE UPDATE ON public.commerce_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
