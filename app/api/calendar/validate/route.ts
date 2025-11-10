import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { validateBookingAvailability } from "@/lib/api/calendar"

export async function POST(request: Request) {
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

    const body = await request.json()
    const { propertyId, checkIn, checkOut, bookingId } = body

    if (!propertyId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Faltan parámetros: propertyId, checkIn, checkOut son requeridos" },
        { status: 400 }
      )
    }

    // Obtener el tipo de reserva del body si está presente
    const bookingType = body.bookingType as 'commercial' | 'closed_period' | undefined

    const result = await validateBookingAvailability(
      propertyId,
      tenantId,
      checkIn,
      checkOut,
      bookingId,
      bookingType
    )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error validating availability:", error)
    return NextResponse.json(
      { error: error?.message || "Error al validar disponibilidad" },
      { status: 500 }
    )
  }
}

