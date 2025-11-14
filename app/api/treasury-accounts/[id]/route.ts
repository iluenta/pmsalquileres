import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getTreasuryAccountById, updateTreasuryAccount, deleteTreasuryAccount } from "@/lib/api/treasury-accounts"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "No supabase client" }, { status: 500 })
    }

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
    const { id } = await params
    const account = await getTreasuryAccountById(id, tenantId)

    if (!account) {
      return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 })
    }

    return NextResponse.json(account)
  } catch (error: any) {
    console.error("Error in /api/treasury-accounts/[id] GET:", error)
    return NextResponse.json(
      { error: error.message || "Error al obtener la cuenta de tesorería" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "No supabase client" }, { status: 500 })
    }

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
    const { id } = await params
    const body = await request.json()
    const account = await updateTreasuryAccount(id, body, tenantId)

    if (!account) {
      return NextResponse.json(
        { error: "Error al actualizar la cuenta de tesorería" },
        { status: 500 }
      )
    }

    return NextResponse.json(account)
  } catch (error: any) {
    console.error("Error in /api/treasury-accounts/[id] PUT:", error)
    return NextResponse.json(
      { error: error.message || "Error al actualizar la cuenta de tesorería" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "No supabase client" }, { status: 500 })
    }

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
    const { id } = await params
    const success = await deleteTreasuryAccount(id, tenantId)

    if (!success) {
      return NextResponse.json(
        { error: "Error al eliminar la cuenta de tesorería" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in /api/treasury-accounts/[id] DELETE:", error)
    return NextResponse.json(
      { error: error.message || "Error al eliminar la cuenta de tesorería" },
      { status: 500 }
    )
  }
}

