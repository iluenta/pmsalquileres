-- Script para añadir campos de comisiones e impuestos a la tabla bookings
-- Ejecutar después de tener canales de venta configurados

-- Añadir nuevos campos
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS sales_commission_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS collection_commission_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_amount DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- Actualizar constraint para incluir los nuevos campos
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_check_amounts;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_check_amounts CHECK (
    paid_amount >= 0 
    AND total_amount >= 0 
    AND sales_commission_amount >= 0 
    AND collection_commission_amount >= 0 
    AND tax_amount >= 0
    AND net_amount >= 0
  );

-- Comentarios
COMMENT ON COLUMN public.bookings.sales_commission_amount IS 'Importe de comisión de venta (calculado desde el porcentaje del canal, modificable)';
COMMENT ON COLUMN public.bookings.collection_commission_amount IS 'Importe de comisión de cobro (calculado desde el porcentaje del canal, modificable)';
COMMENT ON COLUMN public.bookings.tax_amount IS 'Importe de impuesto aplicado (calculado desde el porcentaje del tipo de impuesto del canal, modificable)';
COMMENT ON COLUMN public.bookings.net_amount IS 'Importe neto de la reserva (total - comisiones - impuesto, calculado automáticamente, no modificable)';

