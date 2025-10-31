-- Script para verificar la existencia y datos de la tabla apartment_sections

-- Verificar si la tabla existe
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'apartment_sections'
ORDER BY ordinal_position;

-- Verificar si hay datos en la tabla
SELECT COUNT(*) as total_sections FROM public.apartment_sections;

-- Verificar datos específicos para la guía
SELECT 
    id,
    guide_id,
    section_type,
    title,
    description,
    details,
    image_url,
    icon,
    order_index,
    amenities
FROM public.apartment_sections 
WHERE guide_id = (
    SELECT id FROM public.property_guides 
    WHERE property_id = 'a7c62ad0-d570-4125-b107-02b2403847f8'
)
ORDER BY order_index;

-- Verificar si existe la guía
SELECT 
    id,
    property_id,
    title,
    locality
FROM public.property_guides 
WHERE property_id = 'a7c62ad0-d570-4125-b107-02b2403847f8';

