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

    // Buscar el tipo de configuración "Estado de Movimiento"
    const configTypes = await getConfigurationTypes(tenantId, { includeCounts: false })
    const movementStatusConfig = configTypes.find(
      (type) =>
        type.name === "movement_status" ||
        type.name === "Estado de Movimiento" ||
        type.name === "Estados de Movimiento"
    )

    if (!movementStatusConfig) {
      return NextResponse.json([])
    }

    // Obtener los valores de estado de movimiento
    const movementStatuses = await getConfigurationValues(movementStatusConfig.id)

    return NextResponse.json(movementStatuses)
  } catch (error: any) {
    console.error("Error in /api/configuration/movement-statuses:", error)
    return NextResponse.json(
      { error: error.message || "Error al obtener los estados de movimiento" },
      { status: 500 }
    )
  }
}

