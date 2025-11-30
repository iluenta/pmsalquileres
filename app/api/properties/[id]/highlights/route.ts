import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import {
  getPropertyHighlights,
  createPropertyHighlight,
} from "@/lib/api/property-highlights"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await getSupabaseServerClient()

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

    const highlights = await getPropertyHighlights(id, tenantId)

    return NextResponse.json(highlights)
  } catch (error: any) {
    console.error("[GET /api/properties/[id]/highlights] Error:", error)
    return NextResponse.json(
      { error: error.message || "Error al obtener highlights" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await getSupabaseServerClient()

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
    const highlight = await createPropertyHighlight({
      ...body,
      property_id: id,
      tenant_id: tenantId,
    })

    return NextResponse.json(highlight, { status: 201 })
  } catch (error: any) {
    console.error("[POST /api/properties/[id]/highlights] Error:", error)
    return NextResponse.json(
      { error: error.message || "Error al crear highlight" },
      { status: 500 }
    )
  }
}


