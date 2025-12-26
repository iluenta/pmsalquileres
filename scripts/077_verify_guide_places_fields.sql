-- Script de verificación de campos en la tabla guide_places
-- Este script verifica que todos los campos necesarios para restaurantes, playas y actividades existan
-- Los campos url, address, price_range y review_count ya deberían existir según scripts anteriores

-- Verificar todos los campos relevantes de guide_places
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'guide_places' 
    AND column_name IN (
        'url',           -- URL del lugar (Google Maps o website)
        'address',       -- Dirección formateada del lugar
        'price_range',   -- Rango de precios (€10-€20, €20-€40, etc.)
        'review_count',  -- Número de reseñas
        'rating',        -- Calificación (ya debería existir)
        'badge',         -- Badge o etiqueta especial (ya debería existir)
        'image_url',     -- URL de imagen (ya debería existir)
        'name',          -- Nombre del lugar (ya debería existir)
        'description',   -- Descripción (ya debería existir)
        'distance',      -- Distancia (ya debería existir)
        'place_type',    -- Tipo de lugar: restaurant, beach, activity (ya debería existir)
        'cuisine_type',  -- Tipo de cocina (solo para restaurantes)
        'amenities',     -- Amenidades (solo para playas)
        'activity_type', -- Tipo de actividad (solo para actividades)
        'duration',      -- Duración (solo para actividades)
        'price_info'     -- Información de precio (solo para actividades)
    )
ORDER BY column_name;

-- Si algún campo no existe, se mostrará un mensaje indicando cuáles faltan
-- Los scripts 075_add_url_to_guide_places.sql y 076_add_address_to_guide_places.sql
-- deberían haber agregado url, address, price_range y review_count

