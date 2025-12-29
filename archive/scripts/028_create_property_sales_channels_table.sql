-- Script para crear la tabla de relación entre propiedades y canales de venta
-- Una propiedad puede tener múltiples canales de venta activos
-- Ejecutar después de 026_create_sales_channels_table.sql

-- Crear tabla property_sales_channels (relación many-to-many)
CREATE TABLE IF NOT EXISTS public.property_sales_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  sales_channel_id UUID NOT NULL REFERENCES public.sales_channels(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraint: una propiedad no puede tener el mismo canal duplicado
  CONSTRAINT property_sales_channels_unique UNIQUE (tenant_id, property_id, sales_channel_id)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_property_sales_channels_tenant ON public.property_sales_channels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_property_sales_channels_property ON public.property_sales_channels(property_id);
CREATE INDEX IF NOT EXISTS idx_property_sales_channels_channel ON public.property_sales_channels(sales_channel_id);
CREATE INDEX IF NOT EXISTS idx_property_sales_channels_active ON public.property_sales_channels(property_id, is_active) WHERE is_active = true;

-- Habilitar RLS
ALTER TABLE public.property_sales_channels ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver property_sales_channels de su tenant
CREATE POLICY "Users can view property_sales_channels of their tenant"
ON public.property_sales_channels
FOR SELECT
USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Política: Los usuarios solo pueden insertar property_sales_channels en su tenant
CREATE POLICY "Users can insert property_sales_channels in their tenant"
ON public.property_sales_channels
FOR INSERT
WITH CHECK (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Política: Los usuarios solo pueden actualizar property_sales_channels de su tenant
CREATE POLICY "Users can update property_sales_channels of their tenant"
ON public.property_sales_channels
FOR UPDATE
USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Política: Los usuarios solo pueden eliminar property_sales_channels de su tenant
CREATE POLICY "Users can delete property_sales_channels of their tenant"
ON public.property_sales_channels
FOR DELETE
USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_property_sales_channels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_property_sales_channels_updated_at ON public.property_sales_channels;
CREATE TRIGGER trigger_update_property_sales_channels_updated_at
BEFORE UPDATE ON public.property_sales_channels
FOR EACH ROW
EXECUTE FUNCTION update_property_sales_channels_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE public.property_sales_channels IS 'Relación many-to-many entre propiedades y canales de venta';
COMMENT ON COLUMN public.property_sales_channels.is_active IS 'Indica si el canal está activo para esta propiedad';

