import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { updateProviderService, removeServiceFromProvider } from "@/lib/api/service-providers"
import type { UpdateServiceProviderServiceData } from "@/types/service-providers"

interface RouteParams {
  params: Promise<{
    serviceId: string
  }>
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "No se pudo conectar con la base de datos" }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { data: userInfo } = await supabase.rpc("get_user_info", {
      p_user_id: user.id,
    })

    if (!userInfo || userInfo.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const tenantId = userInfo[0].tenant_id
    const { serviceId } = await params

    const body: UpdateServiceProviderServiceData = await request.json()

    // Validaciones si se actualiza el precio
    if (body.price !== undefined) {
      const priceType = body.price_type
      if (priceType === 'percentage' && (body.price < 0 || body.price > 100)) {
        return NextResponse.json({ error: "El porcentaje debe estar entre 0 y 100" }, { status: 400 })
      }
      if (priceType === 'fixed' && body.price < 0) {
        return NextResponse.json({ error: "El precio fijo debe ser mayor o igual a 0" }, { status: 400 })
      }
    }

    const service = await updateProviderService(serviceId, body, tenantId)

    if (!service) {
      return NextResponse.json({ error: "Error al actualizar el servicio" }, { status: 500 })
    }

    return NextResponse.json(service)
  } catch (error: any) {
    console.error("Error in /api/service-providers/services/[serviceId] PUT:", error)
    return NextResponse.json(
      { error: error.message || "Error al actualizar el servicio" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "No se pudo conectar con la base de datos" }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { data: userInfo } = await supabase.rpc("get_user_info", {
      p_user_id: user.id,
    })

    if (!userInfo || userInfo.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const tenantId = userInfo[0].tenant_id
    const { serviceId } = await params

    const success = await removeServiceFromProvider(serviceId, tenantId)

    if (!success) {
      return NextResponse.json({ error: "Error al eliminar el servicio" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in /api/service-providers/services/[serviceId] DELETE:", error)
    return NextResponse.json(
      { error: error.message || "Error al eliminar el servicio" },
      { status: 500 }
    )
  }
}

