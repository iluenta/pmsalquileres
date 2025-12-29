-- Script para crear el tipo de configuración "Estado de Reserva"
-- Este script crea el tipo de configuración y valores iniciales para estados de reserva
-- Ejecutar en Supabase SQL Editor después de ejecutar 021_create_bookings_table.sql

-- Función para crear tipo de configuración si no existe
CREATE OR REPLACE FUNCTION create_booking_status_config(p_tenant_id UUID)
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
    AND (name = 'Estado de Reserva' OR name = 'Booking Status' OR name = 'Estados de Reserva');
  
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
      'Estado de Reserva',
      'Estados posibles de una reserva (Confirmada, Pendiente, Cancelada, etc.)',
      true,
      10
    )
    RETURNING id INTO v_config_type_id;
  END IF;
  
  -- Crear valores por defecto si no existen
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
    'pending',
    'Pendiente',
    'Reserva pendiente de confirmación',
    true,
    '#f59e0b',
    'fas fa-clock',
    1
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id AND value = 'pending'
  );
  
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
    'confirmed',
    'Confirmada',
    'Reserva confirmada',
    true,
    '#10b981',
    'fas fa-check-circle',
    2
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id AND value = 'confirmed'
  );
  
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
    'cancelled',
    'Cancelada',
    'Reserva cancelada',
    true,
    '#ef4444',
    'fas fa-times-circle',
    3
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id AND value = 'cancelled'
  );
  
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
    'completed',
    'Completada',
    'Reserva completada (check-out realizado)',
    true,
    '#6366f1',
    'fas fa-check-double',
    4
  WHERE NOT EXISTS (
    SELECT 1 FROM public.configuration_values 
    WHERE configuration_type_id = v_config_type_id AND value = 'completed'
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
    PERFORM create_booking_status_config(tenant_record.id);
  END LOOP;
END $$;

-- Comentario
COMMENT ON FUNCTION create_booking_status_config(UUID) IS 'Crea el tipo de configuración de estado de reserva y valores por defecto para un tenant';

