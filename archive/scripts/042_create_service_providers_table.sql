-- Script para crear la tabla de proveedores de servicios (service_providers)
-- Los proveedores de servicios son personas de tipo jurídica (full_name) con información adicional
-- Ejecutar después de 040_add_service_provider_person_type.sql

-- Crear tabla service_providers
CREATE TABLE IF NOT EXISTS public.service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  logo_url TEXT, -- URL de la imagen del logo en Supabase Storage
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT service_providers_unique_person UNIQUE (tenant_id, person_id)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_service_providers_tenant ON public.service_providers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_person ON public.service_providers(person_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_active ON public.service_providers(tenant_id, is_active) WHERE is_active = true;

-- Habilitar RLS
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver service_providers de su tenant
CREATE POLICY "Users can view service_providers of their tenant"
ON public.service_providers
FOR SELECT
USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Política: Los usuarios solo pueden insertar service_providers en su tenant
CREATE POLICY "Users can insert service_providers in their tenant"
ON public.service_providers
FOR INSERT
WITH CHECK (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Política: Los usuarios solo pueden actualizar service_providers de su tenant
CREATE POLICY "Users can update service_providers of their tenant"
ON public.service_providers
FOR UPDATE
USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Política: Los usuarios solo pueden eliminar service_providers de su tenant
CREATE POLICY "Users can delete service_providers of their tenant"
ON public.service_providers
FOR DELETE
USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_service_providers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_service_providers_updated_at ON public.service_providers;
CREATE TRIGGER trigger_update_service_providers_updated_at
BEFORE UPDATE ON public.service_providers
FOR EACH ROW
EXECUTE FUNCTION update_service_providers_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE public.service_providers IS 'Proveedores de servicios externos (limpieza, mantenimiento, jardinería, piscina, etc.)';
COMMENT ON COLUMN public.service_providers.person_id IS 'Referencia a la persona (jurídica) que representa el proveedor';
COMMENT ON COLUMN public.service_providers.logo_url IS 'URL del logo del proveedor almacenado en Supabase Storage';

