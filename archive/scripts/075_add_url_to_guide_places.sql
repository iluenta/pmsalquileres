-- Script para agregar campos faltantes a la tabla guide_places
-- Estos campos son necesarios para restaurantes, playas y actividades
-- Ejecutar en Supabase SQL Editor

-- Agregar campo price_range (rango de precios: €, €€, €€€, €€€€)
ALTER TABLE public.guide_places 
ADD COLUMN IF NOT EXISTS price_range VARCHAR(10);

COMMENT ON COLUMN public.guide_places.price_range IS 'Rango de precios del lugar (€, €€, €€€, €€€€)';

-- Agregar campo review_count (número de reseñas)
ALTER TABLE public.guide_places 
ADD COLUMN IF NOT EXISTS review_count INTEGER;

COMMENT ON COLUMN public.guide_places.review_count IS 'Número de reseñas del lugar';

-- Agregar campo cuisine_type (tipo de cocina para restaurantes)
ALTER TABLE public.guide_places 
ADD COLUMN IF NOT EXISTS cuisine_type VARCHAR(100);

COMMENT ON COLUMN public.guide_places.cuisine_type IS 'Tipo de cocina del restaurante';

-- Agregar campo badge (badge o etiqueta especial)
ALTER TABLE public.guide_places 
ADD COLUMN IF NOT EXISTS badge VARCHAR(100);

COMMENT ON COLUMN public.guide_places.badge IS 'Badge o etiqueta especial del lugar (ej: Recomendado, Muy bueno)';

-- Agregar campo url (URL del lugar: Google Maps o sitio web)
ALTER TABLE public.guide_places 
ADD COLUMN IF NOT EXISTS url TEXT;

COMMENT ON COLUMN public.guide_places.url IS 'URL del lugar (Google Maps o sitio web del restaurante)';

-- Verificar que todas las columnas se agregaron correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'guide_places' 
    AND column_name IN ('price_range', 'review_count', 'cuisine_type', 'badge', 'url')
ORDER BY column_name;

