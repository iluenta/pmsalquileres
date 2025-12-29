-- Script para añadir la columna booking_type_id a la tabla bookings
-- Ejecutar en Supabase SQL Editor después de ejecutar 021_create_bookings_table.sql

-- Añadir columna booking_type_id
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS booking_type_id UUID REFERENCES public.configuration_values(id) ON DELETE SET NULL;

-- Crear índice para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_bookings_booking_type 
ON public.bookings(booking_type_id);

-- Comentario
COMMENT ON COLUMN public.bookings.booking_type_id IS 'Tipo de reserva: comercial o período cerrado (desde configuration_values)';

