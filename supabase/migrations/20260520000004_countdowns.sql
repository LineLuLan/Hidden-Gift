-- Hidden Gift — Countdowns / Anniversary tracker (Phase 2)
-- Shared per account. Owner of the entry can edit/delete; all members can see.

CREATE TABLE IF NOT EXISTS public.countdowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  target_date DATE NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  emoji TEXT CHECK (emoji IS NULL OR char_length(emoji) <= 10),
  note TEXT CHECK (note IS NULL OR char_length(note) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.countdowns IS
  'Shared anniversary/birthday counters. RLS: all account members see; only created_by can edit/delete.';

-- Trigger updated_at (reuse public.set_updated_at from initial schema)
CREATE TRIGGER trg_countdowns_updated_at
  BEFORE UPDATE ON public.countdowns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_countdowns_account_target
  ON public.countdowns (account_id, target_date);
CREATE INDEX IF NOT EXISTS idx_countdowns_created_by
  ON public.countdowns (created_by);

-- RLS
ALTER TABLE public.countdowns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "countdowns_select_account"
  ON public.countdowns FOR SELECT
  USING (public.is_account_member(account_id));

CREATE POLICY "countdowns_insert_member"
  ON public.countdowns FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) = created_by
    AND public.is_account_member(account_id)
  );

CREATE POLICY "countdowns_update_owner"
  ON public.countdowns FOR UPDATE
  USING ((SELECT auth.uid()) = created_by);

CREATE POLICY "countdowns_delete_owner"
  ON public.countdowns FOR DELETE
  USING ((SELECT auth.uid()) = created_by);
