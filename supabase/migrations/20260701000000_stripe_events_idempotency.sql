-- Migration: stripe_events — idempotency table for Stripe webhooks
-- Prevents duplicate processing of the same Stripe event
-- Only service_role reads/writes (no user-facing access)

CREATE TABLE IF NOT EXISTS public.stripe_events (
  event_id text PRIMARY KEY,
  type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  retry_count int NOT NULL DEFAULT 0,
  error_message text
);

GRANT ALL ON public.stripe_events TO service_role;

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
-- No policies for authenticated/anon = 0 access from Data API. Correct.

CREATE INDEX IF NOT EXISTS idx_stripe_events_processed_at
  ON public.stripe_events (processed_at DESC);

-- Dead letter table for events that failed all retries
CREATE TABLE IF NOT EXISTS public.stripe_failed_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id text NOT NULL,
  type text NOT NULL,
  payload jsonb,
  error_message text,
  failed_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.stripe_failed_events TO service_role;

ALTER TABLE public.stripe_failed_events ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_stripe_failed_events_event_id
  ON public.stripe_failed_events (event_id);
