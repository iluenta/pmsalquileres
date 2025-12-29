-- Script para migrar datos de guide_sections a apartment_sections
-- Este script toma las secciones de tipo 'apartment' de guide_sections y las migra a apartment_sections

-- Insertar datos de guide_sections (section_type = 'apartment') a apartment_sections
INSERT INTO public.apartment_sections (
    guide_id,
    tenant_id,
    section_type,
    title,
    description,
    details,
    image_url,
    icon,
    order_index,
    created_at,
    updated_at
)
SELECT 
    guide_id,
    tenant_id,
    CASE 
        WHEN LOWER(title) LIKE '%cocina%' OR LOWER(icon) LIKE '%utensils%' THEN 'cocina'
        WHEN LOWER(title) LIKE '%baño%' OR LOWER(title) LIKE '%bano%' OR LOWER(icon) LIKE '%shower%' THEN 'bano'
        WHEN LOWER(title) LIKE '%salón%' OR LOWER(title) LIKE '%salon%' OR LOWER(icon) LIKE '%couch%' THEN 'salon'
        WHEN LOWER(title) LIKE '%dormitorio%' OR LOWER(icon) LIKE '%bed%' THEN 'dormitorio'
        WHEN LOWER(title) LIKE '%terraza%' OR LOWER(icon) LIKE '%sun%' THEN 'terraza'
        WHEN LOWER(title) LIKE '%entrada%' OR LOWER(icon) LIKE '%door%' THEN 'entrada'
        WHEN LOWER(title) LIKE '%balcón%' OR LOWER(title) LIKE '%balcon%' OR LOWER(icon) LIKE '%wind%' THEN 'balcon'
        WHEN LOWER(title) LIKE '%garaje%' OR LOWER(icon) LIKE '%car%' THEN 'garaje'
        ELSE 'cocina' -- Valor por defecto
    END as section_type,
    title,
    content as description,
    '' as details, -- No disponible en guide_sections
    '' as image_url, -- No disponible en guide_sections
    icon,
    order_index,
    created_at,
    updated_at
FROM public.guide_sections 
WHERE section_type = 'apartment'
ON CONFLICT DO NOTHING; -- Evitar duplicados si se ejecuta múltiples veces

-- Verificar la migración
SELECT 
    'Migración completada' as status,
    COUNT(*) as total_sections_migrated
FROM public.apartment_sections;

-- Mostrar las secciones migradas
SELECT 
    section_type,
    title,
    icon,
    order_index
FROM public.apartment_sections 
ORDER BY order_index;
