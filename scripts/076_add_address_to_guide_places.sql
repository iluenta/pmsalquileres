-- Script para agregar el campo 'address' a la tabla 'guide_places'
-- Este campo almacenará la dirección del lugar (restaurante, playa, actividad, etc.)

-- Agregar el campo address a la tabla guide_places
ALTER TABLE public.guide_places
ADD COLUMN IF NOT EXISTS address TEXT;

-- Agregar comentario para documentar el campo
COMMENT ON COLUMN public.guide_places.address IS 'Dirección formateada del lugar (restaurante, playa, actividad, etc.)';

-- Verificar que la columna se agregó correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'guide_places' 
    AND column_name = 'address';

