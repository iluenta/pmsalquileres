import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getMovementById, updateMovement, deleteMovement } from "@/lib/api/movements"

export async function GET(
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
    const movement = await getMovementById(id, tenantId)

    if (!movement) {
      return NextResponse.json({ error: "Movimiento no encontrado" }, { status: 404 })
    }

    return NextResponse.json(movement)
  } catch (error: any) {
    console.error("Error in /api/movements/[id] GET:", error)
    return NextResponse.json(
      { error: error.message || "Error al obtener el movimiento" },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const movement = await updateMovement(id, body, tenantId)

    if (!movement) {
      return NextResponse.json(
        { error: "Error al actualizar el movimiento" },
        { status: 500 }
      )
    }

    return NextResponse.json(movement)
  } catch (error: any) {
    console.error("Error in /api/movements/[id] PUT:", error)
    return NextResponse.json(
      { error: error.message || "Error al actualizar el movimiento" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    const success = await deleteMovement(id, tenantId)

    if (!success) {
      return NextResponse.json(
        { error: "Error al eliminar el movimiento" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in /api/movements/[id] DELETE:", error)
    return NextResponse.json(
      { error: error.message || "Error al eliminar el movimiento" },
      { status: 500 }
    )
  }
}

