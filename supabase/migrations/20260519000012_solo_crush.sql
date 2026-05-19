-- Hidden Gift — Solo Crush mode + onboarding tracking
--
-- `crushes`: one private crush profile per solo account. user_id-private RLS
-- so even if account upgrades to couple later, the partner cannot see this row.
-- `accounts.onboarded_at` marks when user completed the /onboarding wizard,
-- allowing middleware to nudge first-time users through it.

ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.crushes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL CHECK (char_length(nickname) BETWEEN 1 AND 80),
  bio TEXT CHECK (bio IS NULL OR char_length(bio) <= 1000),
  emoji TEXT CHECK (emoji IS NULL OR char_length(emoji) <= 10),
  met_at TIMESTAMPTZ,
  countdown_label TEXT CHECK (countdown_label IS NULL OR char_length(countdown_label) <= 80),
  countdown_to TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'crushing'
    CHECK (status IN ('crushing', 'confessed', 'rejected', 'together')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (account_id, user_id)
);

COMMENT ON TABLE public.crushes IS
  'Solo-mode crush profile. Private to the user (user_id = auth.uid() RLS).';

ALTER TABLE public.crushes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crushes FORCE ROW LEVEL SECURITY;

CREATE POLICY "crushes_select_own"
  ON public.crushes FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "crushes_insert_own"
  ON public.crushes FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND public.is_account_member(account_id)
  );

CREATE POLICY "crushes_update_own"
  ON public.crushes FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "crushes_delete_own"
  ON public.crushes FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

CREATE INDEX idx_crushes_user_id ON public.crushes (user_id);

-- updated_at trigger
CREATE TRIGGER trg_crushes_updated_at BEFORE UPDATE ON public.crushes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Diary entries — many per crush profile, daily notes
CREATE TABLE IF NOT EXISTS public.crush_diary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood TEXT CHECK (mood IS NULL OR char_length(mood) <= 10),
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.crush_diary IS
  'Solo-mode private diary entries about crush. user_id-RLS, never visible to partner.';

ALTER TABLE public.crush_diary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crush_diary FORCE ROW LEVEL SECURITY;

CREATE POLICY "crush_diary_select_own"
  ON public.crush_diary FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "crush_diary_insert_own"
  ON public.crush_diary FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND public.is_account_member(account_id)
  );

CREATE POLICY "crush_diary_update_own"
  ON public.crush_diary FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "crush_diary_delete_own"
  ON public.crush_diary FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

CREATE INDEX idx_crush_diary_user_recent
  ON public.crush_diary (user_id, entry_date DESC);
