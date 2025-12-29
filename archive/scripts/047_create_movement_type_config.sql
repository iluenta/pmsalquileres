-- Script para crear el tipo de configuración "Tipo de Movimiento" y sus valores
-- Este script es idempotente y puede ejecutarse múltiples veces sin problemas

CREATE OR REPLACE FUNCTION create_movement_type_config(p_tenant_id UUID)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_config_type_id UUID;
BEGIN
  -- Buscar o crear el tipo de configuración "Tipo de Movimiento"
  SELECT id INTO v_config_type_id
  FROM public.configuration_types
  WHERE tenant_id = p_tenant_id
    AND (name = 'movement_type' OR name = 'Tipo de Movimiento' OR name = 'Tipos de Movimiento')
    AND is_active = true
  LIMIT 1;

  -- Si no existe, crearlo
  IF v_config_type_id IS NULL THEN
    INSERT INTO public.configuration_types (
      tenant_id,
      name,
      description,
      is_active
    )
    VALUES (
      p_tenant_id,
      'Tipo de Movimiento',
      'Tipos de movimientos financieros (Ingreso, Gasto)',
      true
    )
    RETURNING id INTO v_config_type_id;
  END IF;

  -- Crear valor 'income' (Ingreso) si no existe
  INSERT INTO public.configuration_values (
    configuration_type_id,
    value,
    label,
    description,
    is_active,
    sort_order
  )
  SELECT 
    v_config_type_id,
    'income',
    'Ingreso',
    'Movimiento de entrada de dinero (pago de reserva)',
    true,
    1
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id 
      AND (value = 'income' OR LOWER(label) = 'ingreso')
  );

  -- Crear valor 'expense' (Gasto) si no existe
  INSERT INTO public.configuration_values (
    configuration_type_id,
    value,
    label,
    description,
    is_active,
    sort_order
  )
  SELECT 
    v_config_type_id,
    'expense',
    'Gasto',
    'Movimiento de salida de dinero (pago a proveedor)',
    true,
    2
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id 
      AND (value = 'expense' OR LOWER(label) = 'gasto')
  );

  RETURN v_config_type_id;
END;
$$;

-- Ejecutar la función para todos los tenants existentes
DO $$
DECLARE
  tenant_record RECORD;
BEGIN
  FOR tenant_record IN SELECT id FROM public.tenants
  LOOP
    PERFORM create_movement_type_config(tenant_record.id);
  END LOOP;
END $$;

-- Comentario
COMMENT ON FUNCTION create_movement_type_config(UUID) IS 'Crea el tipo de configuración de tipo de movimiento y valores por defecto para un tenant';

