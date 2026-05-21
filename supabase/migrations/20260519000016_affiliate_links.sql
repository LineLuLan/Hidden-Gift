-- Hidden Gift — Affiliate link tracking on gift_ideas
-- Adds outbound affiliate URL + click counter + last-click timestamp.
-- Click events are aggregated; per-user attribution lives in PostHog.

ALTER TABLE public.gift_ideas
  ADD COLUMN IF NOT EXISTS affiliate_url TEXT,
  ADD COLUMN IF NOT EXISTS affiliate_partner TEXT,
  ADD COLUMN IF NOT EXISTS click_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_clicked_at TIMESTAMPTZ;

COMMENT ON COLUMN public.gift_ideas.affiliate_url IS
  'Outbound destination. Server-side redirect via /gift-ideas/go/[id] appends UTM.';
COMMENT ON COLUMN public.gift_ideas.affiliate_partner IS
  'Slug of the affiliate network (shopee / tiki / lazada / amazon). For commission reporting.';

CREATE INDEX IF NOT EXISTS idx_gift_ideas_affiliate
  ON public.gift_ideas (affiliate_partner)
  WHERE affiliate_partner IS NOT NULL;

-- Atomic click counter — caller doesn't race against admin updates
CREATE OR REPLACE FUNCTION public.increment_gift_idea_click(p_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.gift_ideas
    SET click_count = click_count + 1,
        last_clicked_at = NOW()
    WHERE id = p_id;
$$;

-- Demo: backfill 5 ideas with sample affiliate URLs (Shopee VN format)
UPDATE public.gift_ideas
  SET affiliate_url = 'https://shopee.vn/search?keyword=' || REPLACE(title, ' ', '%20'),
      affiliate_partner = 'shopee'
  WHERE affiliate_url IS NULL
    AND title IN (
      'Vòng tay handmade kết tên',
      'Camera in liền Fujifilm Mini 12',
      'Tai nghe Bluetooth tone pastel',
      'Bàn phím cơ Akko hồng',
      'Lego mini Bonsai 878 mảnh'
    );
