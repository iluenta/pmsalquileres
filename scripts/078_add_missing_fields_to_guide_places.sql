-- Script para agregar campos faltantes a la tabla guide_places
-- Estos campos son necesarios para actividades y playas
-- Ejecutar en Supabase SQL Editor

-- Agregar campo activity_type (tipo de actividad: turismo, deporte, etc.)
ALTER TABLE public.guide_places 
ADD COLUMN IF NOT EXISTS activity_type VARCHAR(100);

COMMENT ON COLUMN public.guide_places.activity_type IS 'Tipo de actividad (solo para actividades)';

-- Agregar campo duration (duración de la actividad)
ALTER TABLE public.guide_places 
ADD COLUMN IF NOT EXISTS duration VARCHAR(100);

COMMENT ON COLUMN public.guide_places.duration IS 'Duración de la actividad (ej: 2 horas, medio día)';

-- Agregar campo price_info (información de precio para actividades)
ALTER TABLE public.guide_places 
ADD COLUMN IF NOT EXISTS price_info VARCHAR(200);

COMMENT ON COLUMN public.guide_places.price_info IS 'Información de precio (solo para actividades, ej: Desde 15€ por persona)';

-- Agregar campo amenities (amenidades para playas)
ALTER TABLE public.guide_places 
ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.guide_places.amenities IS 'Array de amenidades de la playa (ej: Chiringuito, Parking, Acceso para discapacitados)';

-- Verificar que todas las columnas se agregaron correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'guide_places' 
    AND column_name IN ('activity_type', 'duration', 'price_info', 'amenities')
ORDER BY column_name;

