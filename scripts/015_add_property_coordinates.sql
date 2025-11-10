-- Script para agregar campos de coordenadas a la tabla properties
-- Esto permitirá obtener datos meteorológicos precisos para cada propiedad

-- Agregar campos de latitud y longitud
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Agregar comentarios para documentar los campos
COMMENT ON COLUMN public.properties.latitude IS 'Latitud geográfica de la propiedad (formato decimal)';
COMMENT ON COLUMN public.properties.longitude IS 'Longitud geográfica de la propiedad (formato decimal)';

-- Crear índice para mejorar consultas por ubicación
CREATE INDEX IF NOT EXISTS idx_properties_coordinates ON public.properties(latitude, longitude);

-- Agregar constraint para validar rangos válidos de coordenadas
ALTER TABLE public.properties 
ADD CONSTRAINT chk_properties_latitude_range 
CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));

ALTER TABLE public.properties 
ADD CONSTRAINT chk_properties_longitude_range 
CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));
