-- Script completo para limpiar y configurar correctamente las coordenadas
-- Este script elimina todo lo anterior y configura la situación final correcta

-- ============================================================================
-- PASO 1: LIMPIAR CONSTRAINTS Y CAMPOS EXISTENTES
-- ============================================================================

-- Eliminar constraints existentes si existen
ALTER TABLE public.property_guides DROP CONSTRAINT IF EXISTS chk_property_guides_latitude_range;
ALTER TABLE public.property_guides DROP CONSTRAINT IF EXISTS chk_property_guides_longitude_range;

-- Eliminar campos de coordenadas de property_guides si existen
ALTER TABLE public.property_guides DROP COLUMN IF EXISTS latitude;
ALTER TABLE public.property_guides DROP COLUMN IF EXISTS longitude;

-- Eliminar campos de coordenadas de properties si existen (ya no son necesarios)
ALTER TABLE public.properties DROP COLUMN IF EXISTS latitude;
ALTER TABLE public.properties DROP COLUMN IF EXISTS longitude;

-- Eliminar constraints de properties si existen
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS chk_properties_latitude_range;
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS chk_properties_longitude_range;

-- Eliminar índices si existen
DROP INDEX IF EXISTS idx_properties_coordinates;
DROP INDEX IF EXISTS idx_property_guides_coordinates;

-- Eliminar triggers si existen
DROP TRIGGER IF EXISTS trigger_copy_coordinates_after_insert ON public.property_guides;
DROP TRIGGER IF EXISTS trigger_copy_coordinates_after_property_update ON public.properties;
DROP FUNCTION IF EXISTS copy_property_coordinates_to_guide();

-- ============================================================================
-- PASO 2: CONFIGURAR LA SITUACIÓN FINAL CORRECTA
-- ============================================================================

-- Agregar campos de coordenadas SOLO a property_guides (tabla pública)
ALTER TABLE public.property_guides
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Agregar comentarios para documentar los campos
COMMENT ON COLUMN public.property_guides.latitude IS 'Latitud geográfica de la propiedad para mostrar datos meteorológicos (formato decimal)';
COMMENT ON COLUMN public.property_guides.longitude IS 'Longitud geográfica de la propiedad para mostrar datos meteorológicos (formato decimal)';

-- Agregar constraints para validar rangos válidos de coordenadas
ALTER TABLE public.property_guides
ADD CONSTRAINT chk_property_guides_latitude_range
CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));

ALTER TABLE public.property_guides
ADD CONSTRAINT chk_property_guides_longitude_range
CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));

-- ============================================================================
-- PASO 3: INSERTAR COORDENADAS DE PRUEBA (OPCIONAL)
-- ============================================================================

-- Insertar coordenadas de ejemplo para la propiedad que sabemos que tiene guía
-- Usando las coordenadas de Vera, Almería como ejemplo
UPDATE public.property_guides 
SET 
  latitude = 37.2434,
  longitude = -1.8591,
  updated_at = NOW()
WHERE property_id = 'a7c62ad0-d570-4125-b107-02b2403847f8'
  AND (latitude IS NULL OR longitude IS NULL);

-- ============================================================================
-- PASO 4: VERIFICACIÓN FINAL
-- ============================================================================

-- Verificar la estructura final
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'property_guides' 
  AND table_schema = 'public'
  AND column_name IN ('latitude', 'longitude')
ORDER BY column_name;

-- Verificar que las coordenadas se insertaron correctamente
SELECT 
  id,
  property_id,
  title,
  latitude,
  longitude,
  updated_at
FROM public.property_guides 
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL
ORDER BY updated_at DESC;

-- Mostrar resumen de la configuración
SELECT 
  'property_guides' as tabla,
  'latitude, longitude' as campos_coordenadas,
  'SÍ (pública)' as es_publica
UNION ALL
SELECT 
  'properties' as tabla,
  'NINGUNO' as campos_coordenadas,
  'NO (privada)' as es_publica;
