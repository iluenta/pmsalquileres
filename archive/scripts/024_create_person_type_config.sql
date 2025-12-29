-- Script para crear el tipo de configuración "Tipo de Persona" (person_type)
-- Este script crea el tipo de configuración y valores iniciales para tipos de persona
-- Ejecutar en Supabase SQL Editor antes de usar la funcionalidad de reservas

-- Función para crear tipo de configuración si no existe
CREATE OR REPLACE FUNCTION create_person_type_config(p_tenant_id UUID)
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
    AND (name = 'person_type' OR name = 'Tipo de Persona' OR name = 'Tipos de Persona');
  
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
      'person_type',
      'Tipos de persona (huésped, propietario, contacto, etc.)',
      true,
      20
    )
    RETURNING id INTO v_config_type_id;
  END IF;
  
  -- Crear valor 'guest' (huésped) si no existe
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
    'guest',
    'Huésped',
    'Persona que realiza una reserva o estancia',
    true,
    1
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id AND (value = 'guest' OR LOWER(label) = 'huésped')
  );
  
  -- Crear valor 'owner' (propietario) si no existe
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
    'owner',
    'Propietario',
    'Propietario de la propiedad',
    true,
    2
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id AND (value = 'owner' OR LOWER(label) = 'propietario')
  );
  
  -- Crear valor 'contact' (contacto) si no existe
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
    'contact',
    'Contacto',
    'Contacto o persona de referencia',
    true,
    3
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id AND (value = 'contact' OR LOWER(label) = 'contacto')
  );
  
  RETURN v_config_type_id;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar la función para todos los tenants existentes
DO $$
DECLARE
  tenant_record RECORD;
BEGIN
  FOR tenant_record IN SELECT id FROM public.tenants
  LOOP
    PERFORM create_person_type_config(tenant_record.id);
  END LOOP;
END $$;

-- Comentario
COMMENT ON FUNCTION create_person_type_config(UUID) IS 'Crea el tipo de configuración de tipo de persona y valores por defecto para un tenant';

