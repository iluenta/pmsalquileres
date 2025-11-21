import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { updatePersonContact, deletePersonContact } from "@/lib/api/persons"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ contactId: string }> }
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

    const { contactId } = await params
    const body = await request.json()
    const contact = await updatePersonContact(contactId, body, tenantId)

    if (!contact) {
      return NextResponse.json(
        { error: "Error al actualizar el contacto" },
        { status: 500 }
      )
    }

    return NextResponse.json(contact)
  } catch (error: any) {
    console.error("Error in /api/persons/contacts/[contactId] PUT:", error)
    return NextResponse.json(
      { error: error.message || "Error al actualizar el contacto" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ contactId: string }> }
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

    const { contactId } = await params
    const success = await deletePersonContact(contactId, tenantId)

    if (!success) {
      return NextResponse.json(
        { error: "Error al eliminar el contacto" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in /api/persons/contacts/[contactId] DELETE:", error)
    return NextResponse.json(
      { error: error.message || "Error al eliminar el contacto" },
      { status: 500 }
    )
  }
}

