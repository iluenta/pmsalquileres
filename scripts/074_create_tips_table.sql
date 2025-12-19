-- Script para crear la tabla tips y migrar datos desde guide_sections
-- Este script soluciona el error PGRST205 (Tabla no encontrada)

-- 1. Crear la tabla tips si no existe
CREATE TABLE IF NOT EXISTS public.tips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guide_id UUID NOT NULL REFERENCES public.property_guides(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    details TEXT,
    icon VARCHAR(100) DEFAULT 'Lightbulb',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_tips_guide_id ON public.tips(guide_id);
CREATE INDEX IF NOT EXISTS idx_tips_tenant_id ON public.tips(tenant_id);

-- 3. Habilitar RLS (Seguridad a nivel de fila)
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS (Aislamiento por Tenant y acceso público)
DO $$ 
BEGIN
    -- Política de visualización para usuarios del tenant
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view tips in their tenant') THEN
        CREATE POLICY "Users can view tips in their tenant" ON public.tips
            FOR SELECT USING (tenant_id = public.user_tenant_id());
    END IF;

    -- Política de inserción para usuarios del tenant
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert tips in their tenant') THEN
        CREATE POLICY "Users can insert tips in their tenant" ON public.tips
            FOR INSERT WITH CHECK (tenant_id = public.user_tenant_id());
    END IF;

    -- Política de actualización para usuarios del tenant
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update tips in their tenant') THEN
        CREATE POLICY "Users can update tips in their tenant" ON public.tips
            FOR UPDATE USING (tenant_id = public.user_tenant_id());
    END IF;

    -- Política de eliminación para usuarios del tenant
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete tips in their tenant') THEN
        CREATE POLICY "Users can delete tips in their tenant" ON public.tips
            FOR DELETE USING (tenant_id = public.user_tenant_id());
    END IF;

    -- Política de acceso público (Lectura total para la guía pública)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view tips') THEN
        CREATE POLICY "Public can view tips" ON public.tips
            FOR SELECT USING (true);
    END IF;
END $$;

-- 5. Migrar datos existentes desde guide_sections (tipo 'tips') a la nueva tabla tips
-- Esto asegura que no se pierda la información que ya tenías configurada
INSERT INTO public.tips (id, guide_id, tenant_id, title, description, icon, order_index, created_at, updated_at)
SELECT id, guide_id, tenant_id, title, content, icon, order_index, created_at, updated_at
FROM public.guide_sections
WHERE section_type = 'tips'
ON CONFLICT (id) DO NOTHING;

-- 6. Trigger para updated_at automático
CREATE OR REPLACE FUNCTION public.update_tips_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_tips_updated_at ON public.tips;
CREATE TRIGGER tr_update_tips_updated_at
    BEFORE UPDATE ON public.tips
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tips_updated_at();

-- 7. Comentario documental
COMMENT ON TABLE public.tips IS 'Tabla dedicada para los consejos y recomendaciones de los huéspedes';
