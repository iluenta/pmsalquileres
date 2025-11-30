import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import {
  updatePropertyReview,
  deletePropertyReview,
  approvePropertyReview,
  rejectPropertyReview,
} from "@/lib/api/property-reviews"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  try {
    const { id, reviewId } = await params
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
    const review = await updatePropertyReview(reviewId, body, tenantId)

    return NextResponse.json(review)
  } catch (error: any) {
    console.error("[PUT /api/properties/[id]/reviews/[reviewId]] Error:", error)
    return NextResponse.json(
      { error: error.message || "Error al actualizar reseña" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  try {
    const { id, reviewId } = await params
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

    await deletePropertyReview(reviewId, tenantId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[DELETE /api/properties/[id]/reviews/[reviewId]] Error:", error)
    return NextResponse.json(
      { error: error.message || "Error al eliminar reseña" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  try {
    const { id, reviewId } = await params
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
    const { action } = body

    let review
    if (action === "approve") {
      review = await approvePropertyReview(reviewId, tenantId)
    } else if (action === "reject") {
      review = await rejectPropertyReview(reviewId, tenantId)
    } else {
      return NextResponse.json({ error: "Acción inválida" }, { status: 400 })
    }

    return NextResponse.json(review)
  } catch (error: any) {
    console.error("[PATCH /api/properties/[id]/reviews/[reviewId]] Error:", error)
    return NextResponse.json(
      { error: error.message || "Error al actualizar reseña" },
      { status: 500 }
    )
  }
}


