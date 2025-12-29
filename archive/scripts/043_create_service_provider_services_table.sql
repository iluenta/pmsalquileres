-- Script para crear la tabla de servicios de proveedores (service_provider_services)
-- Relaciona proveedores con tipos de servicio, precios e impuestos
-- Ejecutar después de 041_create_service_type_config.sql y 042_create_service_providers_table.sql

-- Crear tabla service_provider_services
CREATE TABLE IF NOT EXISTS public.service_provider_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  service_type_id UUID NOT NULL REFERENCES public.configuration_values(id) ON DELETE CASCADE,
  price_type VARCHAR(20) NOT NULL DEFAULT 'fixed', -- 'fixed' o 'percentage'
  price DECIMAL(10, 2) NOT NULL, -- Precio fijo o porcentaje según price_type
  apply_tax BOOLEAN NOT NULL DEFAULT false, -- Indica si se aplica IVA sobre el precio
  tax_type_id UUID REFERENCES public.configuration_values(id) ON DELETE SET NULL, -- Referencia al tipo de impuesto
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT service_provider_services_price_type_check CHECK (price_type IN ('fixed', 'percentage')),
  CONSTRAINT service_provider_services_price_check CHECK (price >= 0),
  CONSTRAINT service_provider_services_percentage_check CHECK (
    (price_type = 'percentage' AND price >= 0 AND price <= 100) OR 
    price_type = 'fixed'
  ),
  CONSTRAINT service_provider_services_unique UNIQUE (service_provider_id, service_type_id)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_service_provider_services_provider ON public.service_provider_services(service_provider_id);
CREATE INDEX IF NOT EXISTS idx_service_provider_services_type ON public.service_provider_services(service_type_id);
CREATE INDEX IF NOT EXISTS idx_service_provider_services_tax_type ON public.service_provider_services(tax_type_id);
CREATE INDEX IF NOT EXISTS idx_service_provider_services_active ON public.service_provider_services(service_provider_id, is_active) WHERE is_active = true;

-- Habilitar RLS
ALTER TABLE public.service_provider_services ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver service_provider_services de su tenant
CREATE POLICY "Users can view service_provider_services of their tenant"
ON public.service_provider_services
FOR SELECT
USING (
  service_provider_id IN (
    SELECT id FROM public.service_providers 
    WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  )
);

-- Política: Los usuarios solo pueden insertar service_provider_services en su tenant
CREATE POLICY "Users can insert service_provider_services in their tenant"
ON public.service_provider_services
FOR INSERT
WITH CHECK (
  service_provider_id IN (
    SELECT id FROM public.service_providers 
    WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  )
);

-- Política: Los usuarios solo pueden actualizar service_provider_services de su tenant
CREATE POLICY "Users can update service_provider_services of their tenant"
ON public.service_provider_services
FOR UPDATE
USING (
  service_provider_id IN (
    SELECT id FROM public.service_providers 
    WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  )
);

-- Política: Los usuarios solo pueden eliminar service_provider_services de su tenant
CREATE POLICY "Users can delete service_provider_services of their tenant"
ON public.service_provider_services
FOR DELETE
USING (
  service_provider_id IN (
    SELECT id FROM public.service_providers 
    WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  )
);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_service_provider_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_service_provider_services_updated_at ON public.service_provider_services;
CREATE TRIGGER trigger_update_service_provider_services_updated_at
BEFORE UPDATE ON public.service_provider_services
FOR EACH ROW
EXECUTE FUNCTION update_service_provider_services_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE public.service_provider_services IS 'Servicios ofrecidos por cada proveedor con sus precios e impuestos';
COMMENT ON COLUMN public.service_provider_services.service_provider_id IS 'Referencia al proveedor de servicios';
COMMENT ON COLUMN public.service_provider_services.service_type_id IS 'Referencia al tipo de servicio (configuration_value)';
COMMENT ON COLUMN public.service_provider_services.price_type IS 'Tipo de precio: fixed (precio fijo) o percentage (porcentaje sobre el total de la reserva)';
COMMENT ON COLUMN public.service_provider_services.price IS 'Precio fijo en euros o porcentaje (0-100) según price_type';
COMMENT ON COLUMN public.service_provider_services.apply_tax IS 'Indica si se aplica IVA sobre el precio';
COMMENT ON COLUMN public.service_provider_services.tax_type_id IS 'Referencia al tipo de impuesto (configuration_value) que se aplica';

