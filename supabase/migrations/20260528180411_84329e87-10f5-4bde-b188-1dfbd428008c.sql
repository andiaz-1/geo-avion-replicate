
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

-- Status enum
CREATE TYPE public.event_status AS ENUM ('new_lead','quote_sent','contract_sent','confirmed','completed','cancelled');

-- Events
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  event_date date,
  event_time text,
  is_lunch boolean DEFAULT false,
  guest_count integer NOT NULL DEFAULT 0,
  adult_count integer NOT NULL DEFAULT 0,
  kids_count integer NOT NULL DEFAULT 0,
  venue text DEFAULT 'Weston',
  wants_private_room boolean DEFAULT false,
  menu_tier text,
  course_choice text,
  menu_selections jsonb DEFAULT '{}'::jsonb,
  decide_later boolean DEFAULT false,
  beverage_strategy text,
  bar_type text,
  bar_duration text,
  addons jsonb DEFAULT '{}'::jsonb,
  allergens text,
  special_requests text,
  bringing_cake boolean DEFAULT false,
  bringing_decor boolean DEFAULT false,
  quote jsonb DEFAULT '{}'::jsonb,
  status event_status NOT NULL DEFAULT 'new_lead',
  internal_notes text,
  contract_sent_at timestamptz,
  contract_signed_at timestamptz,
  payment_auth_at timestamptz,
  menu_header_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all events" ON public.events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Contracts
CREATE TABLE public.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  signature_type text,
  signature_value text,
  signer_name text,
  signed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contracts TO authenticated;
GRANT ALL ON public.contracts TO service_role;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all contracts" ON public.contracts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Payment auth (no PAN/CVV stored)
CREATE TABLE public.payment_authorizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  cardholder_name text NOT NULL,
  card_last4 text NOT NULL,
  exp_month text NOT NULL,
  exp_year text NOT NULL,
  status text NOT NULL DEFAULT 'authorized',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_authorizations TO authenticated;
GRANT ALL ON public.payment_authorizations TO service_role;
ALTER TABLE public.payment_authorizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all payauth" ON public.payment_authorizations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Menu headers
CREATE TABLE public.menu_headers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  header_type text NOT NULL,
  value text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_headers TO authenticated;
GRANT ALL ON public.menu_headers TO service_role;
ALTER TABLE public.menu_headers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all menuheaders" ON public.menu_headers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Notifications
CREATE TABLE public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  kind text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_notifications TO authenticated;
GRANT ALL ON public.admin_notifications TO service_role;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all notifications" ON public.admin_notifications FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_events_updated BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('menu-headers', 'menu-headers', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "menu-headers public read" ON storage.objects FOR SELECT
  USING (bucket_id = 'menu-headers');
CREATE POLICY "menu-headers admin write" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'menu-headers' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'menu-headers' AND public.has_role(auth.uid(), 'admin'));
