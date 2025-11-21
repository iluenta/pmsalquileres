import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getUnpaidBookings } from "@/lib/api/bookings"

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
      return NextResponse.json({ error: "User info not found" }, { status: 404 })
    }

    const tenantId = userInfo[0].tenant_id
    const bookings = await getUnpaidBookings(tenantId)

    return NextResponse.json(bookings)
  } catch (error: any) {
    console.error("Error in /api/bookings/unpaid:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

