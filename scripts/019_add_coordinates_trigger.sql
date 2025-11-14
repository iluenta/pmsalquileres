-- Script para crear un trigger que copie automáticamente las coordenadas
-- de la tabla properties a property_guides cuando se crea una nueva guía

-- Función del trigger para copiar coordenadas
CREATE OR REPLACE FUNCTION copy_property_coordinates_to_guide()
RETURNS TRIGGER AS $$
BEGIN
  -- Copiar coordenadas de la propiedad asociada
  UPDATE public.property_guides
  SET 
    latitude = p.latitude,
    longitude = p.longitude
  FROM public.properties p
  WHERE property_guides.property_id = p.id
    AND property_guides.id = NEW.id
    AND p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger que se ejecuta después de INSERT
CREATE TRIGGER trigger_copy_coordinates_after_insert
  AFTER INSERT ON public.property_guides
  FOR EACH ROW
  EXECUTE FUNCTION copy_property_coordinates_to_guide();

-- Crear también un trigger para UPDATE (por si se actualiza la propiedad)
CREATE TRIGGER trigger_copy_coordinates_after_property_update
  AFTER UPDATE OF latitude, longitude ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION copy_property_coordinates_to_guide();

-- Comentario explicativo
COMMENT ON FUNCTION copy_property_coordinates_to_guide() IS 'Función que copia automáticamente las coordenadas de properties a property_guides cuando se crea una nueva guía o se actualizan las coordenadas de la propiedad';













