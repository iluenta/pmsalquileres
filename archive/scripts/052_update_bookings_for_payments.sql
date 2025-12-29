-- Script para actualizar la tabla bookings para el sistema de pagos dinámicos
-- Elimina paid_amount y añade pending_amount (calculado)

-- Eliminar el campo paid_amount (se calculará dinámicamente desde movements)
ALTER TABLE public.bookings
  DROP COLUMN IF EXISTS paid_amount;

-- Añadir campo pending_amount (se calculará dinámicamente, pero se puede almacenar para optimización)
-- Por ahora lo dejamos como calculado dinámicamente, no añadimos columna física
-- Si en el futuro se necesita optimización, se puede añadir como columna calculada o actualizada por trigger

-- Actualizar constraint para eliminar referencia a paid_amount
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_check_amounts;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_check_amounts CHECK (
    total_amount >= 0 
    AND sales_commission_amount >= 0 
    AND collection_commission_amount >= 0 
    AND tax_amount >= 0
    AND net_amount >= 0
  );

-- Comentario
COMMENT ON COLUMN public.bookings.net_amount IS 'Importe neto de la reserva (total - comisiones - impuesto). Para reservas sin canal, el importe a pagar es total_amount. Para reservas con canal, el importe a pagar es net_amount. El importe pagado se calcula dinámicamente sumando los movimientos de tipo Ingreso asociados a esta reserva.';

