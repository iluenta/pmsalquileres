-- Script para corregir el tenant_id del tipo de configuración tax_type
-- Este script mueve o crea el tax_type en el tenant correcto
-- Ejecutar después de verificar qué tenant_id necesita el tax_type

-- Opción 1: Si quieres mover el tax_type existente a un tenant específico
-- Reemplaza 'TU_TENANT_ID_AQUI' con el tenant_id correcto
/*
UPDATE public.configuration_types
SET tenant_id = 'TU_TENANT_ID_AQUI'  -- Reemplazar con el tenant_id correcto
WHERE name = 'tax_type' 
  AND tenant_id = 'd3d427f3-65ed-4a41-aacb-410c3c633669';  -- El tenant_id actual del tax_type

-- También actualizar los valores de configuración asociados
UPDATE public.configuration_values
SET tenant_id = 'TU_TENANT_ID_AQUI'  -- Reemplazar con el tenant_id correcto
WHERE configuration_type_id IN (
  SELECT id FROM public.configuration_types 
  WHERE name = 'tax_type' 
    AND tenant_id = 'TU_TENANT_ID_AQUI'  -- Reemplazar con el tenant_id correcto
);
*/

-- Opción 2: Crear tax_type para un tenant específico si no existe
-- Reemplaza 'TU_TENANT_ID_AQUI' con el tenant_id correcto
DO $$
DECLARE
  v_target_tenant_id UUID := '20eab2cb-b901-4323-aef2-020670c3b3b4';  -- Reemplazar con el tenant_id correcto
  v_config_type_id UUID;
BEGIN
  -- Verificar si ya existe tax_type para este tenant
  SELECT id INTO v_config_type_id
  FROM public.configuration_types
  WHERE tenant_id = v_target_tenant_id
    AND (name = 'tax_type' OR name = 'Tipo de Impuesto' OR name = 'Tipos de Impuesto');
  
  -- Si no existe, crearlo usando la función existente
  IF v_config_type_id IS NULL THEN
    PERFORM create_tax_type_config(v_target_tenant_id);
    RAISE NOTICE 'Tipo de configuración tax_type creado para el tenant %', v_target_tenant_id;
  ELSE
    RAISE NOTICE 'El tipo de configuración tax_type ya existe para el tenant %', v_target_tenant_id;
  END IF;
END $$;

-- Opción 3: Crear tax_type para TODOS los tenants que no lo tengan
DO $$
DECLARE
  tenant_record RECORD;
  v_config_type_id UUID;
BEGIN
  FOR tenant_record IN SELECT id FROM public.tenants LOOP
    -- Verificar si ya existe tax_type para este tenant
    SELECT id INTO v_config_type_id
    FROM public.configuration_types
    WHERE tenant_id = tenant_record.id
      AND (name = 'tax_type' OR name = 'Tipo de Impuesto' OR name = 'Tipos de Impuesto');
    
    -- Si no existe, crearlo
    IF v_config_type_id IS NULL THEN
      PERFORM create_tax_type_config(tenant_record.id);
      RAISE NOTICE 'Tipo de configuración tax_type creado para el tenant %', tenant_record.id;
    END IF;
  END LOOP;
END $$;

