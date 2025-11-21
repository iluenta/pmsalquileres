import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getSalesChannelById, updateSalesChannel, deleteSalesChannel } from "@/lib/api/sales-channels"
import type { UpdateSalesChannelData } from "@/types/sales-channels"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "No supabase client" }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userInfo } = await supabase
      .from("users")
      .select("tenant_id")
      .eq("id", user.id)
      .single()

    if (!userInfo) {
      return NextResponse.json({ error: "User info not found" }, { status: 404 })
    }

    const channel = await getSalesChannelById(id, userInfo.tenant_id)

    if (!channel) {
      return NextResponse.json({ error: "Canal no encontrado" }, { status: 404 })
    }

    return NextResponse.json(channel)
  } catch (error) {
    console.error("Error in sales-channels GET by id:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "No supabase client" }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userInfo } = await supabase
      .from("users")
      .select("tenant_id")
      .eq("id", user.id)
      .single()

    if (!userInfo) {
      return NextResponse.json({ error: "User info not found" }, { status: 404 })
    }

    const body: UpdateSalesChannelData = await request.json()

    const channel = await updateSalesChannel(id, body, userInfo.tenant_id)

    if (!channel) {
      return NextResponse.json(
        { error: "Error al actualizar el canal de venta" },
        { status: 500 }
      )
    }

    return NextResponse.json(channel)
  } catch (error: any) {
    console.error("Error in sales-channels PUT:", error)
    
    let errorMessage = "Error interno del servidor"
    
    if (error?.message) {
      errorMessage = error.message
    } else if (error?.error?.message) {
      errorMessage = error.error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "No supabase client" }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userInfo } = await supabase
      .from("users")
      .select("tenant_id")
      .eq("id", user.id)
      .single()

    if (!userInfo) {
      return NextResponse.json({ error: "User info not found" }, { status: 404 })
    }

    const success = await deleteSalesChannel(id, userInfo.tenant_id)

    if (!success) {
      return NextResponse.json(
        { error: "Error al eliminar el canal de venta" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in sales-channels DELETE:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

