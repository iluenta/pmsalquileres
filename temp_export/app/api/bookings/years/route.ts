import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

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

    // Obtener todos los años únicos de las reservas (check_in_date y check_out_date)
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("check_in_date, check_out_date")
      .eq("tenant_id", tenantId)

    if (error) {
      console.error("Error fetching booking years:", error)
      return NextResponse.json({ error: "Error fetching years" }, { status: 500 })
    }

    // Extraer años únicos de check_in_date y check_out_date
    const years = new Set<number>()

    ;(bookings || []).forEach((booking: any) => {
      if (booking.check_in_date) {
        const year = new Date(booking.check_in_date).getFullYear()
        years.add(year)
      }
      if (booking.check_out_date) {
        const year = new Date(booking.check_out_date).getFullYear()
        years.add(year)
      }
    })

    // Convertir a array y ordenar descendente
    const yearsArray = Array.from(years).sort((a, b) => b - a)

    // Si no hay años, incluir al menos el año actual
    if (yearsArray.length === 0) {
      yearsArray.push(new Date().getFullYear())
    }

    return NextResponse.json(yearsArray)
  } catch (error: any) {
    console.error("Error in /api/bookings/years:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

