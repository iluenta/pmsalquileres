import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getConfigurationTypes, getConfigurationValues } from "@/lib/api/configuration"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "No se pudo conectar con la base de datos" }, { status: 500 })
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

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

    // Obtener tipos de configuración
    const configTypes = await getConfigurationTypes(tenantId)
    const bookingTypeConfig = configTypes.find(
      (t) =>
        t.name === "Tipo de Reserva" ||
        t.name === "Booking Type" ||
        t.name === "Tipos de Reserva"
    )

    if (!bookingTypeConfig) {
      return NextResponse.json([])
    }

    // Obtener valores de tipo de reserva
    const bookingTypes = await getConfigurationValues(bookingTypeConfig.id)

    return NextResponse.json(bookingTypes)
  } catch (error) {
    console.error("Error fetching booking types:", error)
    return NextResponse.json(
      { error: "Error al obtener tipos de reserva" },
      { status: 500 }
    )
  }
}

