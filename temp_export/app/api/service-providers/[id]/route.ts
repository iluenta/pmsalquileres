import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getServiceProviderById, updateServiceProvider, deleteServiceProvider } from "@/lib/api/service-providers"
import type { UpdateServiceProviderData } from "@/types/service-providers"

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

    const provider = await getServiceProviderById(id, tenantId)

    if (!provider) {
      return NextResponse.json({ error: "Proveedor de servicios no encontrado" }, { status: 404 })
    }

    return NextResponse.json(provider)
  } catch (error: any) {
    console.error("Error in /api/service-providers/[id] GET:", error)
    return NextResponse.json(
      { error: error.message || "Error al obtener el proveedor de servicios" },
      { status: 500 }
    )
  }
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
    const { id } = await params

    const body: UpdateServiceProviderData = await request.json()

    const provider = await updateServiceProvider(id, body, tenantId)

    if (!provider) {
      return NextResponse.json({ error: "Error al actualizar el proveedor de servicios" }, { status: 500 })
    }

    return NextResponse.json(provider)
  } catch (error: any) {
    console.error("Error in /api/service-providers/[id] PUT:", error)
    return NextResponse.json(
      { error: error.message || "Error al actualizar el proveedor de servicios" },
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
    const { id } = await params

    const success = await deleteServiceProvider(id, tenantId)

    if (!success) {
      return NextResponse.json({ error: "Error al eliminar el proveedor de servicios" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in /api/service-providers/[id] DELETE:", error)
    return NextResponse.json(
      { error: error.message || "Error al eliminar el proveedor de servicios" },
      { status: 500 }
    )
  }
}

