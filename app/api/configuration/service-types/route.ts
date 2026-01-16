import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getConfigurationTypes, getConfigurationValues } from "@/lib/api/configuration"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "No se pudo conectar con la base de datos" }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { data: userInfo } = await supabase.rpc("get_user_info", {
      p_user_id: user.id,
    })

    if (!userInfo || userInfo.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const tenantId = userInfo[0].tenant_id

    // Buscar el tipo de configuración "Tipo de Servicio"
    const configTypes = await getConfigurationTypes(tenantId, { includeCounts: false })
    const serviceTypeConfig = configTypes.find(
      (type) =>
        type.name === "service_type" ||
        type.name === "Tipo de Servicio" ||
        type.name === "Tipos de Servicio"
    )

    if (!serviceTypeConfig) {
      return NextResponse.json([])
    }

    // Obtener los valores de tipo de servicio
    const serviceTypes = await getConfigurationValues(serviceTypeConfig.id)

    return NextResponse.json(serviceTypes)
  } catch (error: any) {
    console.error("Error in /api/configuration/service-types:", error)
    return NextResponse.json(
      { error: error.message || "Error al obtener los tipos de servicio" },
      { status: 500 }
    )
  }
}

