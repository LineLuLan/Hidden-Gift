-- Hidden Gift — Fix accept_invite: rename OUT params to avoid ambiguity with
-- account_members.account_id column inside DELETE / SELECT.
-- DROP needed because return type changes (Postgres rejects CREATE OR REPLACE).

DROP FUNCTION IF EXISTS public.accept_invite(TEXT);

CREATE FUNCTION public.accept_invite(p_code TEXT)
RETURNS TABLE(joined_account_id UUID, joined_role TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_target_account_id UUID;
  v_target_member_count INTEGER;
  v_current_account_id UUID;
  v_current_member_count INTEGER;
  v_display_name TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;

  SELECT a.id INTO v_target_account_id
  FROM public.accounts a
  WHERE a.invite_code = p_code;
  IF v_target_account_id IS NULL THEN
    RAISE EXCEPTION 'INVITE_NOT_FOUND';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.account_members am
    WHERE am.account_id = v_target_account_id AND am.user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'ALREADY_MEMBER';
  END IF;

  SELECT COUNT(*) INTO v_target_member_count
  FROM public.account_members am
  WHERE am.account_id = v_target_account_id;
  IF v_target_member_count >= 2 THEN
    RAISE EXCEPTION 'ACCOUNT_FULL';
  END IF;

  SELECT am.account_id, am.display_name
  INTO v_current_account_id, v_display_name
  FROM public.account_members am
  WHERE am.user_id = v_user_id
  ORDER BY am.joined_at ASC
  LIMIT 1;

  IF v_current_account_id IS NOT NULL
     AND v_current_account_id <> v_target_account_id THEN
    UPDATE public.wishes w
       SET account_id = v_target_account_id
     WHERE w.user_id = v_user_id
       AND w.account_id = v_current_account_id;
  END IF;

  DELETE FROM public.account_members am
   WHERE am.user_id = v_user_id
     AND am.account_id = v_current_account_id;

  SELECT COUNT(*) INTO v_current_member_count
  FROM public.account_members am
  WHERE am.account_id = v_current_account_id;
  IF v_current_member_count = 0 THEN
    DELETE FROM public.accounts a WHERE a.id = v_current_account_id;
  END IF;

  INSERT INTO public.account_members (account_id, user_id, role, display_name)
  VALUES (v_target_account_id, v_user_id, 'partner', v_display_name);

  UPDATE public.accounts a SET invite_code = NULL WHERE a.id = v_target_account_id;

  RETURN QUERY SELECT v_target_account_id, 'partner'::TEXT;
END;
$$;
