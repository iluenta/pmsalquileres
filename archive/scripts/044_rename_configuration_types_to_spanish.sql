-- Script para renombrar tipos de configuración de inglés a español
-- Este script cambia los nombres de los tipos de configuración para mantener consistencia
-- Ejecutar después de verificar que todos los tipos de configuración existen
--
-- Cambios:
--   - 'person_type' -> 'Tipo de Persona'
--   - 'tax_type' -> 'Tipo de Impuesto'
--   - 'service_type' -> 'Tipo de Servicio'
--
-- NOTA: Este script es seguro y solo cambia el nombre si existe en inglés
--       No afecta la funcionalidad ya que el código busca por múltiples variantes

-- Función para renombrar tipos de configuración a español para un tenant específico
CREATE OR REPLACE FUNCTION rename_configuration_types_to_spanish(p_tenant_id UUID)
RETURNS TABLE(
  old_name TEXT,
  new_name TEXT,
  updated BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_updated_count INTEGER := 0;
BEGIN
  -- Cambiar 'person_type' a 'Tipo de Persona'
  UPDATE public.configuration_types
  SET name = 'Tipo de Persona'
  WHERE tenant_id = p_tenant_id
    AND name = 'person_type'
    AND name != 'Tipo de Persona';  -- Solo si no está ya en español
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  IF v_updated_count > 0 THEN
    RETURN QUERY SELECT 
      'person_type'::TEXT,
      'Tipo de Persona'::TEXT,
      true::BOOLEAN,
      format('Renombrado person_type a Tipo de Persona para tenant %s', p_tenant_id)::TEXT;
  ELSE
    RETURN QUERY SELECT 
      'person_type'::TEXT,
      'Tipo de Persona'::TEXT,
      false::BOOLEAN,
      format('person_type no encontrado o ya está en español para tenant %s', p_tenant_id)::TEXT;
  END IF;
  
  -- Cambiar 'tax_type' a 'Tipo de Impuesto'
  UPDATE public.configuration_types
  SET name = 'Tipo de Impuesto'
  WHERE tenant_id = p_tenant_id
    AND name = 'tax_type'
    AND name != 'Tipo de Impuesto';  -- Solo si no está ya en español
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  IF v_updated_count > 0 THEN
    RETURN QUERY SELECT 
      'tax_type'::TEXT,
      'Tipo de Impuesto'::TEXT,
      true::BOOLEAN,
      format('Renombrado tax_type a Tipo de Impuesto para tenant %s', p_tenant_id)::TEXT;
  ELSE
    RETURN QUERY SELECT 
      'tax_type'::TEXT,
      'Tipo de Impuesto'::TEXT,
      false::BOOLEAN,
      format('tax_type no encontrado o ya está en español para tenant %s', p_tenant_id)::TEXT;
  END IF;
  
  -- Cambiar 'service_type' a 'Tipo de Servicio'
  UPDATE public.configuration_types
  SET name = 'Tipo de Servicio'
  WHERE tenant_id = p_tenant_id
    AND name = 'service_type'
    AND name != 'Tipo de Servicio';  -- Solo si no está ya en español
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  IF v_updated_count > 0 THEN
    RETURN QUERY SELECT 
      'service_type'::TEXT,
      'Tipo de Servicio'::TEXT,
      true::BOOLEAN,
      format('Renombrado service_type a Tipo de Servicio para tenant %s', p_tenant_id)::TEXT;
  ELSE
    RETURN QUERY SELECT 
      'service_type'::TEXT,
      'Tipo de Servicio'::TEXT,
      false::BOOLEAN,
      format('service_type no encontrado o ya está en español para tenant %s', p_tenant_id)::TEXT;
  END IF;
  
END;
$$ LANGUAGE plpgsql;

-- Ejecutar para todos los tenants
DO $$
DECLARE
  tenant_record RECORD;
  result_record RECORD;
BEGIN
  FOR tenant_record IN SELECT id FROM public.tenants LOOP
    RAISE NOTICE 'Procesando tenant: %', tenant_record.id;
    
    FOR result_record IN 
      SELECT * FROM rename_configuration_types_to_spanish(tenant_record.id)
    LOOP
      IF result_record.updated THEN
        RAISE NOTICE '✓ %', result_record.message;
      ELSE
        RAISE NOTICE '⊘ %', result_record.message;
      END IF;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Proceso completado para todos los tenants';
END;
$$;

-- Comentario de la función
COMMENT ON FUNCTION rename_configuration_types_to_spanish(UUID) IS 
'Renombra los tipos de configuración de inglés a español para un tenant específico. Cambia person_type, tax_type y service_type a sus equivalentes en español.';

-- Verificación: Mostrar el estado actual de los tipos de configuración
SELECT 
  ct.tenant_id,
  t.name as tenant_name,
  ct.name as configuration_type_name,
  ct.description,
  CASE 
    WHEN ct.name = 'person_type' THEN '⚠️ Necesita cambio a "Tipo de Persona"'
    WHEN ct.name = 'tax_type' THEN '⚠️ Necesita cambio a "Tipo de Impuesto"'
    WHEN ct.name = 'service_type' THEN '⚠️ Necesita cambio a "Tipo de Servicio"'
    WHEN ct.name IN ('Tipo de Persona', 'Tipo de Impuesto', 'Tipo de Servicio') THEN '✓ Ya está en español'
    ELSE 'ℹ️ Otro tipo'
  END as status
FROM public.configuration_types ct
LEFT JOIN public.tenants t ON ct.tenant_id = t.id
WHERE ct.name IN ('person_type', 'tax_type', 'service_type', 'Tipo de Persona', 'Tipo de Impuesto', 'Tipo de Servicio')
ORDER BY ct.tenant_id, ct.name;

