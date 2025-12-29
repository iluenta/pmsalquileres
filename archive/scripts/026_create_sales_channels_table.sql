-- Script para crear la tabla de canales de venta (sales_channels)
-- Los canales de venta son personas de tipo jurídica (full_name) con información adicional
-- Ejecutar después de 025_add_sales_channel_person_type.sql

-- Crear tabla sales_channels
CREATE TABLE IF NOT EXISTS public.sales_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  logo_url TEXT, -- URL de la imagen del logo en Supabase Storage
  sales_commission DECIMAL(5, 2) NOT NULL DEFAULT 0.00, -- Comisión de venta (porcentaje)
  collection_commission DECIMAL(5, 2) NOT NULL DEFAULT 0.00, -- Comisión de cobro (porcentaje)
  applicable_taxes TEXT, -- JSON o texto con información de impuestos aplicables
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT sales_channels_sales_commission_check CHECK (sales_commission >= 0 AND sales_commission <= 100),
  CONSTRAINT sales_channels_collection_commission_check CHECK (collection_commission >= 0 AND collection_commission <= 100),
  CONSTRAINT sales_channels_unique_person UNIQUE (tenant_id, person_id)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_sales_channels_tenant ON public.sales_channels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sales_channels_person ON public.sales_channels(person_id);
CREATE INDEX IF NOT EXISTS idx_sales_channels_active ON public.sales_channels(tenant_id, is_active) WHERE is_active = true;

-- Habilitar RLS
ALTER TABLE public.sales_channels ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sales_channels de su tenant
CREATE POLICY "Users can view sales_channels of their tenant"
ON public.sales_channels
FOR SELECT
USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Política: Los usuarios solo pueden insertar sales_channels en su tenant
CREATE POLICY "Users can insert sales_channels in their tenant"
ON public.sales_channels
FOR INSERT
WITH CHECK (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Política: Los usuarios solo pueden actualizar sales_channels de su tenant
CREATE POLICY "Users can update sales_channels of their tenant"
ON public.sales_channels
FOR UPDATE
USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Política: Los usuarios solo pueden eliminar sales_channels de su tenant
CREATE POLICY "Users can delete sales_channels of their tenant"
ON public.sales_channels
FOR DELETE
USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_sales_channels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_sales_channels_updated_at ON public.sales_channels;
CREATE TRIGGER trigger_update_sales_channels_updated_at
BEFORE UPDATE ON public.sales_channels
FOR EACH ROW
EXECUTE FUNCTION update_sales_channels_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE public.sales_channels IS 'Canales de venta (Booking, Airbnb, propio, etc.)';
COMMENT ON COLUMN public.sales_channels.person_id IS 'Referencia a la persona (jurídica) que representa el canal';
COMMENT ON COLUMN public.sales_channels.logo_url IS 'URL del logo del canal almacenado en Supabase Storage';
COMMENT ON COLUMN public.sales_channels.sales_commission IS 'Comisión de venta en porcentaje (0-100)';
COMMENT ON COLUMN public.sales_channels.collection_commission IS 'Comisión de cobro en porcentaje (0-100)';
COMMENT ON COLUMN public.sales_channels.applicable_taxes IS 'Información de impuestos aplicables (JSON o texto)';

