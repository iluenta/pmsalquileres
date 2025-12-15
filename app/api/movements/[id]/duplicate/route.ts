import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { duplicateMovement } from "@/lib/api/movements"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params
    const body = await request.json()
    
    // Validar que newDate esté presente
    if (!body.newDate) {
      return NextResponse.json(
        { error: "La fecha (newDate) es requerida" },
        { status: 400 }
      )
    }

    // Validar formato de fecha
    const newDate = new Date(body.newDate)
    if (isNaN(newDate.getTime())) {
      return NextResponse.json(
        { error: "Fecha inválida" },
        { status: 400 }
      )
    }

    // Formatear fecha a YYYY-MM-DD
    const formattedDate = newDate.toISOString().split('T')[0]

    const duplicatedMovement = await duplicateMovement(id, formattedDate, tenantId)

    if (!duplicatedMovement) {
      return NextResponse.json(
        { error: "Error al duplicar el movimiento" },
        { status: 500 }
      )
    }

    return NextResponse.json(duplicatedMovement, { status: 201 })
  } catch (error: any) {
    console.error("Error in /api/movements/[id]/duplicate POST:", error)
    return NextResponse.json(
      { error: error.message || "Error al duplicar el movimiento" },
      { status: 500 }
    )
  }
}

