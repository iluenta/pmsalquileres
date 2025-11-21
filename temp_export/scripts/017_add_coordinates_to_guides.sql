-- Script para agregar campos de coordenadas a la tabla property_guides
-- Esto permitirá que las coordenadas sean accesibles públicamente a través de la guía
-- sin necesidad de políticas RLS en la tabla properties.

ALTER TABLE public.property_guides
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

COMMENT ON COLUMN public.property_guides.latitude IS 'Latitud geográfica de la propiedad asociada a esta guía (formato decimal)';
COMMENT ON COLUMN public.property_guides.longitude IS 'Longitud geográfica de la propiedad asociada a esta guía (formato decimal)';

-- Opcional: Agregar constraint para validar rangos válidos de coordenadas
ALTER TABLE public.property_guides
ADD CONSTRAINT chk_property_guides_latitude_range
CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));

ALTER TABLE public.property_guides
ADD CONSTRAINT chk_property_guides_longitude_range
CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));

-- Opcional: Crear índice para mejorar consultas por ubicación si fuera necesario
-- CREATE INDEX IF NOT EXISTS idx_property_guides_coordinates ON public.property_guides(latitude, longitude);
