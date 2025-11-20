import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import {
  getKPIs,
  getRevenueData,
  getOccupancyData,
  getChannelData,
  getExpenseData,
  getExpensesByProperty,
  getProfitabilityData,
  getBookingAnalytics,
  getMonthlyComparison,
} from "@/lib/api/reports"
import type { ReportsFilters } from "@/types/reports"

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

    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get("year")
    const year = yearParam === "all" || !yearParam ? null : parseInt(yearParam, 10)
    
    const dateFrom = searchParams.get("dateFrom") || undefined
    const dateTo = searchParams.get("dateTo") || undefined
    const propertyId = searchParams.get("propertyId") || undefined
    const channelId = searchParams.get("channelId") || undefined
    const compareYearParam = searchParams.get("compareYear")
    const compareYear = compareYearParam ? parseInt(compareYearParam, 10) : undefined
    const compareEnabled = searchParams.get("compareEnabled") === "true"

    const filters: ReportsFilters = {
      year: year || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      propertyId: propertyId || undefined,
      channelId: channelId || undefined,
      compareYear: compareEnabled && compareYear ? compareYear : undefined,
      compareEnabled,
    }

    // Obtener todos los datos en paralelo
    const [
      kpis,
      revenue,
      occupancy,
      channels,
      expenses,
      expensesByProperty,
      profitability,
      bookings,
      monthlyComparisonRevenue,
      monthlyComparisonBookings,
      monthlyComparisonOccupancy,
    ] = await Promise.all([
      getKPIs(tenantId, filters),
      getRevenueData(tenantId, filters),
      getOccupancyData(tenantId, filters),
      getChannelData(tenantId, filters),
      getExpenseData(tenantId, filters),
      getExpensesByProperty(tenantId, filters),
      getProfitabilityData(tenantId, filters),
      getBookingAnalytics(tenantId, filters),
      compareEnabled ? getMonthlyComparison(tenantId, filters, "revenue") : Promise.resolve([]),
      compareEnabled ? getMonthlyComparison(tenantId, filters, "bookings") : Promise.resolve([]),
      compareEnabled ? getMonthlyComparison(tenantId, filters, "occupancy") : Promise.resolve([]),
    ])

    return NextResponse.json({
      kpis,
      revenue,
      occupancy,
      channels,
      expenses,
      expensesByProperty,
      profitability,
      bookings,
      monthlyComparison: {
        revenue: monthlyComparisonRevenue,
        bookings: monthlyComparisonBookings,
        occupancy: monthlyComparisonOccupancy,
      },
    })
  } catch (error: any) {
    console.error("Error in /api/reports:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

