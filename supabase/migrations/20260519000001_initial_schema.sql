-- Hidden Gift — Initial schema (Phase 1 Couple Core)
-- Tables: accounts, account_members, wishes, secrets, letters, memories, emoji_pings, gift_ideas
-- RLS enabled in 002. Indexes in 003. Realtime in 004.

-- ─── Extensions ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Helper functions (table-independent) ─────────────────────────────────

-- Auto-update updated_at on row UPDATE
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- is_account_member function defined AFTER tables (depends on account_members)

-- ─── Tables ────────────────────────────────────────────────────────────────

-- accounts: multi-tenant root (solo / couple / squad / family)
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL DEFAULT 'couple'
    CHECK (kind IN ('solo', 'couple', 'squad', 'family')),
  display_name TEXT,
  invite_code TEXT UNIQUE,
  feature_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
  pro_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.accounts IS 'Multi-tenant root. One account per couple/squad. Solo accounts upgrade to couple on partner invite.';

-- account_members: user ↔ account junction
CREATE TABLE public.account_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner'
    CHECK (role IN ('owner', 'partner', 'member')),
  display_name TEXT,
  avatar_url TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (account_id, user_id)
);
COMMENT ON TABLE public.account_members IS 'User membership in accounts. display_name = nickname within this couple (e.g. "Linh").';

-- wishes: user-private wish list (RLS: only owner sees)
CREATE TABLE public.wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 500),
  emoji TEXT CHECK (emoji IS NULL OR char_length(emoji) <= 10),
  image_url TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  is_fulfilled BOOLEAN NOT NULL DEFAULT FALSE,
  fulfilled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.wishes IS 'User-private wishes. Partner CANNOT see — enforced by RLS user_id = auth.uid().';

-- secrets: gifts being prepared (RLS: prepared_by only until delivered)
CREATE TABLE public.secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  prepared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  linked_wish_id UUID REFERENCES public.wishes(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 1000),
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'preparing'
    CHECK (status IN ('preparing', 'ready', 'delivered')),
  reveal_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (prepared_by <> recipient_id)
);
COMMENT ON TABLE public.secrets IS 'Asymmetric: recipient CANNOT query until status=delivered. RLS-enforced.';

-- letters: scheduled letters (RLS: sender always, recipient only after delivered)
CREATE TABLE public.letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL CHECK (char_length(subject) BETWEEN 1 AND 200),
  body JSONB NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  delivered_at TIMESTAMPTZ,
  is_draft BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (sender_id <> recipient_id OR is_draft = TRUE)
);
COMMENT ON TABLE public.letters IS 'Scheduled letter. body = Tiptap JSON. Recipient unlocked at delivered_at.';

-- memories: shared photo/video metadata (R2 URL only)
CREATE TABLE public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT CHECK (title IS NULL OR char_length(title) <= 200),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 1000),
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_size BIGINT,
  taken_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.memories IS 'Account-shared media. All account members can see; only uploader can delete.';

-- emoji_pings: realtime micro-interactions
CREATE TABLE public.emoji_pings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (char_length(emoji) BETWEEN 1 AND 10),
  message TEXT CHECK (message IS NULL OR char_length(message) <= 200),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (sender_id <> recipient_id)
);
COMMENT ON TABLE public.emoji_pings IS 'Live emoji notes. Supabase Realtime subscribed by recipient.';

-- gift_ideas: curated public catalog (no RLS)
CREATE TABLE public.gift_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  occasion TEXT[],
  price_min INTEGER,
  price_max INTEGER,
  persona_fit TEXT[],
  emoji TEXT,
  image_url TEXT,
  popularity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.gift_ideas IS 'Curated gift catalog. Public read, no RLS. Replaces AI-generated suggestions (CLAUDE.md Decision #1).';

-- ─── Helper functions (table-dependent) ───────────────────────────────────

-- Check if current user belongs to an account
CREATE OR REPLACE FUNCTION public.is_account_member(p_account_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.account_members
    WHERE account_id = p_account_id
      AND user_id = (SELECT auth.uid())
  );
$$;

-- ─── Triggers: updated_at ──────────────────────────────────────────────────

CREATE TRIGGER trg_accounts_updated_at BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_wishes_updated_at BEFORE UPDATE ON public.wishes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_secrets_updated_at BEFORE UPDATE ON public.secrets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_letters_updated_at BEFORE UPDATE ON public.letters
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Onboarding trigger: auto-create account on signup ─────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_account_id UUID;
  default_name TEXT;
BEGIN
  default_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.accounts (kind, display_name)
  VALUES ('couple', default_name)
  RETURNING id INTO new_account_id;

  INSERT INTO public.account_members (account_id, user_id, role, display_name)
  VALUES (new_account_id, NEW.id, 'owner', default_name);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
