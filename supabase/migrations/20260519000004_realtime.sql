-- Hidden Gift — Enable Supabase Realtime
-- Subscriptions filtered by RLS — recipient only sees pings/secrets for them.

ALTER PUBLICATION supabase_realtime ADD TABLE public.emoji_pings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.secrets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.letters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.memories;
