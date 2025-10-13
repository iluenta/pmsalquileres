-- Habilitar Row Level Security (RLS) en todas las tablas
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuration_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuration_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_contact_infos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_fiscal_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Función helper para obtener el tenant_id del usuario actual
CREATE OR REPLACE FUNCTION public.user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Políticas RLS para tenants (solo lectura del propio tenant)
CREATE POLICY "Users can view their own tenant"
  ON public.tenants FOR SELECT
  USING (id = public.user_tenant_id());

-- Políticas RLS para users
CREATE POLICY "Users can view users in their tenant"
  ON public.users FOR SELECT
  USING (tenant_id = public.user_tenant_id());

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (id = auth.uid());

-- Políticas RLS para user_settings
CREATE POLICY "Users can manage their own settings"
  ON public.user_settings FOR ALL
  USING (user_id = auth.uid());

-- Políticas RLS para configuration_types
CREATE POLICY "Users can view configuration types in their tenant"
  ON public.configuration_types FOR SELECT
  USING (tenant_id = public.user_tenant_id());

CREATE POLICY "Users can manage configuration types in their tenant"
  ON public.configuration_types FOR ALL
  USING (tenant_id = public.user_tenant_id());

-- Políticas RLS para configuration_values
CREATE POLICY "Users can view configuration values"
  ON public.configuration_values FOR SELECT
  USING (
    configuration_type_id IN (
      SELECT id FROM public.configuration_types 
      WHERE tenant_id = public.user_tenant_id()
    )
  );

CREATE POLICY "Users can manage configuration values"
  ON public.configuration_values FOR ALL
  USING (
    configuration_type_id IN (
      SELECT id FROM public.configuration_types 
      WHERE tenant_id = public.user_tenant_id()
    )
  );

-- Políticas RLS para persons
CREATE POLICY "Users can view persons in their tenant"
  ON public.persons FOR SELECT
  USING (tenant_id = public.user_tenant_id());

CREATE POLICY "Users can manage persons in their tenant"
  ON public.persons FOR ALL
  USING (tenant_id = public.user_tenant_id());

-- Políticas RLS para person_contact_infos
CREATE POLICY "Users can view contact infos in their tenant"
  ON public.person_contact_infos FOR SELECT
  USING (tenant_id = public.user_tenant_id());

CREATE POLICY "Users can manage contact infos in their tenant"
  ON public.person_contact_infos FOR ALL
  USING (tenant_id = public.user_tenant_id());

-- Políticas RLS para person_fiscal_addresses
CREATE POLICY "Users can view fiscal addresses in their tenant"
  ON public.person_fiscal_addresses FOR SELECT
  USING (tenant_id = public.user_tenant_id());

CREATE POLICY "Users can manage fiscal addresses in their tenant"
  ON public.person_fiscal_addresses FOR ALL
  USING (tenant_id = public.user_tenant_id());

-- Políticas RLS para properties
CREATE POLICY "Users can view properties in their tenant"
  ON public.properties FOR SELECT
  USING (tenant_id = public.user_tenant_id());

CREATE POLICY "Users can manage properties in their tenant"
  ON public.properties FOR ALL
  USING (tenant_id = public.user_tenant_id());

-- Políticas RLS para property_amenities
CREATE POLICY "Users can view amenities in their tenant"
  ON public.property_amenities FOR SELECT
  USING (tenant_id = public.user_tenant_id());

CREATE POLICY "Users can manage amenities in their tenant"
  ON public.property_amenities FOR ALL
  USING (tenant_id = public.user_tenant_id());

-- Políticas RLS para property_images
CREATE POLICY "Users can view images in their tenant"
  ON public.property_images FOR SELECT
  USING (tenant_id = public.user_tenant_id());

CREATE POLICY "Users can manage images in their tenant"
  ON public.property_images FOR ALL
  USING (tenant_id = public.user_tenant_id());

-- Políticas RLS para bookings
CREATE POLICY "Users can view bookings in their tenant"
  ON public.bookings FOR SELECT
  USING (tenant_id = public.user_tenant_id());

CREATE POLICY "Users can manage bookings in their tenant"
  ON public.bookings FOR ALL
  USING (tenant_id = public.user_tenant_id());

-- Políticas RLS para payments
CREATE POLICY "Users can view payments in their tenant"
  ON public.payments FOR SELECT
  USING (tenant_id = public.user_tenant_id());

CREATE POLICY "Users can manage payments in their tenant"
  ON public.payments FOR ALL
  USING (tenant_id = public.user_tenant_id());
