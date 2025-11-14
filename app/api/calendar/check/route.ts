import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { checkAvailability } from "@/lib/api/calendar"

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
    const { propertyId, checkIn, checkOut, excludeBookingId, bookingType } = body

    if (!propertyId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Faltan parámetros: propertyId, checkIn, checkOut son requeridos" },
        { status: 400 }
      )
    }

    // Convertir strings a Date si es necesario
    const checkInDate = checkIn instanceof Date ? checkIn : new Date(checkIn)
    const checkOutDate = checkOut instanceof Date ? checkOut : new Date(checkOut)

    // Validar que las fechas sean válidas
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        { error: "Fechas inválidas" },
        { status: 400 }
      )
    }

    const result = await checkAvailability(
      propertyId,
      tenantId,
      checkInDate,
      checkOutDate,
      excludeBookingId,
      bookingType
    )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error checking availability:", error)
    return NextResponse.json(
      { 
        available: false,
        conflicts: [{
          booking: {} as any,
          conflictType: 'commercial' as const,
          message: error?.message || "Error al verificar disponibilidad"
        }]
      },
      { status: 500 }
    )
  }
}

