import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getMovements, createMovement } from "@/lib/api/movements"

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "No supabase client" }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userInfo } = await supabase.rpc("get_user_info", {
      p_user_id: user.id,
    })

    if (!userInfo || userInfo.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const tenantId = userInfo[0].tenant_id

    // Obtener parámetros de búsqueda de la URL
    const { searchParams } = new URL(request.url)
    const movementType = searchParams.get("movementType") || undefined
    const movementStatus = searchParams.get("movementStatus") || undefined
    const bookingId = searchParams.get("bookingId") || undefined
    const serviceProviderId = searchParams.get("serviceProviderId") || undefined
    const treasuryAccountId = searchParams.get("treasuryAccountId") || undefined
    const dateFrom = searchParams.get("dateFrom") || undefined
    const dateTo = searchParams.get("dateTo") || undefined

    const movements = await getMovements(tenantId, {
      movementType,
      movementStatus,
      bookingId,
      serviceProviderId,
      treasuryAccountId,
      dateFrom,
      dateTo,
      includeInactive: true,
    })

    return NextResponse.json(movements)
  } catch (error: any) {
    console.error("Error in /api/movements GET:", error)
    return NextResponse.json(
      { error: error.message || "Error al obtener los movimientos" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "No supabase client" }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userInfo } = await supabase.rpc("get_user_info", {
      p_user_id: user.id,
    })

    if (!userInfo || userInfo.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const tenantId = userInfo[0].tenant_id
    const body = await request.json()
    const movement = await createMovement(body, tenantId)

    if (!movement) {
      return NextResponse.json(
        { error: "Error al crear el movimiento" },
        { status: 500 }
      )
    }

    return NextResponse.json(movement, { status: 201 })
  } catch (error: any) {
    console.error("Error in /api/movements POST:", error)
    return NextResponse.json(
      { error: error.message || "Error al crear el movimiento" },
      { status: 500 }
    )
  }
}

