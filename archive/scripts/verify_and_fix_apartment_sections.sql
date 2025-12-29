-- Script adicional para verificar y corregir datos de apartment_sections

-- 1. Verificar si hay datos en apartment_sections para la guía específica
SELECT 
    'Verificando datos de apartment_sections' as check_type,
    COUNT(*) as total_sections
FROM public.apartment_sections 
WHERE guide_id = (
    SELECT id FROM public.property_guides 
    WHERE property_id = 'a7c62ad0-d570-4125-b107-02b2403847f8'
);

-- 2. Verificar el estado actual de amenities
SELECT 
    'Estado actual de amenities' as check_type,
    section_type,
    title,
    CASE 
        WHEN amenities IS NULL THEN 'NULL'
        WHEN array_length(amenities, 1) IS NULL THEN 'ARRAY_VACIO'
        ELSE 'CON_DATOS'
    END as amenities_status,
    amenities
FROM public.apartment_sections 
WHERE guide_id = (
    SELECT id FROM public.property_guides 
    WHERE property_id = 'a7c62ad0-d570-4125-b107-02b2403847f8'
)
ORDER BY order_index;

-- 3. Si no hay datos, crear una sección de ejemplo
INSERT INTO public.apartment_sections (
    guide_id,
    tenant_id,
    section_type,
    title,
    description,
    details,
    image_url,
    icon,
    amenities,
    order_index
)
SELECT 
    pg.id as guide_id,
    pg.tenant_id,
    'cocina' as section_type,
    'Cocina Equipada' as title,
    'Una cocina completamente equipada con todos los electrodomésticos necesarios' as description,
    'Vitrocerámica, horno, microondas, nevera, lavavajillas y todos los utensilios necesarios' as details,
    'https://www.ikea.com/ext/ingkadam/m/7a2d848a8bb5d23f/original/PH204335.jpg?f=xl' as image_url,
    'fas fa-utensils' as icon,
    ARRAY[
        'Vitrocerámica',
        'Horno',
        'Microondas', 
        'Nevera',
        'Lavavajillas',
        'Cafetera',
        'Tostadora',
        'Utensilios de cocina',
        'Vajilla completa',
        'Cristalería'
    ] as amenities,
    1 as order_index
FROM public.property_guides pg
WHERE pg.property_id = 'a7c62ad0-d570-4125-b107-02b2403847f8'
AND NOT EXISTS (
    SELECT 1 FROM public.apartment_sections ap 
    WHERE ap.guide_id = pg.id
);

-- 4. Verificar que Font Awesome esté disponible (esto se hace en el frontend)
-- Por ahora, vamos a asegurar que los iconos tengan el formato correcto
UPDATE public.apartment_sections 
SET icon = 'fas fa-utensils'
WHERE guide_id = (
    SELECT id FROM public.property_guides 
    WHERE property_id = 'a7c62ad0-d570-4125-b107-02b2403847f8'
)
AND section_type = 'cocina'
AND (icon IS NULL OR icon = '');

-- 5. Verificar datos finales
SELECT 
    'Datos finales' as check_type,
    section_type,
    title,
    icon,
    array_length(amenities, 1) as amenities_count,
    amenities
FROM public.apartment_sections 
WHERE guide_id = (
    SELECT id FROM public.property_guides 
    WHERE property_id = 'a7c62ad0-d570-4125-b107-02b2403847f8'
)
ORDER BY order_index;

