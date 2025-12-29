-- Script para crear el tipo de configuración "Estado de Movimiento" y sus valores
-- Este script es idempotente y puede ejecutarse múltiples veces sin problemas

CREATE OR REPLACE FUNCTION create_movement_status_config(p_tenant_id UUID)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_config_type_id UUID;
BEGIN
  -- Buscar o crear el tipo de configuración "Estado de Movimiento"
  SELECT id INTO v_config_type_id
  FROM public.configuration_types
  WHERE tenant_id = p_tenant_id
    AND (name = 'movement_status' OR name = 'Estado de Movimiento' OR name = 'Estados de Movimiento')
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
      'Estado de Movimiento',
      'Estados de los movimientos financieros (Pendiente, Pagado)',
      true
    )
    RETURNING id INTO v_config_type_id;
  END IF;

  -- Crear valor 'pending' (Pendiente) si no existe
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
    'pending',
    'Pendiente',
    'Movimiento pendiente de confirmación',
    true,
    1
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id 
      AND (value = 'pending' OR LOWER(label) = 'pendiente')
  );

  -- Crear valor 'paid' (Pagado) si no existe
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
    'paid',
    'Pagado',
    'Movimiento confirmado y pagado',
    true,
    2
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id 
      AND (value = 'paid' OR LOWER(label) = 'pagado')
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
    PERFORM create_movement_status_config(tenant_record.id);
  END LOOP;
END $$;

-- Comentario
COMMENT ON FUNCTION create_movement_status_config(UUID) IS 'Crea el tipo de configuración de estado de movimiento y valores por defecto para un tenant';

