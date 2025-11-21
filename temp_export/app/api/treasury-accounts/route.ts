import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getTreasuryAccounts, createTreasuryAccount } from "@/lib/api/treasury-accounts"

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

    const { data: userInfo } = await supabase.rpc("get_user_info", {
      p_user_id: user.id,
    })

    if (!userInfo || userInfo.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const tenantId = userInfo[0].tenant_id
    const accounts = await getTreasuryAccounts(tenantId, { includeInactive: true })

    return NextResponse.json(accounts)
  } catch (error: any) {
    console.error("Error in /api/treasury-accounts GET:", error)
    return NextResponse.json(
      { error: error.message || "Error al obtener las cuentas de tesorería" },
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

    const { data: userInfo } = await supabase.rpc("get_user_info", {
      p_user_id: user.id,
    })

    if (!userInfo || userInfo.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const tenantId = userInfo[0].tenant_id
    const body = await request.json()
    const account = await createTreasuryAccount(body, tenantId)

    if (!account) {
      return NextResponse.json(
        { error: "Error al crear la cuenta de tesorería" },
        { status: 500 }
      )
    }

    return NextResponse.json(account, { status: 201 })
  } catch (error: any) {
    console.error("Error in /api/treasury-accounts POST:", error)
    return NextResponse.json(
      { error: error.message || "Error al crear la cuenta de tesorería" },
      { status: 500 }
    )
  }
}

