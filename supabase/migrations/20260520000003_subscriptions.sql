-- Hidden Gift — Subscriptions scaffolding (Phase 2 prep, Pro launch Phase 3)
-- Per-user subscription state. Will later sync via PayOS webhook.
-- Kept user-keyed (not account-keyed) so a user with multiple owned zones
-- enjoys Pro across all of them with a single purchase.

CREATE TABLE IF NOT EXISTS public.subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'pro', 'trialing', 'past_due', 'cancelled')),
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  payos_order_id TEXT,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.subscriptions IS
  'Per-user subscription state. Pro flag derives from plan IN (pro, trialing) AND current_period_end > now().';

-- RLS: user can SELECT their own row
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

-- INSERT/UPDATE through service_role only (PayOS webhook handler). No client policies.

-- Trigger to maintain updated_at
CREATE OR REPLACE FUNCTION public.touch_subscriptions_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.touch_subscriptions_updated_at();
