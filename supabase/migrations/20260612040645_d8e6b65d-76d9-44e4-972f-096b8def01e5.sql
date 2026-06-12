
-- Allow anonymous full access to CRM tables (pre-launch convenience)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'events','event_contacts','discussions','discussion_messages',
    'contracts','payment_authorizations','admin_notifications',
    'locations','location_areas','location_menu_tiers','location_menu_courses',
    'location_menu_items','location_beverage_packages','location_addons',
    'location_faqs','location_form_config','location_contract_templates'
  ] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO anon', t);
    EXECUTE format('DROP POLICY IF EXISTS "Pre-launch open access" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Pre-launch open access" ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;
