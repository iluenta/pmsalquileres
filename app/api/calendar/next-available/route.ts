import { NextResponse } from "next/server"
import { getNextAvailablePeriods } from "@/lib/api/calendar"
import { getSupabaseServerClient } from "@/lib/supabase/server"

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
    const propertyId = searchParams.get("propertyId")

    if (!propertyId) {
      return NextResponse.json({ error: "Missing propertyId parameter" }, { status: 400 })
    }

    const periods = await getNextAvailablePeriods(propertyId, tenantId)

    // Convertir fechas a strings ISO para la respuesta JSON
    const periodsResponse = periods.map(period => ({
      checkIn: period.checkIn.toISOString(),
      checkOut: period.checkOut.toISOString(),
      nights: period.nights
    }))

    return NextResponse.json(periodsResponse)
  } catch (error: any) {
    console.error("Error in /api/calendar/next-available:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}


