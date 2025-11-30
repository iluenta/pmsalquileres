-- Script para crear la tabla property_highlights
-- Permite gestionar highlights/features personalizables de propiedades
-- Reemplaza los highlights hardcoded en la landing

CREATE TABLE IF NOT EXISTS public.property_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL, -- Ej: "WiFi de Alta Velocidad"
  description TEXT NOT NULL, -- Ej: "Conexión rápida y estable"
  icon VARCHAR(100) NOT NULL, -- Nombre de icono de lucide-react (ej: "Wifi", "Tv", "Wind")
  sort_order INTEGER NOT NULL DEFAULT 0, -- Orden de visualización
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_property_highlights_property_id ON public.property_highlights(property_id);
CREATE INDEX IF NOT EXISTS idx_property_highlights_tenant_id ON public.property_highlights(tenant_id);
CREATE INDEX IF NOT EXISTS idx_property_highlights_sort_order ON public.property_highlights(property_id, sort_order);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_property_highlights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_property_highlights_updated_at
  BEFORE UPDATE ON public.property_highlights
  FOR EACH ROW
  EXECUTE FUNCTION update_property_highlights_updated_at();

-- RLS Policies
ALTER TABLE public.property_highlights ENABLE ROW LEVEL SECURITY;

-- Policy: Lectura pública de highlights
CREATE POLICY "Public can view highlights"
  ON public.property_highlights
  FOR SELECT
  USING (true);

-- Policy: Usuarios autenticados del tenant pueden gestionar highlights
CREATE POLICY "Tenant users can manage highlights"
  ON public.property_highlights
  FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  )
  WITH CHECK (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- Comentarios para documentación
COMMENT ON TABLE public.property_highlights IS 'Highlights/features personalizables de propiedades para mostrar en landing y guía.';
COMMENT ON COLUMN public.property_highlights.title IS 'Título del highlight (ej: "WiFi de Alta Velocidad")';
COMMENT ON COLUMN public.property_highlights.description IS 'Descripción del highlight (ej: "Conexión rápida y estable")';
COMMENT ON COLUMN public.property_highlights.icon IS 'Nombre del icono de lucide-react (ej: "Wifi", "Tv", "Wind", "Utensils", "Coffee", "Shield")';
COMMENT ON COLUMN public.property_highlights.sort_order IS 'Orden de visualización en la landing (menor número = primero)';

