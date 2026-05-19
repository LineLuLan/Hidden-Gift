-- Hidden Gift — Soft delete + scheduled hard delete for accounts
-- PDPL 2026 Article 18: user has right to deletion, 30-day grace period.
-- After 30 days, scheduled job purges the auth.users row (cascades delete
-- everything through FK ON DELETE CASCADE on account_members → accounts).

ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ;

COMMENT ON COLUMN public.accounts.deletion_requested_at IS
  'When set, account is in 30-day grace window. Scheduled Trigger.dev job purges expired requests.';

-- Index for the periodic purge job
CREATE INDEX IF NOT EXISTS idx_accounts_pending_deletion
  ON public.accounts (deletion_requested_at)
  WHERE deletion_requested_at IS NOT NULL;

-- Helper: user calls to mark their account for deletion (or cancel).
CREATE OR REPLACE FUNCTION public.request_account_deletion()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;

  UPDATE public.accounts a
    SET deletion_requested_at = NOW()
    FROM public.account_members am
    WHERE am.account_id = a.id
      AND am.user_id = v_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_account_deletion()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;

  UPDATE public.accounts a
    SET deletion_requested_at = NULL
    FROM public.account_members am
    WHERE am.account_id = a.id
      AND am.user_id = v_user_id;
END;
$$;
