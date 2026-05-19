-- Hidden Gift — Partner invite acceptance
-- Atomic function: accept invite code → move user from auto-account to target account,
-- migrate user-owned wishes, delete orphan account, invalidate one-time invite code.

CREATE OR REPLACE FUNCTION public.accept_invite(p_code TEXT)
RETURNS TABLE(account_id UUID, role TEXT)
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

  -- Look up target account by code
  SELECT id INTO v_target_account_id
  FROM public.accounts
  WHERE invite_code = p_code;
  IF v_target_account_id IS NULL THEN
    RAISE EXCEPTION 'INVITE_NOT_FOUND';
  END IF;

  -- Already a member?
  IF EXISTS (
    SELECT 1 FROM public.account_members
    WHERE account_id = v_target_account_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'ALREADY_MEMBER';
  END IF;

  -- Capacity check: couple = max 2 members
  SELECT COUNT(*) INTO v_target_member_count
  FROM public.account_members WHERE account_id = v_target_account_id;
  IF v_target_member_count >= 2 THEN
    RAISE EXCEPTION 'ACCOUNT_FULL';
  END IF;

  -- Read user's current (auto-created) account + display name
  SELECT am.account_id, am.display_name
  INTO v_current_account_id, v_display_name
  FROM public.account_members am
  WHERE am.user_id = v_user_id
  ORDER BY am.joined_at ASC
  LIMIT 1;

  -- Migrate user-owned wishes to target account so RLS / queries stay consistent
  IF v_current_account_id IS NOT NULL
     AND v_current_account_id <> v_target_account_id THEN
    UPDATE public.wishes
       SET account_id = v_target_account_id
     WHERE user_id = v_user_id
       AND account_id = v_current_account_id;
  END IF;

  -- Remove user from auto-account
  DELETE FROM public.account_members
   WHERE user_id = v_user_id
     AND account_id = v_current_account_id;

  -- Delete orphan auto-account if no members left
  SELECT COUNT(*) INTO v_current_member_count
  FROM public.account_members
  WHERE account_id = v_current_account_id;
  IF v_current_member_count = 0 THEN
    DELETE FROM public.accounts WHERE id = v_current_account_id;
  END IF;

  -- Add user to target account as partner
  INSERT INTO public.account_members (account_id, user_id, role, display_name)
  VALUES (v_target_account_id, v_user_id, 'partner', v_display_name);

  -- One-time use: clear invite code
  UPDATE public.accounts SET invite_code = NULL WHERE id = v_target_account_id;

  RETURN QUERY SELECT v_target_account_id, 'partner'::TEXT;
END;
$$;

COMMENT ON FUNCTION public.accept_invite IS
  'Atomic invite acceptance: validates code + capacity, migrates wishes, removes orphan account, adds caller as partner, invalidates code.';

-- Helper RPC: rotate / set new invite code (called when owner wants new code)
CREATE OR REPLACE FUNCTION public.rotate_invite_code(p_account_id UUID, p_new_code TEXT)
RETURNS TEXT
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

  -- Only owner can rotate
  IF NOT EXISTS (
    SELECT 1 FROM public.account_members
    WHERE account_id = p_account_id
      AND user_id = v_user_id
      AND role = 'owner'
  ) THEN
    RAISE EXCEPTION 'NOT_OWNER';
  END IF;

  -- Capacity check: don't allow code on already-full account
  IF (SELECT COUNT(*) FROM public.account_members WHERE account_id = p_account_id) >= 2 THEN
    RAISE EXCEPTION 'ACCOUNT_FULL';
  END IF;

  UPDATE public.accounts SET invite_code = p_new_code WHERE id = p_account_id;
  RETURN p_new_code;
END;
$$;

COMMENT ON FUNCTION public.rotate_invite_code IS
  'Owner-only: set a new invite code on their account. Caller passes generated code.';
