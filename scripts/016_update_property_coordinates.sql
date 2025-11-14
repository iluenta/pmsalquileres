-- Script para actualizar las coordenadas de la propiedad de prueba
-- Usando las mismas coordenadas de la otra propiedad para testing

UPDATE public.properties 
SET 
  latitude = 37.23236310,
  longitude = -1.81998180,
  updated_at = NOW()
WHERE id = 'a7c62ad0-d570-4125-b107-02b2403847f8';

-- Verificar que se actualizó correctamente
SELECT id, name, latitude, longitude, updated_at 
FROM public.properties 
WHERE id = 'a7c62ad0-d570-4125-b107-02b2403847f8';













