-- Script para crear el tipo de configuración "Tipo de Reserva"
-- Este script crea el tipo de configuración y valores iniciales para tipos de reserva
-- Ejecutar en Supabase SQL Editor después de ejecutar 035_add_booking_type_to_bookings.sql

-- Función para crear tipo de configuración si no existe
CREATE OR REPLACE FUNCTION create_booking_type_config(p_tenant_id UUID)
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
    AND (name = 'Tipo de Reserva' OR name = 'Booking Type' OR name = 'Tipos de Reserva');
  
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
      'Tipo de Reserva',
      'Tipos de reserva: Reserva Comercial (con huésped) o Período Cerrado (sin huésped)',
      true,
      11
    )
    RETURNING id INTO v_config_type_id;
  END IF;
  
  -- Crear valor 'commercial' (Reserva Comercial) si no existe
  INSERT INTO public.configuration_values (
    configuration_type_id,
    value,
    label,
    description,
    is_active,
    color,
    icon,
    sort_order
  )
  SELECT 
    v_config_type_id,
    'commercial',
    'Reserva Comercial',
    'Reserva con huésped que puede tener canal de venta e importes',
    true,
    '#10b981',
    'fas fa-calendar-check',
    1
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id AND value = 'commercial'
  );
  
  -- Crear valor 'closed_period' (Período Cerrado) si no existe
  INSERT INTO public.configuration_values (
    configuration_type_id,
    value,
    label,
    description,
    is_active,
    color,
    icon,
    sort_order
  )
  SELECT 
    v_config_type_id,
    'closed_period',
    'Período Cerrado',
    'Período en el que la propiedad no está disponible para reservas (sin huésped, sin importes)',
    true,
    '#f59e0b',
    'fas fa-lock',
    2
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id AND value = 'closed_period'
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
    PERFORM create_booking_type_config(tenant_record.id);
  END LOOP;
END $$;

-- Asignar tipo "commercial" por defecto a todas las reservas existentes
UPDATE public.bookings b
SET booking_type_id = (
  SELECT cv.id 
  FROM public.configuration_values cv
  INNER JOIN public.configuration_types ct ON cv.configuration_type_id = ct.id
  WHERE ct.name = 'Tipo de Reserva' 
    AND cv.value = 'commercial'
    AND ct.tenant_id = b.tenant_id
  LIMIT 1
)
WHERE booking_type_id IS NULL;

-- Comentario
COMMENT ON FUNCTION create_booking_type_config(UUID) IS 'Crea el tipo de configuración de tipo de reserva y valores por defecto para un tenant';

