-- Hidden Gift — Indexes (Phase 1)
-- Cover every RLS predicate + every FK + frequent filter combination.

-- ─── account_members ──────────────────────────────────────────────────────
CREATE INDEX idx_account_members_user_id ON public.account_members (user_id);
CREATE INDEX idx_account_members_account_id ON public.account_members (account_id);

-- ─── wishes ───────────────────────────────────────────────────────────────
CREATE INDEX idx_wishes_user_id ON public.wishes (user_id);
CREATE INDEX idx_wishes_account_id ON public.wishes (account_id);
-- Partial: active wishes per user (used for free-tier 5-cap check + main list)
CREATE INDEX idx_wishes_user_active
  ON public.wishes (user_id, created_at DESC)
  WHERE is_fulfilled = FALSE;

-- ─── secrets ──────────────────────────────────────────────────────────────
CREATE INDEX idx_secrets_prepared_by ON public.secrets (prepared_by);
CREATE INDEX idx_secrets_account_id ON public.secrets (account_id);
-- Partial: delivered secrets visible to recipient
CREATE INDEX idx_secrets_recipient_delivered
  ON public.secrets (recipient_id)
  WHERE status = 'delivered';
-- Wishes linkage (when secret fulfills a wish)
CREATE INDEX idx_secrets_linked_wish ON public.secrets (linked_wish_id)
  WHERE linked_wish_id IS NOT NULL;

-- ─── letters ──────────────────────────────────────────────────────────────
CREATE INDEX idx_letters_sender ON public.letters (sender_id);
CREATE INDEX idx_letters_account_id ON public.letters (account_id);
-- Partial: delivered letters visible to recipient
CREATE INDEX idx_letters_recipient_delivered
  ON public.letters (recipient_id, delivered_at DESC)
  WHERE delivered_at IS NOT NULL;
-- Trigger.dev scan: pending letters to deliver
CREATE INDEX idx_letters_scheduled_pending
  ON public.letters (scheduled_for)
  WHERE delivered_at IS NULL AND is_draft = FALSE;

-- ─── memories ─────────────────────────────────────────────────────────────
CREATE INDEX idx_memories_account_id ON public.memories (account_id, created_at DESC);
CREATE INDEX idx_memories_uploaded_by ON public.memories (uploaded_by);

-- ─── emoji_pings ──────────────────────────────────────────────────────────
CREATE INDEX idx_emoji_pings_recipient_recent
  ON public.emoji_pings (recipient_id, created_at DESC);
-- Partial: unread for badge count
CREATE INDEX idx_emoji_pings_unread
  ON public.emoji_pings (recipient_id)
  WHERE read_at IS NULL;

-- ─── gift_ideas (catalog filters) ─────────────────────────────────────────
CREATE INDEX idx_gift_ideas_category ON public.gift_ideas (category);
CREATE INDEX idx_gift_ideas_popularity ON public.gift_ideas (popularity DESC);
CREATE INDEX idx_gift_ideas_occasion ON public.gift_ideas USING GIN (occasion);
CREATE INDEX idx_gift_ideas_persona ON public.gift_ideas USING GIN (persona_fit);
