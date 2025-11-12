import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { updatePersonAddress, deletePersonAddress } from "@/lib/api/persons"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ addressId: string }> }
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

    const { addressId } = await params
    const body = await request.json()
    const address = await updatePersonAddress(addressId, body, tenantId)

    if (!address) {
      return NextResponse.json(
        { error: "Error al actualizar la dirección" },
        { status: 500 }
      )
    }

    return NextResponse.json(address)
  } catch (error: any) {
    console.error("Error in /api/persons/addresses/[addressId] PUT:", error)
    return NextResponse.json(
      { error: error.message || "Error al actualizar la dirección" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ addressId: string }> }
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

    const { addressId } = await params
    const success = await deletePersonAddress(addressId, tenantId)

    if (!success) {
      return NextResponse.json(
        { error: "Error al eliminar la dirección" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in /api/persons/addresses/[addressId] DELETE:", error)
    return NextResponse.json(
      { error: error.message || "Error al eliminar la dirección" },
      { status: 500 }
    )
  }
}

