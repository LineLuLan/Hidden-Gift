-- Hidden Gift — Fix infinite recursion in account_members SELECT policy.
--
-- Original policy:
--   USING (account_id IN (SELECT account_id FROM account_members WHERE user_id = auth.uid()))
-- The inner SELECT also goes through the same policy → infinite recursion at runtime.
--
-- Fix: split into "own row" (no subquery) OR "is_account_member()" helper.
-- is_account_member is SECURITY DEFINER + owned by postgres (BYPASSRLS), so its
-- internal query on account_members does NOT re-enter the policy.

DROP POLICY IF EXISTS "account_members_select_same_account" ON public.account_members;

CREATE POLICY "account_members_select"
  ON public.account_members FOR SELECT
  USING (
    user_id = (SELECT auth.uid())
    OR public.is_account_member(account_id)
  );
