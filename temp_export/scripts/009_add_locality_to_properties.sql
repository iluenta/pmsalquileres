-- Script para agregar el campo 'locality' a la tabla properties
-- Este campo almacenará la localidad específica de la propiedad (ej: "Vera", "Almería")

-- Agregar la columna locality a la tabla properties
ALTER TABLE public.properties 
ADD COLUMN locality VARCHAR(255);

-- Agregar comentario para documentar el campo
COMMENT ON COLUMN public.properties.locality IS 'Localidad específica de la propiedad (ej: Vera, Almería)';

-- Crear índice para mejorar las consultas por localidad
CREATE INDEX idx_properties_locality ON public.properties(locality);

-- Actualizar propiedades existentes con valores de ejemplo
-- Esto es opcional y se puede personalizar según las propiedades reales
UPDATE public.properties 
SET locality = CASE 
    WHEN city ILIKE '%vera%' THEN 'Vera'
    WHEN city ILIKE '%almería%' OR city ILIKE '%almeria%' THEN 'Almería'
    WHEN city ILIKE '%madrid%' THEN 'Madrid'
    WHEN city ILIKE '%barcelona%' THEN 'Barcelona'
    WHEN city ILIKE '%valencia%' THEN 'Valencia'
    WHEN city ILIKE '%sevilla%' THEN 'Sevilla'
    ELSE COALESCE(city, 'Ubicación no especificada')
END
WHERE locality IS NULL;

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name = 'locality';
