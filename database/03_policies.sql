-- Consolidated RLS Policies

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treasury_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apartment_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuration_types ENABLE ROW LEVEL SECURITY;
-- ... and others

-- 1. Tenant Isolation Policy (Generic Pattern)
-- Note: Replace 'table_name' with actual table names in a loop or specifically

CREATE POLICY tenant_isolation_properties ON public.properties
  FOR ALL USING (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_bookings ON public.bookings
  FOR ALL USING (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_movements ON public.movements
  FOR ALL USING (tenant_id = public.user_tenant_id());

-- 2. Public Access Policies (for Guides)
-- These allow anonymous access to specifically marked public content

CREATE POLICY public_access_guides ON public.property_guides
  FOR SELECT USING (is_active = true);

CREATE POLICY public_access_properties ON public.properties
  FOR SELECT USING (is_active = true);

CREATE POLICY public_access_apartment_sections ON public.apartment_sections
  FOR SELECT USING (true); -- Logic usually filtered by guide selection

-- 3. Storage Policies (Placeholder - usually handled in Supabase Storage UI or separate script)
-- CREATE POLICY "Property Images Access" ON storage.objects ...
