-- Script para actualizar las reglas de validación de movimientos
-- Permitir que los gastos puedan tener booking_id (opcional)
-- Ejecutar después de 051_create_movements_table.sql

-- Actualizar la función de validación
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
  
  -- Validar: Si hay booking_id, el tipo debe ser "income" (para ingresos)
  -- PERO los gastos también pueden tener booking_id (opcional)
  IF NEW.booking_id IS NOT NULL THEN
    -- Si es un ingreso, debe tener booking_id
    IF movement_type_value = 'income' OR movement_type_label = 'Ingreso' THEN
      -- OK: ingresos con booking_id
      NULL;
    ELSIF movement_type_value = 'expense' OR movement_type_label = 'Gasto' THEN
      -- OK: gastos pueden tener booking_id (opcional)
      NULL;
    ELSE
      RAISE EXCEPTION 'Los movimientos con reserva (booking_id) solo pueden ser de tipo Ingreso o Gasto';
    END IF;
  END IF;
  
  -- Validar: Si hay service_provider_id, el tipo debe ser "expense"
  IF NEW.service_provider_id IS NOT NULL THEN
    IF movement_type_value != 'expense' AND movement_type_label != 'Gasto' THEN
      RAISE EXCEPTION 'Los movimientos con proveedor (service_provider_id) solo pueden ser de tipo Gasto';
    END IF;
  END IF;
  
  -- Validar: Los ingresos deben tener booking_id y NO service_provider_id
  IF movement_type_value = 'income' OR movement_type_label = 'Ingreso' THEN
    IF NEW.booking_id IS NULL THEN
      RAISE EXCEPTION 'Los movimientos de tipo Ingreso deben tener una reserva asociada (booking_id)';
    END IF;
    IF NEW.service_provider_id IS NOT NULL THEN
      RAISE EXCEPTION 'Los movimientos de tipo Ingreso no pueden tener proveedor de servicios';
    END IF;
  END IF;
  
  -- Validar: Los gastos deben tener service_provider_id
  IF movement_type_value = 'expense' OR movement_type_label = 'Gasto' THEN
    IF NEW.service_provider_id IS NULL THEN
      RAISE EXCEPTION 'Los movimientos de tipo Gasto deben tener un proveedor de servicios asociado (service_provider_id)';
    END IF;
    -- Los gastos pueden tener booking_id (opcional) - ya no lanzamos error
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

-- El trigger ya existe, solo se actualiza la función
-- No es necesario recrear el trigger

-- Comentarios actualizados
COMMENT ON FUNCTION validate_movement_rules() IS 'Valida las reglas de negocio para movimientos: ingresos requieren booking_id, gastos requieren service_provider_id pero pueden tener booking_id opcional';

