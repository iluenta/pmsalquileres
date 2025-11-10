-- Script para añadir el campo channel_id a la tabla bookings
-- Ejecutar después de 026_create_sales_channels_table.sql

-- Añadir columna channel_id a bookings
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS channel_id UUID REFERENCES public.sales_channels(id) ON DELETE SET NULL;

-- Crear índice para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_bookings_channel ON public.bookings(channel_id);

-- Comentario
COMMENT ON COLUMN public.bookings.channel_id IS 'Canal de venta utilizado para esta reserva (Booking, Airbnb, propio, etc.)';

