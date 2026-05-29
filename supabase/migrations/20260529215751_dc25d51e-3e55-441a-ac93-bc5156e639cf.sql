ALTER TABLE public.events ADD COLUMN IF NOT EXISTS portal_unlocked boolean NOT NULL DEFAULT false;
-- Existing rows: treat them as unlocked so nothing in flight breaks.
UPDATE public.events SET portal_unlocked = true WHERE portal_unlocked = false AND created_at < now();