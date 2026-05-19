-- Hidden Gift — Helper view: current_user_account
-- Returns the primary account ID for the calling user (couple/solo).
-- Used by server actions to scope wishes/secrets/etc to the right tenant.

CREATE OR REPLACE VIEW public.my_account AS
  SELECT
    a.id,
    a.kind,
    a.display_name,
    a.invite_code,
    a.feature_flags,
    a.pro_until,
    am.role AS my_role,
    am.display_name AS my_display_name,
    am.avatar_url AS my_avatar_url
  FROM public.accounts a
  INNER JOIN public.account_members am
    ON am.account_id = a.id
   AND am.user_id = (SELECT auth.uid());

COMMENT ON VIEW public.my_account IS
  'Current user''s account(s). Usually 1 row. Use SELECT * FROM my_account LIMIT 1 to get default account.';
