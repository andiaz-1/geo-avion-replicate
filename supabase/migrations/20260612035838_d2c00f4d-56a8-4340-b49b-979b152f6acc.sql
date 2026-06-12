
-- ============================================================
-- ROLES
-- ============================================================
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'location_admin';

-- (commit enum additions before use)
COMMIT;
BEGIN;

ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS location_id uuid;

-- ============================================================
-- LOCATIONS
-- ============================================================
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  address text,
  phone text,
  email text,
  timezone text NOT NULL DEFAULT 'America/New_York',

  logo_url text,
  favicon_url text,
  hero_image_url text,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,

  color_primary text NOT NULL DEFAULT '0 0% 9%',
  color_secondary text NOT NULL DEFAULT '0 0% 45%',
  color_accent text NOT NULL DEFAULT '12 76% 61%',
  color_bg text NOT NULL DEFAULT '0 0% 100%',
  color_text text NOT NULL DEFAULT '0 0% 9%',

  font_title text NOT NULL DEFAULT 'Playfair Display',
  font_subtitle text NOT NULL DEFAULT 'Playfair Display',
  font_body text NOT NULL DEFAULT 'Inter',

  tagline text,
  about_text text,

  service_charge_pct numeric NOT NULL DEFAULT 23,
  tax_pct numeric NOT NULL DEFAULT 8,
  deposit_pct numeric NOT NULL DEFAULT 25,
  min_guests int NOT NULL DEFAULT 10,
  max_guests int NOT NULL DEFAULT 200,
  buyout_threshold int,

  is_active boolean NOT NULL DEFAULT true,
  published boolean NOT NULL DEFAULT false,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.locations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.locations TO authenticated;
GRANT ALL ON public.locations TO service_role;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- has_location_access
-- ============================================================
CREATE OR REPLACE FUNCTION public.has_location_access(_user_id uuid, _location_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND (
        role = 'super_admin'
        OR role = 'admin'
        OR (role = 'location_admin' AND location_id = _location_id)
      )
  );
$$;

-- ============================================================
-- LOCATIONS POLICIES
-- ============================================================
CREATE POLICY "Public can view active published locations"
  ON public.locations FOR SELECT
  USING (is_active = true AND published = true);

CREATE POLICY "Super admins manage all locations"
  ON public.locations FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Location admins view their location"
  ON public.locations FOR SELECT
  TO authenticated
  USING (public.has_location_access(auth.uid(), id));

CREATE POLICY "Location admins update their location"
  ON public.locations FOR UPDATE
  TO authenticated
  USING (public.has_location_access(auth.uid(), id))
  WITH CHECK (public.has_location_access(auth.uid(), id));

-- ============================================================
-- Helper: generic child-table grants/policies via DO block
-- ============================================================

-- ===== location_areas =====
CREATE TABLE public.location_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  photo_url text,
  min_guests int,
  max_guests int,
  base_fee numeric DEFAULT 0,
  fnb_minimum numeric DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.location_areas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.location_areas TO authenticated;
GRANT ALL ON public.location_areas TO service_role;
ALTER TABLE public.location_areas ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_location_areas_updated_at BEFORE UPDATE ON public.location_areas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Public read areas of published locations" ON public.location_areas FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.locations l WHERE l.id = location_id AND l.is_active AND l.published));
CREATE POLICY "Location access manages areas" ON public.location_areas FOR ALL TO authenticated
  USING (public.has_location_access(auth.uid(), location_id))
  WITH CHECK (public.has_location_access(auth.uid(), location_id));

-- ===== location_menu_tiers =====
CREATE TABLE public.location_menu_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  photo_url text,
  price_per_person numeric NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.location_menu_tiers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.location_menu_tiers TO authenticated;
GRANT ALL ON public.location_menu_tiers TO service_role;
ALTER TABLE public.location_menu_tiers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_lmt_updated_at BEFORE UPDATE ON public.location_menu_tiers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Public read tiers of published locations" ON public.location_menu_tiers FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.locations l WHERE l.id = location_id AND l.is_active AND l.published));
CREATE POLICY "Location access manages tiers" ON public.location_menu_tiers FOR ALL TO authenticated
  USING (public.has_location_access(auth.uid(), location_id))
  WITH CHECK (public.has_location_access(auth.uid(), location_id));

