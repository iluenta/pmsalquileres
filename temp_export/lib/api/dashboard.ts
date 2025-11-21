import { getSupabaseServerClient } from "@/lib/supabase/server"

// Helper para obtener person_type 'guest'
async function getGuestPersonTypeId(tenantId: string): Promise<string | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null
    
    // Obtener configuration_type 'person_type' (buscar múltiples variantes)
    const { data: personTypeConfig } = await supabase
      .from('configuration_types')
      .select('id')
      .eq('tenant_id', tenantId)
      .or('name.eq.person_type,name.eq.Tipo de Persona,name.eq.Tipos de Persona')
      .eq('is_active', true)
      .single()
    
    if (!personTypeConfig) return null
    
    // Obtener configuration_value 'guest'
    const { data: guestValue } = await supabase
      .from('configuration_values')
      .select('id')
      .eq('configuration_type_id', personTypeConfig.id)
      .ilike('label', 'guest')
      .eq('is_active', true)
      .single()
    
    return guestValue?.id || null
  } catch (error) {
    console.error('Error getting guest person_type:', error)
    return null
  }
}

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

export async function getDashboardStats(tenantId: string, year?: number | null): Promise<DashboardStats> {
  const supabase = await getSupabaseServerClient()

  // Total properties (no se filtra por año)
  const { count: totalProperties } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("is_active", true)

  // Active bookings (current and future) - aplicar filtro de año si existe
  const today = new Date().toISOString().split("T")[0]
  let activeBookingsQuery = supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .gte("check_out_date", today)
  
  if (year !== null && year !== undefined) {
    const yearStart = `${year}-01-01`
    const yearEnd = `${year}-12-31`
    activeBookingsQuery = activeBookingsQuery.lte('check_in_date', yearEnd).gte('check_out_date', yearStart)
  }
  
  const { count: activeBookings } = await activeBookingsQuery

  // Total guests (unique persons with bookings) - aplicar filtro de año si existe
  const guestPersonTypeId = await getGuestPersonTypeId(tenantId)
  
  let guestsQuery = guestPersonTypeId
    ? supabase
        .from("persons")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .eq("person_type", guestPersonTypeId)
        .eq("is_active", true)
    : null

  // Si hay filtro de año, necesitamos contar solo personas con reservas en ese año
  if (year !== null && year !== undefined && guestPersonTypeId) {
    const yearStart = `${year}-01-01`
    const yearEnd = `${year}-12-31`
    const { data: bookingsInYear } = await supabase
      .from("bookings")
      .select("person_id")
      .eq("tenant_id", tenantId)
      .lte('check_in_date', yearEnd)
      .gte('check_out_date', yearStart)
    
    const personIds = [...new Set((bookingsInYear || []).map((b: any) => b.person_id).filter(Boolean))]
    
    if (personIds.length > 0) {
      guestsQuery = supabase
        .from("persons")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .eq("person_type", guestPersonTypeId)
        .eq("is_active", true)
        .in("id", personIds)
    } else {
      guestsQuery = { count: 0 }
    }
  }
  
  const { count: totalGuests } = guestsQuery
    ? await guestsQuery
    : { count: 0 }

  // Monthly revenue - aplicar filtro de año si existe
  let revenueStartDate: string
  let revenueEndDate: string
  
  if (year !== null && year !== undefined) {
    revenueStartDate = `${year}-01-01`
    revenueEndDate = `${year}-12-31`
  } else {
    // Si no hay filtro de año, usar el mes actual
    revenueStartDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
    revenueEndDate = new Date().toISOString().split("T")[0]
  }
  
  let paymentsQuery = supabase
    .from("payments")
    .select("amount")
    .eq("tenant_id", tenantId)
    .gte("payment_date", revenueStartDate)
    .lte("payment_date", revenueEndDate)

  const { data: paymentsData } = await paymentsQuery
  const monthlyRevenue = paymentsData?.reduce((sum: number, payment: any) => sum + Number(payment.amount), 0) || 0

  // Occupancy rate - aplicar filtro de año si existe
  let occupancyQuery = supabase
    .from("bookings")
    .select("check_in_date, check_out_date")
    .eq("tenant_id", tenantId)
    .gte("check_out_date", today)
  
  if (year !== null && year !== undefined) {
    const yearStart = `${year}-01-01`
    const yearEnd = `${year}-12-31`
    occupancyQuery = occupancyQuery.lte('check_in_date', yearEnd).gte('check_out_date', yearStart)
  }
  
  const { data: bookingsData } = await occupancyQuery

  // Calcular días para ocupación
  let daysInPeriod: number
  if (year !== null && year !== undefined) {
    // Si hay filtro de año, usar días del año (365 o 366)
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
    daysInPeriod = isLeapYear ? 366 : 365
  } else {
    // Si no hay filtro, usar días del mes actual
    daysInPeriod = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  }
  
  const totalPossibleDays = (totalProperties || 1) * daysInPeriod
  const bookedDays =
    bookingsData?.reduce((sum: number, booking: any) => {
      const checkIn = new Date(booking.check_in_date)
      const checkOut = new Date(booking.check_out_date)
      const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      return sum + days
    }, 0) || 0

  const occupancyRate = totalPossibleDays > 0 ? (bookedDays / totalPossibleDays) * 100 : 0

  // Pending payments - aplicar filtro de año si existe
  let pendingPaymentsQuery = supabase
    .from("bookings")
    .select("total_amount, paid_amount")
    .eq("tenant_id", tenantId)
    .gte("check_out_date", today)
  
  if (year !== null && year !== undefined) {
    const yearStart = `${year}-01-01`
    const yearEnd = `${year}-12-31`
    pendingPaymentsQuery = pendingPaymentsQuery.lte('check_in_date', yearEnd).gte('check_out_date', yearStart)
  }
  
  const { data: bookingsWithPending } = await pendingPaymentsQuery

  const pendingPayments =
    bookingsWithPending?.reduce((sum: number, booking: any) => {
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

export async function getRecentBookings(tenantId: string, limit = 5, year?: number | null): Promise<RecentBooking[]> {
  const supabase = await getSupabaseServerClient()

  let query = supabase
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
  
  // Aplicar filtro de año si se proporciona
  if (year !== null && year !== undefined) {
    const yearStart = `${year}-01-01`
    const yearEnd = `${year}-12-31`
    query = query.lte('check_in_date', yearEnd).gte('check_out_date', yearStart)
  }
  
  const { data } = await query.order("created_at", { ascending: false }).limit(limit)

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

export async function getPropertyOccupancy(tenantId: string, limit = 5, year?: number | null): Promise<PropertyOccupancy[]> {
  const supabase = await getSupabaseServerClient()

  const { data: properties } = await supabase
    .from("properties")
    .select("id, name")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .limit(limit)

  if (!properties) return []

  const today = new Date().toISOString().split("T")[0]
  
  // Calcular días del período
  let daysInPeriod: number
  if (year !== null && year !== undefined) {
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
    daysInPeriod = isLeapYear ? 366 : 365
  } else {
    daysInPeriod = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  }

  const occupancyData = await Promise.all(
    properties.map(async (property: any) => {
      let bookingsQuery = supabase
        .from("bookings")
        .select("check_in_date, check_out_date")
        .eq("property_id", property.id)
        .gte("check_out_date", today)
      
      // Aplicar filtro de año si se proporciona
      if (year !== null && year !== undefined) {
        const yearStart = `${year}-01-01`
        const yearEnd = `${year}-12-31`
        bookingsQuery = bookingsQuery.lte('check_in_date', yearEnd).gte('check_out_date', yearStart)
      }
      
      const { data: bookings } = await bookingsQuery

      const bookedDays =
        bookings?.reduce((sum: number, booking: any) => {
          const checkIn = new Date(booking.check_in_date)
          const checkOut = new Date(booking.check_out_date)
          const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
          return sum + days
        }, 0) || 0

      const occupancyRate = daysInPeriod > 0 ? (bookedDays / daysInPeriod) * 100 : 0

      return {
        property_name: property.name,
        occupancy_rate: Math.round(occupancyRate),
        total_bookings: bookings?.length || 0,
      }
    }),
  )

  return occupancyData.sort((a, b) => b.occupancy_rate - a.occupancy_rate)
}
