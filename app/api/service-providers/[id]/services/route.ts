import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getServiceProviderServices, addServiceToProvider } from "@/lib/api/service-providers"
import type { CreateServiceProviderServiceData } from "@/types/service-providers"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: Request, { params }: RouteParams) {
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
    const { id } = await params

    const services = await getServiceProviderServices(id, tenantId)

    return NextResponse.json(services)
  } catch (error: any) {
    console.error("Error in /api/service-providers/[id]/services GET:", error)
    return NextResponse.json(
      { error: error.message || "Error al obtener los servicios del proveedor" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, { params }: RouteParams) {
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
    const { id } = await params

    const body: CreateServiceProviderServiceData = await request.json()

    // Validaciones
    if (!body.service_type_id) {
      return NextResponse.json({ error: "El tipo de servicio es obligatorio" }, { status: 400 })
    }

    if (!body.price_type || !['fixed', 'percentage'].includes(body.price_type)) {
      return NextResponse.json({ error: "El tipo de precio debe ser 'fixed' o 'percentage'" }, { status: 400 })
    }

    if (body.price === undefined || body.price === null) {
      return NextResponse.json({ error: "El precio es obligatorio" }, { status: 400 })
    }

    if (body.price_type === 'percentage' && (body.price < 0 || body.price > 100)) {
      return NextResponse.json({ error: "El porcentaje debe estar entre 0 y 100" }, { status: 400 })
    }

    if (body.price_type === 'fixed' && body.price < 0) {
      return NextResponse.json({ error: "El precio fijo debe ser mayor o igual a 0" }, { status: 400 })
    }

    const service = await addServiceToProvider(id, body, tenantId)

    if (!service) {
      return NextResponse.json({ error: "Error al añadir el servicio al proveedor" }, { status: 500 })
    }

    return NextResponse.json(service, { status: 201 })
  } catch (error: any) {
    console.error("Error in /api/service-providers/[id]/services POST:", error)
    return NextResponse.json(
      { error: error.message || "Error al añadir el servicio al proveedor" },
      { status: 500 }
    )
  }
}

