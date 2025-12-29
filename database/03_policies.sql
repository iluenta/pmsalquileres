-- Consolidated RLS Policies
-- Ensures strict tenant isolation across the entire system

-- 1. Enable RLS on all tables
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
  LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
  END LOOP;
END $$;

-- 2. Tenant Isolation Policies (Direct tenant_id check)
-- These tables have a direct tenant_id column.

DO $$ 
DECLARE 
  t_name TEXT;
  tables_with_tenant_id TEXT[] := ARRAY[
    'tenants', 'configuration_types', 'users', 'persons', 
    'person_contact_infos', 'person_fiscal_addresses', 'properties', 
    'property_amenities', 'property_images', 'property_guides', 
    'sales_channels', 'property_sales_channels', 'bookings', 
    'treasury_accounts', 'payments', 'service_providers', 'movements', 
    'apartment_sections', 'guide_sections', 'guide_places', 
    'guide_contact_info', 'house_guide_items', 'house_rules', 
    'practical_info', 'tips', 'property_highlights', 
    'property_pricing_plans', 'property_reviews', 'health_checks'
  ];
BEGIN
  FOREACH t_name IN ARRAY tables_with_tenant_id 
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_policy ON public.%I', t_name);
    -- For tenants table, we check 'id' instead of 'tenant_id'
    IF t_name = 'tenants' THEN
      EXECUTE format('CREATE POLICY tenant_isolation_policy ON public.%I FOR ALL USING (id = public.user_tenant_id())', t_name);
    ELSE
      EXECUTE format('CREATE POLICY tenant_isolation_policy ON public.%I FOR ALL USING (tenant_id = public.user_tenant_id())', t_name);
    END IF;
  END LOOP;
END $$;

-- 3. Indirect Isolation Policies (Dependency check)
-- These tables don't have tenant_id but depend on a parent table that does.

-- configuration_values -> configuration_types
DROP POLICY IF EXISTS tenant_isolation_policy ON public.configuration_values;
CREATE POLICY tenant_isolation_policy ON public.configuration_values
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.configuration_types
      WHERE id = configuration_type_id 
      AND tenant_id = public.user_tenant_id()
    )
  );

-- user_settings -> users
DROP POLICY IF EXISTS tenant_isolation_policy ON public.user_settings;
CREATE POLICY tenant_isolation_policy ON public.user_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = user_id 
      AND tenant_id = public.user_tenant_id()
    )
  );

-- service_provider_services -> service_providers
DROP POLICY IF EXISTS tenant_isolation_policy ON public.service_provider_services;
CREATE POLICY tenant_isolation_policy ON public.service_provider_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.service_providers
      WHERE id = service_provider_id 
      AND tenant_id = public.user_tenant_id()
    )
  );

-- movement_expense_items -> movements
DROP POLICY IF EXISTS tenant_isolation_policy ON public.movement_expense_items;
CREATE POLICY tenant_isolation_policy ON public.movement_expense_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.movements
      WHERE id = movement_id 
      AND tenant_id = public.user_tenant_id()
    )
  );

-- 4. Public Access Policies (Exceptions)
-- These allow specific access regardless of user session (e.g. for landing/guides)

-- Properties: Allow public SELECT if is_active is true (for landing pages)
DROP POLICY IF EXISTS public_select_properties ON public.properties;
CREATE POLICY public_select_properties ON public.properties
  FOR SELECT USING (is_active = true);

-- Property Guides: Allow public SELECT if is_active is true
DROP POLICY IF EXISTS public_select_guides ON public.property_guides;
CREATE POLICY public_select_guides ON public.property_guides
  FOR SELECT USING (is_active = true);

-- Apartment Sections, Sections, Places, etc (anything under a guide)
-- These are usually filtered by guide_id in the query.
-- To be safe, we allow public SELECT but restrict write operations to owners.
DROP POLICY IF EXISTS public_select_apartment_sections ON public.apartment_sections;
CREATE POLICY public_select_apartment_sections ON public.apartment_sections
  FOR SELECT USING (true);

DROP POLICY IF EXISTS public_select_guide_sections ON public.guide_sections;
CREATE POLICY public_select_guide_sections ON public.guide_sections
  FOR SELECT USING (true);

DROP POLICY IF EXISTS public_select_guide_places ON public.guide_places;
CREATE POLICY public_select_guide_places ON public.guide_places
  FOR SELECT USING (true);

-- 5. Special Case: Users table
-- A user should be able to SELECT their own record even if user_tenant_id() is not yet working correctly during login
DROP POLICY IF EXISTS user_self_select ON public.users;
CREATE POLICY user_self_select ON public.users
  FOR SELECT USING (id = auth.uid());
