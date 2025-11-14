import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

/**
 * Endpoint de keep-alive para mantener Supabase activo
 * Este endpoint es llamado por Vercel Cron Jobs diariamente
 * para evitar que la base de datos se suspenda automáticamente
 */
export async function GET(request: Request) {
  try {
    // Validar que la petición viene de Vercel Cron
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET
    
    // Si hay un CRON_SECRET configurado, validarlo
    if (cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }
    } else {
      // Si no hay CRON_SECRET, validar que viene de Vercel usando el header x-vercel-signature
      const vercelSignature = request.headers.get("x-vercel-signature")
      if (!vercelSignature) {
        // En desarrollo, permitir sin validación
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
          )
        }
      }
    }

    // Ejecutar una consulta simple y rápida a Supabase
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json(
        { error: "No supabase client available" },
        { status: 500 }
      )
    }

    // Consulta mínima: obtener el primer tenant (solo para mantener la conexión activa)
    const { data, error } = await supabase
      .from("tenants")
      .select("id")
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 es "no rows returned", que es aceptable
      console.error("Error in keep-alive query:", error)
      return NextResponse.json(
        { 
          error: "Database query failed",
          message: error.message 
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
        hasData: !!data
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error in keep-alive endpoint:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error.message 
      },
      { status: 500 }
    )
  }
}

