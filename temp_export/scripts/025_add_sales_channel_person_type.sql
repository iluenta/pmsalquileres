-- Script para añadir el tipo de persona "Canal de venta" a la configuración
-- Ejecutar después de 024_create_person_type_config.sql

-- Función para añadir el valor "sales_channel" al tipo de configuración person_type
CREATE OR REPLACE FUNCTION add_sales_channel_person_type(p_tenant_id UUID)
RETURNS UUID AS $$
DECLARE
  v_config_type_id UUID;
  v_value_id UUID;
BEGIN
  -- Obtener el configuration_type_id para person_type
  SELECT id INTO v_config_type_id
  FROM public.configuration_types
  WHERE tenant_id = p_tenant_id
    AND (name = 'person_type' OR name = 'Tipo de Persona' OR name = 'Tipos de Persona')
    AND is_active = true
  LIMIT 1;
  
  -- Si no existe el tipo, crearlo primero
  IF v_config_type_id IS NULL THEN
    -- Llamar a la función que crea el tipo completo
    v_config_type_id := create_person_type_config(p_tenant_id);
  END IF;
  
  -- Crear valor 'sales_channel' (canal de venta) si no existe
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
    'sales_channel',
    'Canal de Venta',
    'Canal de venta o plataforma de reservas (Booking, Airbnb, propio, etc.)',
    true,
    4
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id 
      AND (value = 'sales_channel' OR LOWER(label) LIKE '%canal%venta%')
  )
  RETURNING id INTO v_value_id;
  
  RETURN COALESCE(v_value_id, (
    SELECT id FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id 
      AND (value = 'sales_channel' OR LOWER(label) LIKE '%canal%venta%')
    LIMIT 1
  ));
END;
$$ LANGUAGE plpgsql;

-- Ejecutar la función para todos los tenants existentes
DO $$
DECLARE
  tenant_record RECORD;
BEGIN
  FOR tenant_record IN SELECT id FROM public.tenants
  LOOP
    PERFORM add_sales_channel_person_type(tenant_record.id);
  END LOOP;
END $$;

-- Comentario
COMMENT ON FUNCTION add_sales_channel_person_type(UUID) IS 'Añade el tipo de persona "Canal de Venta" a la configuración person_type';

