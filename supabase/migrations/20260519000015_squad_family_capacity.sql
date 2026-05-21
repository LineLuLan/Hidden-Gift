-- Hidden Gift — Squad / Family member capacity rules
-- Capacity by account kind:
--   solo:   1 member
--   couple: 2 members
--   squad:  8 members
--   family: 12 members

CREATE OR REPLACE FUNCTION public.account_member_capacity(p_kind TEXT)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_kind
    WHEN 'solo' THEN 1
    WHEN 'couple' THEN 2
    WHEN 'squad' THEN 8
    WHEN 'family' THEN 12
    ELSE 2
  END;
$$;

-- Rewrite accept_invite to use the kind-aware capacity
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
  v_target_kind TEXT;
  v_target_capacity INTEGER;
  v_target_member_count INTEGER;
  v_current_account_id UUID;
  v_current_member_count INTEGER;
  v_display_name TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;

  SELECT a.id, a.kind INTO v_target_account_id, v_target_kind
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

  v_target_capacity := public.account_member_capacity(v_target_kind);
  SELECT COUNT(*) INTO v_target_member_count
  FROM public.account_members am
  WHERE am.account_id = v_target_account_id;
  IF v_target_member_count >= v_target_capacity THEN
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

  -- Role: 'partner' for couple, 'member' for squad/family, 'partner' default
  INSERT INTO public.account_members (account_id, user_id, role, display_name)
  VALUES (
    v_target_account_id,
    v_user_id,
    CASE WHEN v_target_kind IN ('squad', 'family') THEN 'member' ELSE 'partner' END,
    v_display_name
  );

  -- Couple invite is one-time use; squad/family can keep recycling code
  IF v_target_kind = 'couple' THEN
    UPDATE public.accounts a SET invite_code = NULL WHERE a.id = v_target_account_id;
  END IF;

  RETURN QUERY SELECT v_target_account_id, (
    CASE WHEN v_target_kind IN ('squad', 'family') THEN 'member' ELSE 'partner' END
  )::TEXT;
END;
$$;

-- Allow owner to switch kind (couple ↔ squad ↔ family, never to solo if >1 member)
CREATE OR REPLACE FUNCTION public.set_account_kind(p_account_id UUID, p_new_kind TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_member_count INTEGER;
  v_capacity INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.account_members
    WHERE account_id = p_account_id
      AND user_id = v_user_id
      AND role = 'owner'
  ) THEN
    RAISE EXCEPTION 'NOT_OWNER';
  END IF;

  IF p_new_kind NOT IN ('solo', 'couple', 'squad', 'family') THEN
    RAISE EXCEPTION 'INVALID_KIND';
  END IF;

  -- Don't allow downgrading below current member count
  SELECT COUNT(*) INTO v_member_count
  FROM public.account_members WHERE account_id = p_account_id;
  v_capacity := public.account_member_capacity(p_new_kind);
  IF v_member_count > v_capacity THEN
    RAISE EXCEPTION 'TOO_MANY_MEMBERS';
  END IF;

  UPDATE public.accounts SET kind = p_new_kind WHERE id = p_account_id;
END;
$$;
