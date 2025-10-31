-- Script para rellenar el campo amenities en apartment_sections
-- y verificar que se estén obteniendo correctamente

-- 1. Verificar la estructura actual de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'apartment_sections'
ORDER BY ordinal_position;

-- 2. Verificar datos actuales
SELECT 
    id,
    guide_id,
    section_type,
    title,
    description,
    details,
    image_url,
    icon,
    amenities,
    order_index
FROM public.apartment_sections 
WHERE guide_id = (
    SELECT id FROM public.property_guides 
    WHERE property_id = 'a7c62ad0-d570-4125-b107-02b2403847f8'
)
ORDER BY order_index;

-- 3. Actualizar amenities para la sección de cocina
UPDATE public.apartment_sections 
SET amenities = ARRAY[
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
]
WHERE guide_id = (
    SELECT id FROM public.property_guides 
    WHERE property_id = 'a7c62ad0-d570-4125-b107-02b2403847f8'
)
AND section_type = 'cocina';

-- 4. Si existe una sección de baño, actualizar sus amenities también
UPDATE public.apartment_sections 
SET amenities = ARRAY[
    'Ducha',
    'Bañera',
    'Lavabo',
    'Inodoro',
    'Espejo',
    'Secador de pelo',
    'Toallas',
    'Productos de baño',
    'Calefacción',
    'Ventilación'
]
WHERE guide_id = (
    SELECT id FROM public.property_guides 
    WHERE property_id = 'a7c62ad0-d570-4125-b107-02b2403847f8'
)
AND section_type = 'bano';

-- 5. Si existe una sección de salón, actualizar sus amenities también
UPDATE public.apartment_sections 
SET amenities = ARRAY[
    'Sofá',
    'Televisión',
    'Mesa de centro',
    'Lámparas',
    'Calefacción',
    'Aire acondicionado',
    'WiFi',
    'Decoración',
    'Cortinas',
    'Alfombra'
]
WHERE guide_id = (
    SELECT id FROM public.property_guides 
    WHERE property_id = 'a7c62ad0-d570-4125-b107-02b2403847f8'
)
AND section_type = 'salon';

-- 6. Verificar los datos actualizados
SELECT 
    id,
    section_type,
    title,
    amenities,
    array_length(amenities, 1) as amenities_count
FROM public.apartment_sections 
WHERE guide_id = (
    SELECT id FROM public.property_guides 
    WHERE property_id = 'a7c62ad0-d570-4125-b107-02b2403847f8'
)
ORDER BY order_index;

-- 7. Verificar que el campo amenities no sea NULL
SELECT 
    COUNT(*) as total_sections,
    COUNT(amenities) as sections_with_amenities,
    COUNT(*) - COUNT(amenities) as sections_without_amenities
FROM public.apartment_sections 
WHERE guide_id = (
    SELECT id FROM public.property_guides 
    WHERE property_id = 'a7c62ad0-d570-4125-b107-02b2403847f8'
);

