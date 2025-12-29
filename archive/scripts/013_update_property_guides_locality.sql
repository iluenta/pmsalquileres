-- Actualizar property_guides existentes con valores de locality
-- Ejecutar DESPUÉS de agregar la columna locality a property_guides

UPDATE public.property_guides 
SET locality = CASE 
    WHEN title ILIKE '%vera%' THEN 'Vera'
    WHEN title ILIKE '%almería%' OR title ILIKE '%almeria%' THEN 'Almería'
    WHEN title ILIKE '%madrid%' THEN 'Madrid'
    WHEN title ILIKE '%barcelona%' THEN 'Barcelona'
    WHEN title ILIKE '%valencia%' THEN 'Valencia'
    WHEN title ILIKE '%sevilla%' THEN 'Sevilla'
    WHEN title ILIKE '%málaga%' OR title ILIKE '%malaga%' THEN 'Málaga'
    WHEN title ILIKE '%granada%' THEN 'Granada'
    WHEN title ILIKE '%córdoba%' OR title ILIKE '%cordoba%' THEN 'Córdoba'
    WHEN title ILIKE '%cádiz%' OR title ILIKE '%cadiz%' THEN 'Cádiz'
    WHEN title ILIKE '%huelva%' THEN 'Huelva'
    WHEN title ILIKE '%jaén%' OR title ILIKE '%jaen%' THEN 'Jaén'
    ELSE 'Ubicación no especificada'
END
WHERE locality IS NULL;

-- Verificar los resultados
SELECT id, property_id, title, locality 
FROM public.property_guides 
ORDER BY locality;


