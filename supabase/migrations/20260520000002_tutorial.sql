-- Hidden Gift — Tutorial completion tracking (Phase 2)
-- Adds per-membership flag so tutorial can re-run for each new zone a user joins.

ALTER TABLE public.account_members
ADD COLUMN IF NOT EXISTS tutorial_completed_at TIMESTAMPTZ;

COMMENT ON COLUMN public.account_members.tutorial_completed_at IS
  'NULL = tutorial chưa show / chưa complete cho membership này. Set khi user finish hoặc skip.';
