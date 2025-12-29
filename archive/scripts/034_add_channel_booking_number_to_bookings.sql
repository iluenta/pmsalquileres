-- Script para añadir el campo channel_booking_number a la tabla bookings
-- Este campo almacena el número de reserva que identifica la reserva en el canal de venta
-- Ejecutar en Supabase SQL Editor

-- Añadir columna channel_booking_number
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS channel_booking_number VARCHAR(255) NULL;

-- Crear índice para mejorar búsquedas por número de reserva del canal
CREATE INDEX IF NOT EXISTS idx_bookings_channel_booking_number 
ON public.bookings(channel_booking_number) 
WHERE channel_booking_number IS NOT NULL;

-- Comentario para documentación
COMMENT ON COLUMN public.bookings.channel_booking_number IS 'Número de reserva que identifica la reserva en el canal de venta (ej: número de reserva de Airbnb, Booking.com, etc.)';

