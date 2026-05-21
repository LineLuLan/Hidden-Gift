-- Hidden Gift — Fix letters UPDATE policy WITH CHECK clause.
--
-- Original USING-only policy implicitly applies USING as WITH CHECK too,
-- which blocks setting delivered_at=now() because the post-state row no
-- longer satisfies `delivered_at IS NULL`.
--
-- Split into:
--   USING       — pre-update: must be sender AND not yet delivered
--   WITH CHECK  — post-update: must still be sender (delivery transition allowed)

DROP POLICY IF EXISTS "letters_update_sender_pre_delivery" ON public.letters;

CREATE POLICY "letters_update_sender_pre_delivery"
  ON public.letters FOR UPDATE
  USING (
    (SELECT auth.uid()) = sender_id
    AND delivered_at IS NULL
  )
  WITH CHECK (
    (SELECT auth.uid()) = sender_id
  );
