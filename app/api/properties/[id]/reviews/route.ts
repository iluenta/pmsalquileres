import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import {
  getPropertyReviews,
  createPropertyReview,
} from "@/lib/api/property-reviews"

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

    // Obtener parámetros de búsqueda
    const { searchParams } = new URL(request.url)
    const includeUnapproved = searchParams.get("includeUnapproved") === "true"

    const reviews = await getPropertyReviews(id, tenantId, includeUnapproved)

    return NextResponse.json(reviews)
  } catch (error: any) {
    console.error("[GET /api/properties/[id]/reviews] Error:", error)
    return NextResponse.json(
      { error: error.message || "Error al obtener reseñas" },
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
    const review = await createPropertyReview(
      {
        ...body,
        property_id: id,
        tenant_id: tenantId,
      },
      user.id
    )

    return NextResponse.json(review, { status: 201 })
  } catch (error: any) {
    console.error("[POST /api/properties/[id]/reviews] Error:", error)
    return NextResponse.json(
      { error: error.message || "Error al crear reseña" },
      { status: 500 }
    )
  }
}


