
-- ============================================
-- 1. Extend events table with CRM fields
-- ============================================
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS event_name text,
  ADD COLUMN IF NOT EXISTS event_type text,
  ADD COLUMN IF NOT EXISTS children_attending boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS antipasti_selections text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS entree_selections text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS dessert_selections text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS beverage_package text,
  ADD COLUMN IF NOT EXISTS menu_header_type text,
  ADD COLUMN IF NOT EXISTS menu_header_text text,
  ADD COLUMN IF NOT EXISTS menu_header_file text,
  ADD COLUMN IF NOT EXISTS subtotal numeric,
  ADD COLUMN IF NOT EXISTS service_charge numeric,
  ADD COLUMN IF NOT EXISTS tax_amount numeric,
  ADD COLUMN IF NOT EXISTS estimated_total numeric,
  ADD COLUMN IF NOT EXISTS fnb_minimum numeric,
  ADD COLUMN IF NOT EXISTS deposit_amount numeric,
  ADD COLUMN IF NOT EXISTS contract_status text DEFAULT 'not_sent',
  ADD COLUMN IF NOT EXISTS cc_auth_status text DEFAULT 'not_submitted',
  ADD COLUMN IF NOT EXISTS cc_last_four text,
  ADD COLUMN IF NOT EXISTS cc_auth_date timestamptz,
  ADD COLUMN IF NOT EXISTS signature_name text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS client_first_name text,
  ADD COLUMN IF NOT EXISTS client_last_name text;

-- ============================================
-- 2. event_contacts
-- ============================================
CREATE TABLE IF NOT EXISTS public.event_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text,
  phone text,
  email_1 text,
  email_2 text,
  company_name text,
  position text,
  is_main boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_contacts TO authenticated;
GRANT ALL ON public.event_contacts TO service_role;

ALTER TABLE public.event_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin all event_contacts" ON public.event_contacts
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_event_contacts_event_id ON public.event_contacts(event_id);

CREATE TRIGGER update_event_contacts_updated_at
  BEFORE UPDATE ON public.event_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 3. discussions
-- ============================================
CREATE TABLE IF NOT EXISTS public.discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title text NOT NULL,
  author_name text,
  message_count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.discussions TO authenticated;
GRANT ALL ON public.discussions TO service_role;

ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin all discussions" ON public.discussions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_discussions_event_id ON public.discussions(event_id);

CREATE TRIGGER update_discussions_updated_at
  BEFORE UPDATE ON public.discussions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 4. discussion_messages
-- ============================================
CREATE TABLE IF NOT EXISTS public.discussion_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id uuid NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  body text NOT NULL,
  author_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.discussion_messages TO authenticated;
GRANT ALL ON public.discussion_messages TO service_role;

ALTER TABLE public.discussion_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin all discussion_messages" ON public.discussion_messages
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_discussion_messages_discussion_id ON public.discussion_messages(discussion_id);
