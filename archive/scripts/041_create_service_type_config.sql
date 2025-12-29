-- Script para crear el tipo de configuración "Tipo de Servicio" (service_type)
-- Este script crea el tipo de configuración y valores iniciales para tipos de servicios
-- Ejecutar antes de usar la funcionalidad de proveedores de servicios

-- Función para crear tipo de configuración si no existe
CREATE OR REPLACE FUNCTION create_service_type_config(p_tenant_id UUID)
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
    AND (name = 'service_type' OR name = 'Tipo de Servicio' OR name = 'Tipos de Servicio');
  
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
      'service_type',
      'Tipos de servicios que pueden ofrecer los proveedores (limpieza, mantenimiento, jardinería, etc.)',
      true,
      40
    )
    RETURNING id INTO v_config_type_id;
  END IF;
  
  -- Crear valor 'limpieza' (Limpieza) si no existe
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
    'limpieza',
    'Limpieza',
    'Servicio de limpieza de la propiedad',
    true,
    1
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id AND value = 'limpieza'
  );
  
  -- Crear valor 'mantenimiento' (Mantenimiento) si no existe
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
    'mantenimiento',
    'Mantenimiento',
    'Servicio de mantenimiento y reparaciones',
    true,
    2
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id AND value = 'mantenimiento'
  );
  
  -- Crear valor 'jardineria' (Jardinería) si no existe
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
    'jardineria',
    'Jardinería',
    'Servicio de jardinería y cuidado de exteriores',
    true,
    3
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id AND value = 'jardineria'
  );
  
  -- Crear valor 'piscina' (Piscina) si no existe
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
    'piscina',
    'Piscina',
    'Servicio de mantenimiento de piscina',
    true,
    4
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id AND value = 'piscina'
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
    PERFORM create_service_type_config(tenant_record.id);
  END LOOP;
END $$;

-- Comentarios
COMMENT ON FUNCTION create_service_type_config(UUID) IS 'Crea el tipo de configuración de tipos de servicio para un tenant';

