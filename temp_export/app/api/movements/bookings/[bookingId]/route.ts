import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getBookingPayments, calculateBookingPaymentInfo } from "@/lib/api/movements"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
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
    const { bookingId } = await params
    
    const payments = await getBookingPayments(bookingId, tenantId)
    const paymentInfo = await calculateBookingPaymentInfo(bookingId, tenantId)

    return NextResponse.json({
      payments,
      paymentInfo,
    })
  } catch (error: any) {
    console.error("Error in /api/movements/bookings/[bookingId] GET:", error)
    return NextResponse.json(
      { error: error.message || "Error al obtener los pagos de la reserva" },
      { status: 500 }
    )
  }
}

