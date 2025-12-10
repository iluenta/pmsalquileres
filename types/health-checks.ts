/**
 * Tipos para la tabla health_checks
 * Tabla de auditoría para registrar sondas de salud de Supabase
 */

export interface HealthCheck {
  id: string
  status: "success" | "error"
  response_time_ms: number
  error_message: string | null
  error_code: string | null
  query_executed: string
  database_connected: boolean
  tenant_id: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface CreateHealthCheckData {
  status: "success" | "error"
  response_time_ms: number
  error_message?: string | null
  error_code?: string | null
  query_executed: string
  database_connected: boolean
  tenant_id?: string | null
  created_by?: string | null
}

