-- Script para crear la tabla apartment_sections
-- Esta tabla almacena las secciones específicas del apartamento con todos los campos necesarios

-- Crear la tabla apartment_sections
CREATE TABLE IF NOT EXISTS public.apartment_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guide_id UUID NOT NULL REFERENCES public.property_guides(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    section_type VARCHAR(50) NOT NULL, -- cocina, bano, salon, dormitorio, terraza, entrada, balcon, garaje
    title VARCHAR(255) NOT NULL,
    description TEXT,
    details TEXT,
    image_url TEXT,
    icon VARCHAR(100),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_apartment_sections_guide_id ON public.apartment_sections(guide_id);
CREATE INDEX IF NOT EXISTS idx_apartment_sections_tenant_id ON public.apartment_sections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_apartment_sections_section_type ON public.apartment_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_apartment_sections_order_index ON public.apartment_sections(order_index);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.apartment_sections ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para aislamiento por tenant
CREATE POLICY "Users can view apartment sections in their tenant" ON public.apartment_sections
    FOR SELECT USING (tenant_id = public.user_tenant_id());

CREATE POLICY "Users can insert apartment sections in their tenant" ON public.apartment_sections
    FOR INSERT WITH CHECK (tenant_id = public.user_tenant_id());

CREATE POLICY "Users can update apartment sections in their tenant" ON public.apartment_sections
    FOR UPDATE USING (tenant_id = public.user_tenant_id());

CREATE POLICY "Users can delete apartment sections in their tenant" ON public.apartment_sections
    FOR DELETE USING (tenant_id = public.user_tenant_id());

-- Crear política para acceso público (solo lectura)
CREATE POLICY "Public can view apartment sections" ON public.apartment_sections
    FOR SELECT USING (true);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_apartment_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_apartment_sections_updated_at
    BEFORE UPDATE ON public.apartment_sections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_apartment_sections_updated_at();

-- Comentarios para documentar la tabla
COMMENT ON TABLE public.apartment_sections IS 'Secciones específicas del apartamento con información detallada';
COMMENT ON COLUMN public.apartment_sections.section_type IS 'Tipo de sección: cocina, bano, salon, dormitorio, terraza, entrada, balcon, garaje';
COMMENT ON COLUMN public.apartment_sections.title IS 'Título de la sección';
COMMENT ON COLUMN public.apartment_sections.description IS 'Descripción general de la sección';
COMMENT ON COLUMN public.apartment_sections.details IS 'Detalles específicos de la sección';
COMMENT ON COLUMN public.apartment_sections.image_url IS 'URL de la imagen de la sección';
COMMENT ON COLUMN public.apartment_sections.icon IS 'Icono FontAwesome para la sección';
COMMENT ON COLUMN public.apartment_sections.order_index IS 'Orden de visualización de la sección';
