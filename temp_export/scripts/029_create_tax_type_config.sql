-- Script para crear el tipo de configuración "Tipo de Impuesto" (tax_type)
-- Este script crea el tipo de configuración y valores iniciales para tipos de impuestos
-- Ejecutar antes de usar la funcionalidad de impuestos en canales de venta

-- Función para crear tipo de configuración si no existe
CREATE OR REPLACE FUNCTION create_tax_type_config(p_tenant_id UUID)
RETURNS UUID AS $$
DECLARE
  v_config_type_id UUID;
  v_default_tenant_id UUID;
BEGIN
  -- Obtener el tenant_id si se pasa NULL (para tenant por defecto)
  v_default_tenant_id := COALESCE(p_tenant_id, (SELECT id FROM public.tenants LIMIT 1));
  
  -- Verificar si ya existe el tipo de configuración
  SELECT id INTO v_config_type_id
  FROM public.configuration_types
  WHERE tenant_id = v_default_tenant_id
    AND (name = 'tax_type' OR name = 'Tipo de Impuesto' OR name = 'Tipos de Impuesto');
  
  -- Si no existe, crearlo
  IF v_config_type_id IS NULL THEN
    INSERT INTO public.configuration_types (
      tenant_id,
      name,
      description,
      is_active,
      sort_order
    ) VALUES (
      v_default_tenant_id,
      'tax_type',
      'Tipos de impuestos aplicables a las comisiones de canales de venta',
      true,
      30
    )
    RETURNING id INTO v_config_type_id;
  END IF;
  
  -- Crear valor 'iva_general' (IVA General 21%) si no existe
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
    'iva_general',
    'IVA General',
    '21',
    true,
    1
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id AND value = 'iva_general'
  );
  
  -- Crear valor 'iva_reducido' (IVA Reducido 10%) si no existe
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
    'iva_reducido',
    'IVA Reducido',
    '10',
    true,
    2
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id AND value = 'iva_reducido'
  );
  
  -- Crear valor 'iva_superreducido' (IVA Superreducido 4%) si no existe
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
    'iva_superreducido',
    'IVA Superreducido',
    '4',
    true,
    3
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id AND value = 'iva_superreducido'
  );
  
  RETURN v_config_type_id;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar la función para todos los tenants existentes
DO $$
DECLARE
  tenant_record RECORD;
BEGIN
  FOR tenant_record IN SELECT id FROM public.tenants LOOP
    PERFORM create_tax_type_config(tenant_record.id);
  END LOOP;
END $$;

-- Comentarios
COMMENT ON FUNCTION create_tax_type_config(UUID) IS 'Crea el tipo de configuración de impuestos para un tenant';

