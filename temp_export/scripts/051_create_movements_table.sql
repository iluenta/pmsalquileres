-- Script para crear la tabla de movimientos financieros
-- Ejecutar en Supabase SQL Editor
-- IMPORTANTE: Las tablas bookings, service_providers, service_provider_services y treasury_accounts deben existir

-- Verificar que las tablas necesarias existen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'bookings'
  ) THEN
    RAISE EXCEPTION 'La tabla bookings no existe. Debes crearla primero.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'service_providers'
  ) THEN
    RAISE EXCEPTION 'La tabla service_providers no existe. Debes crearla primero.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'treasury_accounts'
  ) THEN
    RAISE EXCEPTION 'La tabla treasury_accounts no existe. Debes crearla primero.';
  END IF;
END $$;

-- Crear tabla movements
CREATE TABLE IF NOT EXISTS public.movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  movement_type_id UUID NOT NULL REFERENCES public.configuration_values(id) ON DELETE RESTRICT,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE RESTRICT,
  service_provider_id UUID REFERENCES public.service_providers(id) ON DELETE RESTRICT,
  service_provider_service_id UUID REFERENCES public.service_provider_services(id) ON DELETE RESTRICT,
  treasury_account_id UUID NOT NULL REFERENCES public.treasury_accounts(id) ON DELETE RESTRICT,
  payment_method_id UUID NOT NULL REFERENCES public.configuration_values(id) ON DELETE RESTRICT,
  movement_status_id UUID NOT NULL REFERENCES public.configuration_values(id) ON DELETE RESTRICT,
  amount DECIMAL(10, 2) NOT NULL,
  invoice_number VARCHAR(100),
  reference TEXT,
  movement_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT movements_amount_positive CHECK (amount > 0)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_movements_tenant_id 
ON public.movements(tenant_id);

CREATE INDEX IF NOT EXISTS idx_movements_booking_id 
ON public.movements(booking_id) 
WHERE booking_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_movements_service_provider_id 
ON public.movements(service_provider_id) 
WHERE service_provider_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_movements_treasury_account_id 
ON public.movements(treasury_account_id);

CREATE INDEX IF NOT EXISTS idx_movements_movement_type_id 
ON public.movements(movement_type_id);

CREATE INDEX IF NOT EXISTS idx_movements_movement_status_id 
ON public.movements(movement_status_id);

CREATE INDEX IF NOT EXISTS idx_movements_movement_date 
ON public.movements(movement_date);

CREATE INDEX IF NOT EXISTS idx_movements_created_at 
ON public.movements(created_at DESC);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_movements_updated_at
BEFORE UPDATE ON public.movements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Función para validar reglas de negocio de movimientos
CREATE OR REPLACE FUNCTION validate_movement_rules()
RETURNS TRIGGER AS $$
DECLARE
  movement_type_value TEXT;
  movement_type_label TEXT;
BEGIN
  -- Obtener el valor y label del tipo de movimiento
  SELECT value, label INTO movement_type_value, movement_type_label
  FROM public.configuration_values
  WHERE id = NEW.movement_type_id;
  
  -- Validar: Si hay booking_id, el tipo debe ser "income"
  IF NEW.booking_id IS NOT NULL THEN
    IF movement_type_value != 'income' AND movement_type_label != 'Ingreso' THEN
      RAISE EXCEPTION 'Los movimientos con reserva (booking_id) solo pueden ser de tipo Ingreso';
    END IF;
  END IF;
  
  -- Validar: Si hay service_provider_id, el tipo debe ser "expense"
  IF NEW.service_provider_id IS NOT NULL THEN
    IF movement_type_value != 'expense' AND movement_type_label != 'Gasto' THEN
      RAISE EXCEPTION 'Los movimientos con proveedor (service_provider_id) solo pueden ser de tipo Gasto';
    END IF;
  END IF;
  
  -- Validar: No puede haber booking_id y service_provider_id al mismo tiempo
  IF NEW.booking_id IS NOT NULL AND NEW.service_provider_id IS NOT NULL THEN
    RAISE EXCEPTION 'Un movimiento no puede tener tanto reserva como proveedor al mismo tiempo';
  END IF;
  
  -- Validar: Si hay service_provider_service_id, debe pertenecer al service_provider_id
  IF NEW.service_provider_service_id IS NOT NULL THEN
    IF NEW.service_provider_id IS NULL THEN
      RAISE EXCEPTION 'No se puede especificar un servicio sin especificar el proveedor';
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM public.service_provider_services
      WHERE id = NEW.service_provider_service_id
      AND service_provider_id = NEW.service_provider_id
    ) THEN
      RAISE EXCEPTION 'El servicio especificado no pertenece al proveedor seleccionado';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar reglas antes de INSERT o UPDATE
CREATE TRIGGER validate_movement_rules_trigger
BEFORE INSERT OR UPDATE ON public.movements
FOR EACH ROW
EXECUTE FUNCTION validate_movement_rules();

-- Comentarios
COMMENT ON TABLE public.movements IS 'Movimientos financieros: ingresos (pagos de reservas) y gastos (pagos a proveedores)';
COMMENT ON COLUMN public.movements.movement_type_id IS 'Tipo de movimiento: Ingreso o Gasto';
COMMENT ON COLUMN public.movements.booking_id IS 'Reserva asociada (solo para ingresos)';
COMMENT ON COLUMN public.movements.service_provider_id IS 'Proveedor de servicios asociado (solo para gastos)';
COMMENT ON COLUMN public.movements.service_provider_service_id IS 'Servicio específico del proveedor (opcional, solo para gastos)';
COMMENT ON COLUMN public.movements.treasury_account_id IS 'Cuenta de tesorería donde se registra el movimiento';
COMMENT ON COLUMN public.movements.payment_method_id IS 'Método de pago utilizado';
COMMENT ON COLUMN public.movements.movement_status_id IS 'Estado del movimiento: Pendiente o Pagado';
COMMENT ON COLUMN public.movements.amount IS 'Importe del movimiento (siempre positivo)';
COMMENT ON COLUMN public.movements.invoice_number IS 'Número de factura o recibo';
COMMENT ON COLUMN public.movements.reference IS 'Referencia adicional del movimiento';
COMMENT ON COLUMN public.movements.movement_date IS 'Fecha del movimiento';
COMMENT ON COLUMN public.movements.notes IS 'Notas adicionales sobre el movimiento';

