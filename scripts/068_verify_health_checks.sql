-- Script para verificar los registros de health_checks
-- Ejecutar en Supabase SQL Editor para ver los últimos health checks

-- Ver los últimos 10 health checks
SELECT 
  id,
  status,
  response_time_ms,
  error_message,
  error_code,
  database_connected,
  query_executed,
  created_at
FROM health_checks
ORDER BY created_at DESC
LIMIT 10;

-- Estadísticas de health checks
SELECT 
  status,
  COUNT(*) as total_checks,
  AVG(response_time_ms) as avg_response_time_ms,
  MIN(response_time_ms) as min_response_time_ms,
  MAX(response_time_ms) as max_response_time_ms,
  MIN(created_at) as first_check,
  MAX(created_at) as last_check
FROM health_checks
GROUP BY status;

-- Verificar el registro específico creado en la prueba
-- Reemplaza el ID con el health_check_id de la respuesta
-- SELECT * FROM health_checks WHERE id = '10667cb1-cb6c-4440-88c0-97a0ab559333';

