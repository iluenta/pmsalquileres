import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import {
  updatePropertyPricingPlan,
  deletePropertyPricingPlan,
} from "@/lib/api/property-pricing-plans"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; planId: string }> }
) {
  try {
    const { id, planId } = await params
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
    const plan = await updatePropertyPricingPlan(planId, body, tenantId)

    return NextResponse.json(plan)
  } catch (error: any) {
    console.error("[PUT /api/properties/[id]/pricing-plans/[planId]] Error:", error)
    return NextResponse.json(
      { error: error.message || "Error al actualizar plan de precios" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; planId: string }> }
) {
  try {
    const { id, planId } = await params
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

    await deletePropertyPricingPlan(planId, tenantId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[DELETE /api/properties/[id]/pricing-plans/[planId]] Error:", error)
    return NextResponse.json(
      { error: error.message || "Error al eliminar plan de precios" },
      { status: 500 }
    )
  }
}


