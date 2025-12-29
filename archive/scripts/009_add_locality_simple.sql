-- Script simple para agregar el campo 'locality' a la tabla properties
-- Ejecutar este script en Supabase SQL Editor

-- Agregar la columna locality a la tabla properties
ALTER TABLE public.properties 
ADD COLUMN locality VARCHAR(255);

-- Agregar comentario para documentar el campo
COMMENT ON COLUMN public.properties.locality IS 'Localidad específica de la propiedad (ej: Vera, Almería)';

-- Crear índice para mejorar las consultas por localidad
CREATE INDEX idx_properties_locality ON public.properties(locality);

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name = 'locality';
