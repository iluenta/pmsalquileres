-- Agregar columnas para tiempo caminando y en coche desde la propiedad
ALTER TABLE guide_places 
ADD COLUMN IF NOT EXISTS walking_time INTEGER,
ADD COLUMN IF NOT EXISTS driving_time INTEGER;

COMMENT ON COLUMN guide_places.walking_time IS 'Tiempo en minutos caminando desde la propiedad';
COMMENT ON COLUMN guide_places.driving_time IS 'Tiempo en minutos en coche desde la propiedad';

