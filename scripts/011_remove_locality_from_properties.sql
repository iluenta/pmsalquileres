-- Eliminar el campo locality de la tabla properties
-- Este campo debe estar en property_guides en su lugar

ALTER TABLE public.properties 
DROP COLUMN IF EXISTS locality;

-- Eliminar el índice también
DROP INDEX IF EXISTS idx_properties_locality;

