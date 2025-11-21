import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getSalesChannels, createSalesChannel } from "@/lib/api/sales-channels"
import type { CreateSalesChannelData } from "@/types/sales-channels"

export async function GET() {
  try {
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

    const channels = await getSalesChannels(userInfo.tenant_id)

    return NextResponse.json(channels)
  } catch (error) {
    console.error("Error in sales-channels GET:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
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

    const body: CreateSalesChannelData = await request.json()

    const channel = await createSalesChannel(body, userInfo.tenant_id)

    if (!channel) {
      return NextResponse.json(
        { error: "Error al crear el canal de venta" },
        { status: 500 }
      )
    }

    return NextResponse.json(channel, { status: 201 })
  } catch (error: any) {
    console.error("Error in sales-channels POST:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

