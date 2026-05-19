-- Hidden Gift — Per-user email notification preferences
-- Stored on account_members so each member of a couple/squad/family can opt out
-- independently. Default: all on.

ALTER TABLE public.account_members
  ADD COLUMN IF NOT EXISTS email_prefs JSONB NOT NULL DEFAULT
    '{"letter_delivered": true, "invite_accepted": true, "wrapped_yearly": true, "ping_summary": false}'::jsonb;

COMMENT ON COLUMN public.account_members.email_prefs IS
  'Email opt-in flags. Keys: letter_delivered, invite_accepted, wrapped_yearly, ping_summary.';
