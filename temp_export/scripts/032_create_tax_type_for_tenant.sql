-- Script para crear tax_type para un tenant específico
-- Reemplaza '20eab2cb-b901-4323-aef2-020670c3b3b4' con tu tenant_id si es diferente

-- Ejecutar la función para crear tax_type en el tenant correcto
SELECT create_tax_type_config('20eab2cb-b901-4323-aef2-020670c3b3b4'::UUID);

-- Verificar que se creó correctamente
SELECT 
  ct.id,
  ct.name,
  ct.tenant_id,
  ct.description,
  ct.is_active,
  COUNT(cv.id) as values_count
FROM public.configuration_types ct
LEFT JOIN public.configuration_values cv ON cv.configuration_type_id = ct.id
WHERE ct.tenant_id = '20eab2cb-b901-4323-aef2-020670c3b3b4'::UUID
  AND ct.name = 'tax_type'
GROUP BY ct.id, ct.name, ct.tenant_id, ct.description, ct.is_active;

