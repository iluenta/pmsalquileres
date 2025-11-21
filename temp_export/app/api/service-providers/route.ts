import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getServiceProviders, createServiceProvider } from "@/lib/api/service-providers"
import type { CreateServiceProviderData } from "@/types/service-providers"

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get("includeInactive") === "true"

    const providers = await getServiceProviders(tenantId, includeInactive)

    return NextResponse.json(providers)
  } catch (error: any) {
    console.error("Error in /api/service-providers:", error)
    return NextResponse.json(
      { error: error.message || "Error al obtener los proveedores de servicios" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

    const body: CreateServiceProviderData = await request.json()

    // Validaciones básicas
    if (!body.full_name || body.full_name.trim() === "") {
      return NextResponse.json({ error: "El nombre completo es obligatorio" }, { status: 400 })
    }

    const provider = await createServiceProvider(body, tenantId)

    if (!provider) {
      return NextResponse.json({ error: "Error al crear el proveedor de servicios" }, { status: 500 })
    }

    return NextResponse.json(provider, { status: 201 })
  } catch (error: any) {
    console.error("Error in /api/service-providers POST:", error)
    return NextResponse.json(
      { error: error.message || "Error al crear el proveedor de servicios" },
      { status: 500 }
    )
  }
}

