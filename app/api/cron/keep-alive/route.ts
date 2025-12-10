import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import type { CreateHealthCheckData } from "@/types/health-checks"

/**
 * Endpoint de keep-alive para mantener Supabase activo
 * Este endpoint es llamado por Vercel Cron Jobs diariamente
 * para evitar que la base de datos se suspenda automáticamente
 * Registra cada ejecución en la tabla health_checks para auditoría
 */
export async function GET(request: Request) {
  const startTime = Date.now()
  let healthCheckId: string | null = null
  const queryExecuted = "SELECT id FROM tenants LIMIT 1"

  try {
    // Validar que la petición viene de Vercel Cron
    // Vercel Cron envía automáticamente el User-Agent "vercel-cron/1.0"
    const userAgent = request.headers.get("user-agent") || ""
    const vercelSignature = request.headers.get("x-vercel-signature")
    const isVercelCron = userAgent.includes("vercel-cron")
    
    // En producción, validar que viene de Vercel Cron
    if (process.env.NODE_ENV === "production") {
      // Verificar User-Agent (más confiable) o x-vercel-signature
      if (!isVercelCron && !vercelSignature) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }
    }
    
    // Si hay CRON_SECRET configurado, también validarlo (opcional, para seguridad adicional)
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
      const authHeader = request.headers.get("authorization")
      if (authHeader && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }
    }

    // Ejecutar una consulta simple y rápida a Supabase
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      // Registrar error en health_checks
      try {
        const adminClient = getSupabaseAdmin()
        const healthCheckData: CreateHealthCheckData = {
          status: "error",
          response_time_ms: Date.now() - startTime,
          error_message: "No supabase client available",
          error_code: "NO_CLIENT",
          query_executed: queryExecuted,
          database_connected: false,
          tenant_id: null,
        }
        const { data: healthData } = await adminClient
          .from("health_checks")
          .insert(healthCheckData as any)
          .select("id")
          .single() as { data: { id: string } | null } | { data: null }
        
        healthCheckId = (healthData as { id: string } | null)?.id || null
      } catch (auditError) {
        console.error("Error writing to health_checks:", auditError)
      }

      return NextResponse.json(
        { 
          error: "No supabase client available",
          health_check_id: healthCheckId
        },
        { status: 500 }
      )
    }

    // Consulta mínima: obtener el primer tenant (solo para mantener la conexión activa)
    const { data, error } = await supabase
      .from("tenants")
      .select("id")
      .limit(1)
      .single()

    const responseTime = Date.now() - startTime
    let status: "success" | "error" = "success"
    let errorMessage: string | null = null
    let errorCode: string | null = null
    let databaseConnected = true

    if (error && error.code !== "PGRST116") {
      // PGRST116 es "no rows returned", que es aceptable
      status = "error"
      errorMessage = error.message
      errorCode = error.code || null
      console.error("Error in keep-alive query:", error)
    }

    // Registrar en tabla de auditoría usando service role client
    try {
      const adminClient = getSupabaseAdmin()
      const healthCheckData: CreateHealthCheckData = {
        status,
        response_time_ms: responseTime,
        error_message: errorMessage,
        error_code: errorCode,
        query_executed: queryExecuted,
        database_connected: databaseConnected,
        tenant_id: null, // Health checks globales del sistema
      }
      const { data: healthData, error: healthError } = await adminClient
        .from("health_checks")
        .insert(healthCheckData as any)
        .select("id")
        .single() as { data: { id: string } | null; error: any } | { data: null; error: any }

      if (healthError) {
        console.error("Error writing to health_checks:", healthError)
      } else {
        healthCheckId = (healthData as { id: string } | null)?.id || null
      }
    } catch (auditError: any) {
      console.error("Error writing to health_checks:", auditError)
    }

    // Si hubo error en la consulta original, retornar error
    if (status === "error") {
      return NextResponse.json(
        { 
          error: "Database query failed",
          message: errorMessage,
          health_check_id: healthCheckId,
          response_time_ms: responseTime
        },
        { status: 500 }
      )
    }

    // Retornar éxito
    return NextResponse.json(
      { 
        success: true,
        message: "Keep-alive executed successfully",
        timestamp: new Date().toISOString(),
        hasData: !!data,
        health_check_id: healthCheckId,
        response_time_ms: responseTime
      },
      { status: 200 }
    )
  } catch (error: any) {
    const responseTime = Date.now() - startTime
    console.error("Error in keep-alive endpoint:", error)

    // Intentar registrar el error en health_checks
    try {
      const adminClient = getSupabaseAdmin()
      const healthCheckData: CreateHealthCheckData = {
        status: "error",
        response_time_ms: responseTime,
        error_message: error.message || "Internal server error",
        error_code: "INTERNAL_ERROR",
        query_executed: queryExecuted,
        database_connected: false,
        tenant_id: null,
      }
      const { data: healthData } = await adminClient
        .from("health_checks")
        .insert(healthCheckData as any)
        .select("id")
        .single() as { data: { id: string } | null } | { data: null }
      
      healthCheckId = (healthData as { id: string } | null)?.id || null
    } catch (auditError) {
      console.error("Error writing to health_checks:", auditError)
    }

    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error.message,
        health_check_id: healthCheckId,
        response_time_ms: responseTime
      },
      { status: 500 }
    )
  }
}

