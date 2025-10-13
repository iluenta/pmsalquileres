-- =====================================================
-- MIGRACIÓN: Agregar columnas icon y color a configuration_types
-- =====================================================

-- Agregar columna icon a la tabla configuration_types
ALTER TABLE public.configuration_types
ADD COLUMN IF NOT EXISTS icon VARCHAR(50);

-- Agregar columna color a la tabla configuration_types
ALTER TABLE public.configuration_types
ADD COLUMN IF NOT EXISTS color VARCHAR(50);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN public.configuration_types.icon IS 'Icono emoji para representar el tipo de configuración';
COMMENT ON COLUMN public.configuration_types.color IS 'Color hexadecimal para representar el tipo de configuración';

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✓ Columnas icon y color agregadas a la tabla configuration_types';
    RAISE NOTICE '✓ Ahora puedes usar iconos y colores en los tipos de configuración';
END $$;
