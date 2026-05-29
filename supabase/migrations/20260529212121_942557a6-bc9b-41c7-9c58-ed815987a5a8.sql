ALTER TABLE public.discussions ADD COLUMN IF NOT EXISTS audience text NOT NULL DEFAULT 'client';
ALTER TABLE public.discussion_messages ADD COLUMN IF NOT EXISTS audience text NOT NULL DEFAULT 'client';
CREATE INDEX IF NOT EXISTS idx_discussions_event_audience ON public.discussions(event_id, audience);