-- Hidden Gift — Wishlist redesign (Phase 1.5)
-- ADR-003 (2026-05-20): pivot from private-diary to shared+silent-claim model.
--
-- Changes:
--   1. wishes RLS: SELECT widens to all account members (was: owner-only)
--   2. secrets RLS: SELECT becomes 3-way asymmetric (preparer always; other non-recipient
--      members see active claims for squad coordination; recipient sees only delivered)
--   3. New index idx_wishes_account_active for shared list view
--   4. Comment updates reflect new model
--
-- Realtime safety: secrets is in supabase_realtime publication (migration 004).
-- Supabase Realtime respects RLS (since 2024) — Linh's subscription will NOT receive
-- Dũng's preparing-status inserts because new RLS blocks her until delivered.

-- ─── wishes: open to account members ──────────────────────────────────────

DROP POLICY IF EXISTS "wishes_select_own" ON public.wishes;
DROP POLICY IF EXISTS "wishes_update_own" ON public.wishes;
DROP POLICY IF EXISTS "wishes_delete_own" ON public.wishes;

-- All account members can SELECT (shared wishlist)
CREATE POLICY "wishes_select_account"
  ON public.wishes FOR SELECT
  USING (public.is_account_member(account_id));

-- Only owner can UPDATE / DELETE (insert policy unchanged, still owner-only)
CREATE POLICY "wishes_update_owner"
  ON public.wishes FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "wishes_delete_owner"
  ON public.wishes FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- ─── secrets: 3-way asymmetric ────────────────────────────────────────────

DROP POLICY IF EXISTS "secrets_select" ON public.secrets;

-- 1) Preparer (auth.uid() = prepared_by) — always sees own claim
-- 2) Other non-recipient members (auth.uid() <> recipient AND <> preparer AND member of account)
--    see active (non-delivered) claims for squad coordination (avoid double-buy)
-- 3) Recipient sees ONLY when status='delivered' (asymmetric moat preserved)
CREATE POLICY "secrets_select"
  ON public.secrets FOR SELECT
  USING (
    (SELECT auth.uid()) = prepared_by
    OR (
      (SELECT auth.uid()) <> recipient_id
      AND (SELECT auth.uid()) <> prepared_by
      AND public.is_account_member(account_id)
      AND status <> 'delivered'
    )
    OR (
      (SELECT auth.uid()) = recipient_id
      AND status = 'delivered'
    )
  );

-- ─── indexes ──────────────────────────────────────────────────────────────

-- Shared list view: scan by account_id, exclude fulfilled
CREATE INDEX IF NOT EXISTS idx_wishes_account_active
  ON public.wishes (account_id, created_at DESC)
  WHERE is_fulfilled = FALSE;

-- ─── comment updates ──────────────────────────────────────────────────────

COMMENT ON TABLE public.wishes IS
  'Shared wishlist. All account members SELECT (ADR-003). Only owner can UPDATE/DELETE.';

COMMENT ON TABLE public.secrets IS
  'Gift claims + free-form prep. 3-way asymmetric: preparer always; non-recipient member sees active; recipient sees only delivered (ADR-003).';
