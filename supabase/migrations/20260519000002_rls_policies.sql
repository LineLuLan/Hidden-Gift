-- Hidden Gift — RLS policies (Phase 1)
-- Pattern: wrap auth.uid() in SELECT for query-cache (CLAUDE.md §7 performance).
-- All policies use (SELECT auth.uid()) instead of bare auth.uid().
--
-- NOTE 2026-05-20 (ADR-003): wishes_select_own + secrets_select are SUPERSEDED
-- by migration 20260520000001_wishlist_redesign.sql. See docs/DECISIONS.md ADR-003
-- for the shared-wishlist + silent-claim model. Do not restore the old policies.

-- ─── Enable RLS ────────────────────────────────────────────────────────────

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emoji_pings ENABLE ROW LEVEL SECURITY;
-- gift_ideas: no RLS — public read intentional

-- Force RLS even for table owner (defense-in-depth)
ALTER TABLE public.wishes FORCE ROW LEVEL SECURITY;
ALTER TABLE public.secrets FORCE ROW LEVEL SECURITY;

-- ─── accounts ──────────────────────────────────────────────────────────────

CREATE POLICY "accounts_select_member"
  ON public.accounts FOR SELECT
  USING (public.is_account_member(id));

CREATE POLICY "accounts_update_owner"
  ON public.accounts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.account_members
      WHERE account_id = accounts.id
        AND user_id = (SELECT auth.uid())
        AND role = 'owner'
    )
  );

-- ─── account_members ──────────────────────────────────────────────────────

CREATE POLICY "account_members_select_same_account"
  ON public.account_members FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM public.account_members
      WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "account_members_update_self"
  ON public.account_members FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

-- ─── wishes (USER-PRIVATE — CRITICAL) ──────────────────────────────────────
-- Partner CANNOT see another user's wishes, even in same account.

CREATE POLICY "wishes_select_own"
  ON public.wishes FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "wishes_insert_own"
  ON public.wishes FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND public.is_account_member(account_id)
  );

CREATE POLICY "wishes_update_own"
  ON public.wishes FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "wishes_delete_own"
  ON public.wishes FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- ─── secrets (ASYMMETRIC VISIBILITY — CRITICAL TECH MOAT) ──────────────────
-- prepared_by sees always.
-- recipient sees ONLY when status='delivered'.

CREATE POLICY "secrets_select"
  ON public.secrets FOR SELECT
  USING (
    (SELECT auth.uid()) = prepared_by
    OR (
      (SELECT auth.uid()) = recipient_id
      AND status = 'delivered'
    )
  );

CREATE POLICY "secrets_insert"
  ON public.secrets FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) = prepared_by
    AND public.is_account_member(account_id)
  );

CREATE POLICY "secrets_update_owner"
  ON public.secrets FOR UPDATE
  USING ((SELECT auth.uid()) = prepared_by);

CREATE POLICY "secrets_delete_owner"
  ON public.secrets FOR DELETE
  USING ((SELECT auth.uid()) = prepared_by);

-- ─── letters ───────────────────────────────────────────────────────────────
-- sender sees always.
-- recipient sees only after delivered_at IS NOT NULL.

CREATE POLICY "letters_select"
  ON public.letters FOR SELECT
  USING (
    (SELECT auth.uid()) = sender_id
    OR (
      (SELECT auth.uid()) = recipient_id
      AND delivered_at IS NOT NULL
    )
  );

CREATE POLICY "letters_insert"
  ON public.letters FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) = sender_id
    AND public.is_account_member(account_id)
  );

CREATE POLICY "letters_update_sender_pre_delivery"
  ON public.letters FOR UPDATE
  USING (
    (SELECT auth.uid()) = sender_id
    AND delivered_at IS NULL
  );

CREATE POLICY "letters_delete_sender_pre_delivery"
  ON public.letters FOR DELETE
  USING (
    (SELECT auth.uid()) = sender_id
    AND delivered_at IS NULL
  );

-- ─── memories (account-shared) ─────────────────────────────────────────────

CREATE POLICY "memories_select_account"
  ON public.memories FOR SELECT
  USING (public.is_account_member(account_id));

CREATE POLICY "memories_insert_self"
  ON public.memories FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) = uploaded_by
    AND public.is_account_member(account_id)
  );

CREATE POLICY "memories_delete_uploader"
  ON public.memories FOR DELETE
  USING ((SELECT auth.uid()) = uploaded_by);

-- ─── emoji_pings ───────────────────────────────────────────────────────────

CREATE POLICY "emoji_pings_select"
  ON public.emoji_pings FOR SELECT
  USING (
    (SELECT auth.uid()) IN (sender_id, recipient_id)
  );

CREATE POLICY "emoji_pings_insert"
  ON public.emoji_pings FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) = sender_id
    AND public.is_account_member(account_id)
  );

CREATE POLICY "emoji_pings_update_recipient"
  ON public.emoji_pings FOR UPDATE
  USING ((SELECT auth.uid()) = recipient_id);
