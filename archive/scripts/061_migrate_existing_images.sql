-- Script para migrar las imágenes existentes de image_url a property_images
-- Marca automáticamente la primera imagen como portada

-- Migrar image_url existente a property_images
INSERT INTO public.property_images (
  property_id,
  tenant_id,
  image_url,
  title,
  is_cover,
  sort_order,
  created_at
)
SELECT 
  id as property_id,
  tenant_id,
  image_url,
  'Imagen principal' as title,
  TRUE as is_cover,
  0 as sort_order,
  created_at
FROM public.properties
WHERE image_url IS NOT NULL
  AND image_url != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.property_images
    WHERE property_images.property_id = properties.id
  );

-- Comentario
COMMENT ON SCRIPT public.061_migrate_existing_images IS 'Migra las imágenes existentes de image_url a la nueva tabla property_images';

