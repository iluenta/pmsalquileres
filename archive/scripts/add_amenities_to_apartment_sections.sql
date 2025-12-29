-- Script para agregar el campo amenities a la tabla apartment_sections
-- Este campo permitirá almacenar una lista de amenities/features como "WiFi Gratis", "A/A", "Cafetera", etc.

-- Agregar el campo amenities como un array de texto
ALTER TABLE public.apartment_sections 
ADD COLUMN amenities TEXT[] DEFAULT '{}';

-- Crear un índice para optimizar consultas con amenities
CREATE INDEX idx_apartment_sections_amenities ON public.apartment_sections USING GIN (amenities);

-- Comentario para documentar el campo
COMMENT ON COLUMN public.apartment_sections.amenities IS 'Array de amenities/features del apartamento (ej: WiFi Gratis, A/A, Cafetera, etc.)';

-- Ejemplo de uso:
-- UPDATE apartment_sections SET amenities = ARRAY['WiFi Gratis', 'A/A', 'Cafetera'] WHERE id = 'uuid';
-- SELECT * FROM apartment_sections WHERE 'WiFi Gratis' = ANY(amenities);