-- ===== location_menu_courses =====
CREATE TABLE public.location_menu_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id uuid NOT NULL REFERENCES public.location_menu_tiers(id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  name text NOT NULL,
  max_selections int NOT NULL DEFAULT 1,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.location_menu_courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.location_menu_courses TO authenticated;
GRANT ALL ON public.location_menu_courses TO service_role;
ALTER TABLE public.location_menu_courses ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_lmc_updated_at BEFORE UPDATE ON public.location_menu_courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Public read courses of published locations" ON public.location_menu_courses FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.locations l WHERE l.id = location_id AND l.is_active AND l.published));
CREATE POLICY "Location access manages courses" ON public.location_menu_courses FOR ALL TO authenticated
  USING (public.has_location_access(auth.uid(), location_id))
  WITH CHECK (public.has_location_access(auth.uid(), location_id));

-- ===== location_menu_items =====
CREATE TABLE public.location_menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.location_menu_courses(id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  photo_url text,
  allergens text[] NOT NULL DEFAULT '{}',
  upcharge numeric NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.location_menu_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.location_menu_items TO authenticated;
GRANT ALL ON public.location_menu_items TO service_role;
ALTER TABLE public.location_menu_items ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_lmi_updated_at BEFORE UPDATE ON public.location_menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Public read items of published locations" ON public.location_menu_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.locations l WHERE l.id = location_id AND l.is_active AND l.published));
CREATE POLICY "Location access manages items" ON public.location_menu_items FOR ALL TO authenticated
  USING (public.has_location_access(auth.uid(), location_id))
  WITH CHECK (public.has_location_access(auth.uid(), location_id));

-- ===== location_beverage_packages =====
CREATE TABLE public.location_beverage_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  name text NOT NULL,
  package_type text NOT NULL DEFAULT 'custom',
  description text,
  price_per_person numeric NOT NULL DEFAULT 0,
  duration_hours numeric,
  inclusions text[] NOT NULL DEFAULT '{}',
  min_spend numeric,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.location_beverage_packages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.location_beverage_packages TO authenticated;
GRANT ALL ON public.location_beverage_packages TO service_role;
ALTER TABLE public.location_beverage_packages ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_lbp_updated_at BEFORE UPDATE ON public.location_beverage_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Public read bev of published locations" ON public.location_beverage_packages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.locations l WHERE l.id = location_id AND l.is_active AND l.published));
CREATE POLICY "Location access manages bev" ON public.location_beverage_packages FOR ALL TO authenticated
  USING (public.has_location_access(auth.uid(), location_id))
  WITH CHECK (public.has_location_access(auth.uid(), location_id));

-- ===== location_addons =====
CREATE TABLE public.location_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  photo_url text,
  category text,
  price numeric NOT NULL DEFAULT 0,
  price_type text NOT NULL DEFAULT 'flat',
  max_qty int,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.location_addons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.location_addons TO authenticated;
GRANT ALL ON public.location_addons TO service_role;
ALTER TABLE public.location_addons ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_la_updated_at BEFORE UPDATE ON public.location_addons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Public read addons of published locations" ON public.location_addons FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.locations l WHERE l.id = location_id AND l.is_active AND l.published));
CREATE POLICY "Location access manages addons" ON public.location_addons FOR ALL TO authenticated
  USING (public.has_location_access(auth.uid(), location_id))
  WITH CHECK (public.has_location_access(auth.uid(), location_id));

-- ===== location_form_config =====
CREATE TABLE public.location_form_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL UNIQUE REFERENCES public.locations(id) ON DELETE CASCADE,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  custom_fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  allergies_enabled boolean NOT NULL DEFAULT true,
  dietary_enabled boolean NOT NULL DEFAULT true,
  special_requests_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.location_form_config TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.location_form_config TO authenticated;
GRANT ALL ON public.location_form_config TO service_role;
ALTER TABLE public.location_form_config ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_lfc_updated_at BEFORE UPDATE ON public.location_form_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Public read form config of published locations" ON public.location_form_config FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.locations l WHERE l.id = location_id AND l.is_active AND l.published));
CREATE POLICY "Location access manages form config" ON public.location_form_config FOR ALL TO authenticated
  USING (public.has_location_access(auth.uid(), location_id))
  WITH CHECK (public.has_location_access(auth.uid(), location_id));

-- ===== location_faqs =====
CREATE TABLE public.location_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.location_faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.location_faqs TO authenticated;
GRANT ALL ON public.location_faqs TO service_role;
ALTER TABLE public.location_faqs ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_lfaq_updated_at BEFORE UPDATE ON public.location_faqs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Public read faqs of published locations" ON public.location_faqs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.locations l WHERE l.id = location_id AND l.is_active AND l.published));
CREATE POLICY "Location access manages faqs" ON public.location_faqs FOR ALL TO authenticated
  USING (public.has_location_access(auth.uid(), location_id))
  WITH CHECK (public.has_location_access(auth.uid(), location_id));

-- ===== location_contract_templates =====
-- location_id NULL => system template (read-only base) selectable as starting point
CREATE TABLE public.location_contract_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid REFERENCES public.locations(id) ON DELETE CASCADE,
  name text NOT NULL,
  body text NOT NULL,
  terms text,
  signature_required boolean NOT NULL DEFAULT true,
  deposit_required boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'custom',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.location_contract_templates TO authenticated;
GRANT ALL ON public.location_contract_templates TO service_role;
ALTER TABLE public.location_contract_templates ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_lct_updated_at BEFORE UPDATE ON public.location_contract_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Authenticated can read system templates" ON public.location_contract_templates FOR SELECT
  TO authenticated
  USING (location_id IS NULL OR public.has_location_access(auth.uid(), location_id));
CREATE POLICY "Location access manages own templates" ON public.location_contract_templates FOR INSERT TO authenticated
  WITH CHECK (location_id IS NOT NULL AND public.has_location_access(auth.uid(), location_id));
CREATE POLICY "Location access updates own templates" ON public.location_contract_templates FOR UPDATE TO authenticated
  USING (location_id IS NOT NULL AND public.has_location_access(auth.uid(), location_id))
  WITH CHECK (location_id IS NOT NULL AND public.has_location_access(auth.uid(), location_id));
CREATE POLICY "Location access deletes own templates" ON public.location_contract_templates FOR DELETE TO authenticated
  USING (location_id IS NOT NULL AND public.has_location_access(auth.uid(), location_id));

-- ============================================================
-- Add location_id to existing tables (nullable for now; backfill below)
-- ============================================================
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.locations(id);
ALTER TABLE public.event_contacts ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.locations(id);
ALTER TABLE public.discussions ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.locations(id);
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.locations(id);
ALTER TABLE public.payment_authorizations ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.locations(id);

-- ============================================================
-- SEED Weston location + backfill
-- ============================================================
INSERT INTO public.locations (slug, name, address, phone, timezone, tagline, is_active, published)
VALUES ('weston', 'Salumeria 104 — Weston', 'Weston, FL', NULL, 'America/New_York',
        'Italian private dining & events', true, true)
ON CONFLICT (slug) DO NOTHING;

-- Capture Weston id for backfill
DO $$
DECLARE weston uuid;
BEGIN
  SELECT id INTO weston FROM public.locations WHERE slug = 'weston';

  UPDATE public.events SET location_id = weston WHERE location_id IS NULL;
  UPDATE public.event_contacts SET location_id = weston WHERE location_id IS NULL;
  UPDATE public.discussions SET location_id = weston WHERE location_id IS NULL;
  UPDATE public.contracts SET location_id = weston WHERE location_id IS NULL;
  UPDATE public.payment_authorizations SET location_id = weston WHERE location_id IS NULL;

  -- Default empty form_config row
  INSERT INTO public.location_form_config (location_id, steps)
  VALUES (weston, '["basics","venue","menu","beverage","addons","contact"]'::jsonb)
  ON CONFLICT (location_id) DO NOTHING;
END $$;

-- ============================================================
-- SEED system contract templates (location_id = NULL)
-- ============================================================
INSERT INTO public.location_contract_templates (location_id, name, body, terms, source, is_default)
VALUES
  (NULL, 'Casual',
   'Hi {client_first_name}, thanks for choosing us for your event on {event_date}! We have you down for {guest_count} guests at {location_name}. Total: {estimated_total}.',
   'A 25% deposit holds your date. Cancellations within 14 days forfeit the deposit.',
   'system', false),
  (NULL, 'Corporate',
   'This agreement is entered into between {location_name} and {company_name}, represented by {client_first_name} {client_last_name}, for an event on {event_date} for {guest_count} guests. Total contract value: {estimated_total}.',
   'Net 30 payment terms. Cancellation 30+ days: full refund. 14-29 days: 50% refund. <14 days: forfeit.',
   'system', false),
  (NULL, 'Formal',
   'EVENT AGREEMENT — This Agreement is made on {today} between {location_name} ("Venue") and {client_first_name} {client_last_name} ("Client") for the event scheduled {event_date}. Guest count: {guest_count}. Estimated total: {estimated_total}.',
   '1. Deposit. 25% non-refundable deposit due upon signing. 2. Final headcount due 7 days prior. 3. Service charge and tax as quoted.',
   'system', false);

COMMIT;
