-- Script para sincronizar las coordenadas de properties a property_guides
-- Esto copia los valores de latitude y longitude de la tabla properties
-- a la tabla property_guides para que sean accesibles públicamente

UPDATE public.property_guides 
SET 
  latitude = p.latitude,
  longitude = p.longitude,
  updated_at = NOW()
FROM public.properties p
WHERE property_guides.property_id = p.id 
  AND p.latitude IS NOT NULL 
  AND p.longitude IS NOT NULL;

-- Verificar que se actualizaron correctamente
SELECT 
  pg.id as guide_id,
  pg.property_id,
  pg.title as guide_title,
  pg.latitude,
  pg.longitude,
  p.name as property_name,
  p.latitude as original_latitude,
  p.longitude as original_longitude
FROM public.property_guides pg
LEFT JOIN public.properties p ON pg.property_id = p.id
WHERE pg.latitude IS NOT NULL OR pg.longitude IS NOT NULL
ORDER BY pg.updated_at DESC;
