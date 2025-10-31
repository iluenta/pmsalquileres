-- Agregar el campo locality a la tabla property_guides
-- Esta es la tabla pública que se usa para las guías

ALTER TABLE public.property_guides 
ADD COLUMN locality VARCHAR(255);

-- Agregar comentario para documentar el campo
COMMENT ON COLUMN public.property_guides.locality IS 'Localidad específica de la propiedad (ej: Vera, Almería)';

-- Crear índice para mejorar las consultas por localidad
CREATE INDEX idx_property_guides_locality ON public.property_guides(locality);

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'property_guides' 
AND column_name = 'locality';

