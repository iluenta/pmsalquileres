-- Script para crear la tabla health_checks
-- Tabla de auditoría para registrar sondas de salud de Supabase
-- Ejecutar en Supabase SQL Editor

-- Crear tabla health_checks
CREATE TABLE IF NOT EXISTS public.health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error')),
  response_time_ms INTEGER NOT NULL,
  error_message TEXT,
  error_code VARCHAR(50),
  query_executed TEXT NOT NULL,
  database_connected BOOLEAN NOT NULL DEFAULT TRUE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Crear índices para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_health_checks_created_at 
ON public.health_checks(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_health_checks_status 
ON public.health_checks(status);

CREATE INDEX IF NOT EXISTS idx_health_checks_tenant_id 
ON public.health_checks(tenant_id) 
WHERE tenant_id IS NOT NULL;

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_health_checks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_health_checks_updated_at ON public.health_checks;
CREATE TRIGGER trigger_update_health_checks_updated_at
BEFORE UPDATE ON public.health_checks
FOR EACH ROW
EXECUTE FUNCTION update_health_checks_updated_at();

-- Habilitar RLS
ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;

-- Política: Todos los usuarios autenticados pueden ver health checks (lectura permisiva)
CREATE POLICY "Authenticated users can view health checks"
ON public.health_checks
FOR SELECT
USING (auth.role() = 'authenticated');

-- Política: Permitir INSERT desde service role (para el cron job)
-- El service role bypasea RLS, pero esta política permite INSERT explícito
CREATE POLICY "Service role can insert health checks"
ON public.health_checks
FOR INSERT
WITH CHECK (true);

-- Comentarios para documentación
COMMENT ON TABLE public.health_checks IS 'Tabla de auditoría para registrar sondas de salud de Supabase ejecutadas por el cron job de keep-alive';
COMMENT ON COLUMN public.health_checks.status IS 'Estado de la sonda: success o error';
COMMENT ON COLUMN public.health_checks.response_time_ms IS 'Tiempo de respuesta de la consulta en milisegundos';
COMMENT ON COLUMN public.health_checks.error_message IS 'Mensaje de error si la sonda falló';
COMMENT ON COLUMN public.health_checks.error_code IS 'Código de error de Supabase si la sonda falló';
COMMENT ON COLUMN public.health_checks.query_executed IS 'Query SQL que se ejecutó para la prueba de salud';
COMMENT ON COLUMN public.health_checks.database_connected IS 'Indica si la conexión a la base de datos fue exitosa';
COMMENT ON COLUMN public.health_checks.tenant_id IS 'ID del tenant (NULL para health checks globales del sistema)';

