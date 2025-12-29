-- Script para actualizar propiedades existentes con valores de locality
-- Ejecutar DESPUÉS de agregar la columna locality

-- Actualizar propiedades existentes con valores basados en la ciudad
UPDATE public.properties 
SET locality = CASE 
    WHEN city ILIKE '%vera%' THEN 'Vera'
    WHEN city ILIKE '%almería%' OR city ILIKE '%almeria%' THEN 'Almería'
    WHEN city ILIKE '%madrid%' THEN 'Madrid'
    WHEN city ILIKE '%barcelona%' THEN 'Barcelona'
    WHEN city ILIKE '%valencia%' THEN 'Valencia'
    WHEN city ILIKE '%sevilla%' THEN 'Sevilla'
    WHEN city ILIKE '%málaga%' OR city ILIKE '%malaga%' THEN 'Málaga'
    WHEN city ILIKE '%granada%' THEN 'Granada'
    WHEN city ILIKE '%córdoba%' OR city ILIKE '%cordoba%' THEN 'Córdoba'
    WHEN city ILIKE '%cádiz%' OR city ILIKE '%cadiz%' THEN 'Cádiz'
    WHEN city ILIKE '%huelva%' THEN 'Huelva'
    WHEN city ILIKE '%jaén%' OR city ILIKE '%jaen%' THEN 'Jaén'
    ELSE COALESCE(city, 'Ubicación no especificada')
END
WHERE locality IS NULL;

-- Verificar los resultados
SELECT id, name, city, locality 
FROM public.properties 
ORDER BY locality;
