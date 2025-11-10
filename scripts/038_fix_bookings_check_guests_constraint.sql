-- Script para modificar la restricción check_guests para permitir 0 en períodos cerrados
-- Ejecutar en Supabase SQL Editor después de ejecutar 037_allow_null_person_id_in_bookings.sql

-- Eliminar la restricción antigua
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_check_guests;

-- Crear nueva restricción que permite 0 (para períodos cerrados)
ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_check_guests CHECK (number_of_guests >= 0);

-- Comentario
COMMENT ON CONSTRAINT bookings_check_guests ON public.bookings IS 'El número de huéspedes debe ser >= 0 (0 para períodos cerrados)';

