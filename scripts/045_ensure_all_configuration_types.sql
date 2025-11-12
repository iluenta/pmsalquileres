-- Script para asegurar que todos los tenants tengan todos los tipos de configuración necesarios
-- Este script crea los tipos de configuración faltantes en español directamente
-- Ejecutar después de 044_rename_configuration_types_to_spanish.sql
--
-- Tipos que se aseguran:
--   - Tipo de Persona (person_type)
--   - Tipo de Impuesto (tax_type)
--   - Tipo de Servicio (service_type)
--
-- NOTA: Este script es idempotente - puede ejecutarse múltiples veces sin problemas

-- Función para asegurar que un tenant tenga todos los tipos de configuración necesarios
CREATE OR REPLACE FUNCTION ensure_all_configuration_types(p_tenant_id UUID)
RETURNS TABLE(
  config_type_name TEXT,
  created BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_config_type_id UUID;
  v_created BOOLEAN := false;
BEGIN
  -- 1. Asegurar 'Tipo de Persona'
  SELECT id INTO v_config_type_id
  FROM public.configuration_types
  WHERE tenant_id = p_tenant_id
    AND (name = 'person_type' OR name = 'Tipo de Persona' OR name = 'Tipos de Persona');
  
  IF v_config_type_id IS NULL THEN
    INSERT INTO public.configuration_types (
      tenant_id,
      name,
      description,
      is_active,
      sort_order
    ) VALUES (
      p_tenant_id,
      'Tipo de Persona',
      'Tipos de persona (huésped, propietario, contacto, etc.)',
      true,
      20
    )
    RETURNING id INTO v_config_type_id;
    v_created := true;
    
    RETURN QUERY SELECT 
      'Tipo de Persona'::TEXT,
      true::BOOLEAN,
      format('Creado Tipo de Persona para tenant %s', p_tenant_id)::TEXT;
  ELSE
    -- Si existe pero está en inglés, renombrarlo
    IF (SELECT name FROM public.configuration_types WHERE id = v_config_type_id) = 'person_type' THEN
      UPDATE public.configuration_types
      SET name = 'Tipo de Persona'
      WHERE id = v_config_type_id;
      
      RETURN QUERY SELECT 
        'Tipo de Persona'::TEXT,
        true::BOOLEAN,
        format('Renombrado person_type a Tipo de Persona para tenant %s', p_tenant_id)::TEXT;
    ELSE
      RETURN QUERY SELECT 
        'Tipo de Persona'::TEXT,
        false::BOOLEAN,
        format('Tipo de Persona ya existe para tenant %s', p_tenant_id)::TEXT;
    END IF;
  END IF;
  
  -- 2. Asegurar 'Tipo de Impuesto'
  SELECT id INTO v_config_type_id
  FROM public.configuration_types
  WHERE tenant_id = p_tenant_id
    AND (name = 'tax_type' OR name = 'Tipo de Impuesto' OR name = 'Tipos de Impuesto');
  
  IF v_config_type_id IS NULL THEN
    INSERT INTO public.configuration_types (
      tenant_id,
      name,
      description,
      is_active,
      sort_order
    ) VALUES (
      p_tenant_id,
      'Tipo de Impuesto',
      'Tipos de impuestos aplicables a las comisiones de canales de venta',
      true,
      30
    )
    RETURNING id INTO v_config_type_id;
    
    -- Crear valores por defecto de impuestos
    INSERT INTO public.configuration_values (
      configuration_type_id,
      value,
      label,
      description,
      is_active,
      sort_order
    ) VALUES
      (v_config_type_id, 'iva_general', 'IVA General', '21', true, 1),
      (v_config_type_id, 'iva_reducido', 'IVA Reducido', '10', true, 2),
      (v_config_type_id, 'iva_superreducido', 'IVA Superreducido', '4', true, 3)
    ON CONFLICT DO NOTHING;
    
    RETURN QUERY SELECT 
      'Tipo de Impuesto'::TEXT,
      true::BOOLEAN,
      format('Creado Tipo de Impuesto con valores por defecto para tenant %s', p_tenant_id)::TEXT;
  ELSE
    -- Si existe pero está en inglés, renombrarlo
    IF (SELECT name FROM public.configuration_types WHERE id = v_config_type_id) = 'tax_type' THEN
      UPDATE public.configuration_types
      SET name = 'Tipo de Impuesto'
      WHERE id = v_config_type_id;
      
      RETURN QUERY SELECT 
        'Tipo de Impuesto'::TEXT,
        true::BOOLEAN,
        format('Renombrado tax_type a Tipo de Impuesto para tenant %s', p_tenant_id)::TEXT;
    ELSE
      RETURN QUERY SELECT 
        'Tipo de Impuesto'::TEXT,
        false::BOOLEAN,
        format('Tipo de Impuesto ya existe para tenant %s', p_tenant_id)::TEXT;
    END IF;
  END IF;
  
  -- 3. Asegurar 'Tipo de Servicio'
  SELECT id INTO v_config_type_id
  FROM public.configuration_types
  WHERE tenant_id = p_tenant_id
    AND (name = 'service_type' OR name = 'Tipo de Servicio' OR name = 'Tipos de Servicio');
  
  IF v_config_type_id IS NULL THEN
    INSERT INTO public.configuration_types (
      tenant_id,
      name,
      description,
      is_active,
      sort_order
    ) VALUES (
      p_tenant_id,
      'Tipo de Servicio',
      'Tipos de servicios que pueden ofrecer los proveedores (limpieza, mantenimiento, jardinería, etc.)',
      true,
      40
    )
    RETURNING id INTO v_config_type_id;
    
    -- Crear valores por defecto de servicios
    INSERT INTO public.configuration_values (
      configuration_type_id,
      value,
      label,
      description,
      is_active,
      sort_order
    ) VALUES
      (v_config_type_id, 'limpieza', 'Limpieza', 'Servicio de limpieza de la propiedad', true, 1),
      (v_config_type_id, 'mantenimiento', 'Mantenimiento', 'Servicio de mantenimiento y reparaciones', true, 2),
      (v_config_type_id, 'jardineria', 'Jardinería', 'Servicio de jardinería y cuidado de exteriores', true, 3),
      (v_config_type_id, 'piscina', 'Piscina', 'Servicio de mantenimiento de piscina', true, 4)
    ON CONFLICT DO NOTHING;
    
    RETURN QUERY SELECT 
      'Tipo de Servicio'::TEXT,
      true::BOOLEAN,
      format('Creado Tipo de Servicio con valores por defecto para tenant %s', p_tenant_id)::TEXT;
  ELSE
    -- Si existe pero está en inglés, renombrarlo
    IF (SELECT name FROM public.configuration_types WHERE id = v_config_type_id) = 'service_type' THEN
      UPDATE public.configuration_types
      SET name = 'Tipo de Servicio'
      WHERE id = v_config_type_id;
      
      RETURN QUERY SELECT 
        'Tipo de Servicio'::TEXT,
        true::BOOLEAN,
        format('Renombrado service_type a Tipo de Servicio para tenant %s', p_tenant_id)::TEXT;
    ELSE
      RETURN QUERY SELECT 
        'Tipo de Servicio'::TEXT,
        false::BOOLEAN,
        format('Tipo de Servicio ya existe para tenant %s', p_tenant_id)::TEXT;
    END IF;
  END IF;
  
END;
$$ LANGUAGE plpgsql;

-- Ejecutar para todos los tenants
DO $$
DECLARE
  tenant_record RECORD;
  result_record RECORD;
BEGIN
  FOR tenant_record IN SELECT id, name FROM public.tenants LOOP
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Procesando tenant: % (%)', tenant_record.name, tenant_record.id;
    RAISE NOTICE '========================================';
    
    FOR result_record IN 
      SELECT * FROM ensure_all_configuration_types(tenant_record.id)
    LOOP
      IF result_record.created THEN
        RAISE NOTICE '✓ %', result_record.message;
      ELSE
        RAISE NOTICE '⊘ %', result_record.message;
      END IF;
    END LOOP;
    
    RAISE NOTICE '';
  END LOOP;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Proceso completado para todos los tenants';
  RAISE NOTICE '========================================';
END;
$$;

-- Comentario de la función
COMMENT ON FUNCTION ensure_all_configuration_types(UUID) IS 
'Asegura que un tenant tenga todos los tipos de configuración necesarios (Tipo de Persona, Tipo de Impuesto, Tipo de Servicio). Crea los faltantes en español directamente.';

-- Verificación final: Mostrar el estado de todos los tipos de configuración
SELECT 
  ct.tenant_id,
  t.name as tenant_name,
  ct.name as configuration_type_name,
  ct.description,
  COUNT(cv.id) as values_count,
  CASE 
    WHEN ct.name IN ('Tipo de Persona', 'Tipo de Impuesto', 'Tipo de Servicio') THEN '✓ Completo en español'
    WHEN ct.name IN ('person_type', 'tax_type', 'service_type') THEN '⚠️ Necesita cambio a español'
    ELSE 'ℹ️ Otro tipo'
  END as status
FROM public.configuration_types ct
LEFT JOIN public.tenants t ON ct.tenant_id = t.id
LEFT JOIN public.configuration_values cv ON cv.configuration_type_id = ct.id
WHERE ct.name IN ('person_type', 'tax_type', 'service_type', 'Tipo de Persona', 'Tipo de Impuesto', 'Tipo de Servicio')
GROUP BY ct.tenant_id, t.name, ct.name, ct.description
ORDER BY ct.tenant_id, ct.name;

