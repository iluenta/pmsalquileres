import { getSupabaseServerClient } from "@/lib/supabase/server"

export interface DashboardStats {
  totalProperties: number
  activeBookings: number
  totalGuests: number
  monthlyRevenue: number
  occupancyRate: number
  pendingPayments: number
}

export interface RecentBooking {
  id: string
  booking_code: string
  property_name: string
  guest_name: string
  check_in_date: string
  check_out_date: string
  total_amount: number
  status_label: string
  status_color: string
}

export interface PropertyOccupancy {
  property_name: string
  occupancy_rate: number
  total_bookings: number
}

export async function getDashboardStats(tenantId: string): Promise<DashboardStats> {
  const supabase = await getSupabaseServerClient()

  // Total properties
  const { count: totalProperties } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("is_active", true)

  // Active bookings (current and future)
  const today = new Date().toISOString().split("T")[0]
  const { count: activeBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .gte("check_out_date", today)

  // Total guests (unique persons with bookings)
  const { count: totalGuests } = await supabase
    .from("persons")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("person_category", "guest")

  // Monthly revenue (current month)
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  const { data: paymentsData } = await supabase
    .from("payments")
    .select("amount")
    .eq("tenant_id", tenantId)
    .gte("payment_date", firstDayOfMonth)

  const monthlyRevenue = paymentsData?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0

  // Occupancy rate (simplified calculation)
  const { data: bookingsData } = await supabase
    .from("bookings")
    .select("check_in_date, check_out_date")
    .eq("tenant_id", tenantId)
    .gte("check_out_date", today)

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const totalPossibleDays = (totalProperties || 1) * daysInMonth
  const bookedDays =
    bookingsData?.reduce((sum, booking) => {
      const checkIn = new Date(booking.check_in_date)
      const checkOut = new Date(booking.check_out_date)
      const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      return sum + days
    }, 0) || 0

  const occupancyRate = totalPossibleDays > 0 ? (bookedDays / totalPossibleDays) * 100 : 0

  // Pending payments
  const { data: bookingsWithPending } = await supabase
    .from("bookings")
    .select("total_amount, paid_amount")
    .eq("tenant_id", tenantId)
    .gte("check_out_date", today)

  const pendingPayments =
    bookingsWithPending?.reduce((sum, booking) => {
      const pending = Number(booking.total_amount) - Number(booking.paid_amount || 0)
      return sum + (pending > 0 ? pending : 0)
    }, 0) || 0

  return {
    totalProperties: totalProperties || 0,
    activeBookings: activeBookings || 0,
    totalGuests: totalGuests || 0,
    monthlyRevenue,
    occupancyRate: Math.round(occupancyRate),
    pendingPayments,
  }
}

export async function getRecentBookings(tenantId: string, limit = 5): Promise<RecentBooking[]> {
  const supabase = await getSupabaseServerClient()

  const { data } = await supabase
    .from("bookings")
    .select(
      `
      id,
      booking_code,
      check_in_date,
      check_out_date,
      total_amount,
      properties!inner(name),
      persons!inner(first_name, last_name),
      booking_status:configuration_values!bookings_booking_status_id_fkey(label, color)
    `,
    )
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(limit)

  return (
    data?.map((booking: any) => ({
      id: booking.id,
      booking_code: booking.booking_code,
      property_name: booking.properties?.name || "N/A",
      guest_name: `${booking.persons?.first_name || ""} ${booking.persons?.last_name || ""}`.trim() || "N/A",
      check_in_date: booking.check_in_date,
      check_out_date: booking.check_out_date,
      total_amount: booking.total_amount,
      status_label: booking.booking_status?.label || "N/A",
      status_color: booking.booking_status?.color || "#gray",
    })) || []
  )
}

export async function getPropertyOccupancy(tenantId: string, limit = 5): Promise<PropertyOccupancy[]> {
  const supabase = await getSupabaseServerClient()

  const { data: properties } = await supabase
    .from("properties")
    .select("id, name")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .limit(limit)

  if (!properties) return []

  const today = new Date().toISOString().split("T")[0]
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()

  const occupancyData = await Promise.all(
    properties.map(async (property) => {
      const { data: bookings } = await supabase
        .from("bookings")
        .select("check_in_date, check_out_date")
        .eq("property_id", property.id)
        .gte("check_out_date", today)

      const bookedDays =
        bookings?.reduce((sum, booking) => {
          const checkIn = new Date(booking.check_in_date)
          const checkOut = new Date(booking.check_out_date)
          const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
          return sum + days
        }, 0) || 0

      const occupancyRate = daysInMonth > 0 ? (bookedDays / daysInMonth) * 100 : 0

      return {
        property_name: property.name,
        occupancy_rate: Math.round(occupancyRate),
        total_bookings: bookings?.length || 0,
      }
    }),
  )

  return occupancyData.sort((a, b) => b.occupancy_rate - a.occupancy_rate)
}
