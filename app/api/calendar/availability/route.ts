import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getCalendarAvailability } from "@/lib/api/calendar"

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "No se pudo conectar con la base de datos" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get("propertyId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (!propertyId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Faltan parámetros: propertyId, startDate, endDate son requeridos" },
        { status: 400 }
      )
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

    const availability = await getCalendarAvailability(
      propertyId,
      tenantId,
      new Date(startDate),
      new Date(endDate)
    )

    return NextResponse.json(availability)
  } catch (error: any) {
    console.error("Error fetching calendar availability:", error)
    return NextResponse.json(
      { error: error?.message || "Error al obtener disponibilidad del calendario" },
      { status: 500 }
    )
  }
}

