import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { addPersonContact } from "@/lib/api/persons"

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
    const contact = await addPersonContact(id, body, tenantId)

    if (!contact) {
      return NextResponse.json(
        { error: "Error al añadir el contacto" },
        { status: 500 }
      )
    }

    return NextResponse.json(contact, { status: 201 })
  } catch (error: any) {
    console.error("Error in /api/persons/[id]/contacts POST:", error)
    return NextResponse.json(
      { error: error.message || "Error al añadir el contacto" },
      { status: 500 }
    )
  }
}

