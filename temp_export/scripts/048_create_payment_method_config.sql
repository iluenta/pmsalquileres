-- Script para crear el tipo de configuración "Método de Pago" y sus valores
-- Este script es idempotente y puede ejecutarse múltiples veces sin problemas

CREATE OR REPLACE FUNCTION create_payment_method_config(p_tenant_id UUID)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_config_type_id UUID;
BEGIN
  -- Buscar o crear el tipo de configuración "Método de Pago"
  SELECT id INTO v_config_type_id
  FROM public.configuration_types
  WHERE tenant_id = p_tenant_id
    AND (name = 'payment_method' OR name = 'Método de Pago' OR name = 'Métodos de Pago')
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
      'Método de Pago',
      'Métodos de pago disponibles (Efectivo, Transferencia, Tarjeta, etc.)',
      true
    )
    RETURNING id INTO v_config_type_id;
  END IF;

  -- Crear valor 'cash' (Efectivo) si no existe
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
    'cash',
    'Efectivo',
    'Pago en efectivo',
    true,
    1
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id 
      AND (value = 'cash' OR LOWER(label) = 'efectivo')
  );

  -- Crear valor 'transfer' (Transferencia) si no existe
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
    'transfer',
    'Transferencia',
    'Transferencia bancaria',
    true,
    2
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id 
      AND (value = 'transfer' OR LOWER(label) = 'transferencia')
  );

  -- Crear valor 'card' (Tarjeta) si no existe
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
    'card',
    'Tarjeta',
    'Pago con tarjeta de crédito o débito',
    true,
    3
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id 
      AND (value = 'card' OR LOWER(label) = 'tarjeta')
  );

  -- Crear valor 'check' (Cheque) si no existe
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
    'check',
    'Cheque',
    'Pago con cheque',
    true,
    4
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id 
      AND (value = 'check' OR LOWER(label) = 'cheque')
  );

  -- Crear valor 'paypal' (PayPal) si no existe
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
    'paypal',
    'PayPal',
    'Pago a través de PayPal',
    true,
    5
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id 
      AND (value = 'paypal' OR LOWER(label) = 'paypal')
  );

  -- Crear valor 'other' (Otro) si no existe
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
    'other',
    'Otro',
    'Otro método de pago',
    true,
    6
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id 
      AND (value = 'other' OR LOWER(label) = 'otro')
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
    PERFORM create_payment_method_config(tenant_record.id);
  END LOOP;
END $$;

-- Comentario
COMMENT ON FUNCTION create_payment_method_config(UUID) IS 'Crea el tipo de configuración de método de pago y valores por defecto para un tenant';

