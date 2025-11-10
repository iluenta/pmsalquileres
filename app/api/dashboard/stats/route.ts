import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getDashboardStats, getRecentBookings, getPropertyOccupancy } from "@/lib/api/dashboard"

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get("year")
    const year = yearParam === "all" || !yearParam ? null : parseInt(yearParam, 10)

    const [stats, recentBookings, propertyOccupancy] = await Promise.all([
      getDashboardStats(tenantId, year),
      getRecentBookings(tenantId, 5, year),
      getPropertyOccupancy(tenantId, 5, year),
    ])

    return NextResponse.json({
      stats,
      recentBookings,
      propertyOccupancy,
    })
  } catch (error: any) {
    console.error("Error in /api/dashboard/stats:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

