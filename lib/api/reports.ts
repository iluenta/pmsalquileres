// API para obtener datos de reportes y análisis

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getBookings } from "@/lib/api/bookings"
import { getMovements } from "@/lib/api/movements"
import { getProperties } from "@/lib/api/properties"
import type {
  KPIData,
  RevenueData,
  OccupancyData,
  ChannelData,
  ExpenseData,
  ExpenseByProperty,
  BookingAnalytics,
  GuestAnalytics,
  ProfitabilityData,
  MonthlyComparison,
  ReportsFilters,
  ReportsData,
} from "@/types/reports"
import {
  calculateADR,
  calculateRevPAR,
  calculateTRevPAR,
  calculateOccupancyRate,
  calculateROI,
  calculateBreakEvenPoint,
  calculateLeadTime,
  calculateAdvanceBooking,
  calculateStayDuration,
  calculateBookedNights,
  calculateAvailableNights,
  groupByMonth,
  calculateAverage,
  calculatePercentageChange,
} from "@/lib/utils/reports-calculations"
import {
  getYearDateRange,
  generateMonthRange,
  formatMonthKeyLong,
  getPreviousYearRange,
} from "@/lib/utils/date-helpers"

/**
 * Obtiene los KPIs principales para un período dado
 */
export async function getKPIs(
  tenantId: string,
  filters: ReportsFilters
): Promise<KPIData> {
  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    return getEmptyKPIData()
  }

  // Determinar rango de fechas
  const { dateFrom, dateTo } = getDateRange(filters)

  // Obtener propiedades activas
  const allProperties = await getProperties(tenantId)
  const activeProperties = allProperties.filter((p) => p.is_active)
  const numberOfProperties = activeProperties.length

  // Obtener bookings en el rango
  const bookings = await getBookingsInRange(tenantId, dateFrom, dateTo, filters.propertyId)

  // Filtrar por canal si es necesario
  const filteredBookings = filters.channelId
    ? bookings.filter((b) => b.channel_id === filters.channelId)
    : bookings

  // Obtener movimientos (ingresos y gastos)
  const movements = await getMovements(tenantId, {
    year: filters.year || undefined,
    dateFrom,
    dateTo,
  })

  // Separar ingresos y gastos
  const incomeMovements = movements.filter((m) => m.movement_type?.value === "income")
  const expenseMovements = movements.filter((m) => m.movement_type?.value === "expense")

  // Calcular ingresos
  const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
  const netRevenue = filteredBookings.reduce((sum, b) => sum + (b.net_amount || 0), 0)

  // Calcular gastos totales
  const totalExpenses = expenseMovements.reduce((sum, m) => sum + (m.amount || 0), 0)

  // Calcular noches
  const nightsBooked = calculateBookedNights(filteredBookings)
  const daysInPeriod = Math.ceil(
    (new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24)
  )
  const availableNights = calculateAvailableNights(dateFrom, dateTo, numberOfProperties)

  // Calcular métricas
  const occupancyRate = calculateOccupancyRate(nightsBooked, availableNights)
  const adr = calculateADR(totalRevenue, nightsBooked)
  const revpar = calculateRevPAR(totalRevenue, availableNights)
  const trevpar = calculateTRevPAR(totalRevenue, availableNights)
  const netProfit = netRevenue - totalExpenses

  // Calcular lead time y antelación media
  const leadTimes = filteredBookings
    .filter((b) => b.created_at && b.check_in_date)
    .map((b) => calculateLeadTime(b.created_at, b.check_in_date))
  const averageLeadTime = calculateAverage(leadTimes)

  const advanceBookings = filteredBookings
    .filter((b) => b.created_at && b.check_in_date)
    .map((b) => calculateAdvanceBooking(b.created_at, b.check_in_date))
  const averageAdvanceBooking = calculateAverage(advanceBookings)

  const stayDurations = filteredBookings.map((b) =>
    calculateStayDuration(b.check_in_date, b.check_out_date)
  )
  const averageStayDuration = calculateAverage(stayDurations)

  // Calcular cashflow mensual (simplificado)
  const monthlyCashflow = netProfit / Math.max(1, daysInPeriod / 30)

  return {
    totalRevenue,
    netRevenue,
    totalBookings: filteredBookings.length,
    nightsBooked,
    occupancyRate,
    adr,
    revpar,
    trevpar,
    netProfit,
    averageLeadTime,
    averageAdvanceBooking,
    averageStayDuration,
    monthlyCashflow,
  }
}

/**
 * Obtiene datos de ingresos por mes
 */
export async function getRevenueData(
  tenantId: string,
  filters: ReportsFilters
): Promise<RevenueData[]> {
  const { dateFrom, dateTo } = getDateRange(filters)
  const bookings = await getBookingsInRange(tenantId, dateFrom, dateTo, filters.propertyId)

  const filteredBookings = filters.channelId
    ? bookings.filter((b) => b.channel_id === filters.channelId)
    : bookings

  // Agrupar por mes
  const revenueByMonth = groupByMonth(
    filteredBookings,
    (b) => b.check_in_date,
    (b) => b.total_amount || 0
  )
  const netRevenueByMonth = groupByMonth(
    filteredBookings,
    (b) => b.check_in_date,
    (b) => b.net_amount || 0
  )
  const bookingsByMonth = groupByMonth(
    filteredBookings,
    (b) => b.check_in_date,
    () => 1
  )

  // Generar todos los meses en el rango
  const months = generateMonthRange(dateFrom, dateTo)

  const allProperties = await getProperties(tenantId)
  const activeProperties = allProperties.filter((p) => p.is_active)
  const numberOfProperties = activeProperties.length

  return months.map((monthKey) => {
    const [year, month] = monthKey.split("-")
    const monthStart = `${year}-${month}-01`
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
    const monthEnd = `${year}-${month}-${String(lastDay).padStart(2, "0")}`

    const revenue = revenueByMonth[monthKey] || 0
    const netRevenue = netRevenueByMonth[monthKey] || 0
    const bookings = bookingsByMonth[monthKey] || 0

    // Calcular noches del mes
    const monthBookings = filteredBookings.filter((b) => {
      const checkIn = new Date(b.check_in_date)
      return checkIn.getFullYear() === parseInt(year) && checkIn.getMonth() + 1 === parseInt(month)
    })
    const nights = calculateBookedNights(monthBookings)
    const availableNights = calculateAvailableNights(monthStart, monthEnd, numberOfProperties)

    const adr = calculateADR(revenue, nights)
    const revpar = calculateRevPAR(revenue, availableNights)
    const trevpar = calculateTRevPAR(revenue, availableNights)

    return {
      month: formatMonthKeyLong(monthKey),
      revenue,
      netRevenue,
      bookings,
      nights,
      adr,
      revpar,
      trevpar,
    }
  })
}

/**
 * Obtiene datos de ocupación por propiedad
 */
export async function getOccupancyData(
  tenantId: string,
  filters: ReportsFilters
): Promise<OccupancyData[]> {
  const { dateFrom, dateTo } = getDateRange(filters)
  const allProperties = await getProperties(tenantId)
  const activeProperties = allProperties.filter((p) => p.is_active)

  const filteredProperties = filters.propertyId
    ? activeProperties.filter((p) => p.id === filters.propertyId)
    : activeProperties

  const daysInPeriod = Math.ceil(
    (new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24)
  )

  const occupancyPromises = filteredProperties.map(async (property) => {
    const bookings = await getBookingsInRange(tenantId, dateFrom, dateTo, property.id)

    const filteredBookings = filters.channelId
      ? bookings.filter((b) => b.channel_id === filters.channelId)
      : bookings

    const bookedNights = calculateBookedNights(filteredBookings)
    const availableNights = daysInPeriod
    const occupancyRate = calculateOccupancyRate(bookedNights, availableNights)

    return {
      propertyId: property.id,
      propertyName: property.name,
      occupancyRate,
      bookedNights,
      availableNights,
      totalBookings: filteredBookings.length,
    }
  })

  const occupancyData = await Promise.all(occupancyPromises)

  return occupancyData.sort((a, b) => b.occupancyRate - a.occupancyRate)
}

/**
 * Obtiene datos de distribución por canales
 */
export async function getChannelData(
  tenantId: string,
  filters: ReportsFilters
): Promise<ChannelData[]> {
  const { dateFrom, dateTo } = getDateRange(filters)
  const bookings = await getBookingsInRange(tenantId, dateFrom, dateTo, filters.propertyId)

  const filteredBookings = filters.channelId
    ? bookings.filter((b) => b.channel_id === filters.channelId)
    : bookings

  // Agrupar por canal
  const channelMap = new Map<string, { revenue: number; bookings: number; nights: number }>()

  filteredBookings.forEach((booking) => {
    const channelId = booking.channel_id || "no-channel"
    const channelName = booking.channel?.person?.full_name || "Sin canal"

    if (!channelMap.has(channelId)) {
      channelMap.set(channelId, { revenue: 0, bookings: 0, nights: 0 })
    }

    const data = channelMap.get(channelId)!
    data.revenue += booking.total_amount || 0
    data.bookings += 1
    data.nights += calculateStayDuration(booking.check_in_date, booking.check_out_date)
  })

  const totalRevenue = Array.from(channelMap.values()).reduce((sum, d) => sum + d.revenue, 0)

  return Array.from(channelMap.entries()).map(([channelId, data]) => ({
    channelId: channelId === "no-channel" ? "" : channelId,
    channelName: filteredBookings.find((b) => b.channel_id === channelId)?.channel?.person?.full_name || "Sin canal",
    revenue: data.revenue,
    bookings: data.bookings,
    nights: data.nights,
    percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
  }))
}

/**
 * Obtiene datos de gastos por categoría
 */
export async function getExpenseData(
  tenantId: string,
  filters: ReportsFilters
): Promise<ExpenseData[]> {
  const { dateFrom, dateTo } = getDateRange(filters)
  const movements = await getMovements(tenantId, {
    year: filters.year || undefined,
    dateFrom,
    dateTo,
  })

  const expenseMovements = movements.filter((m) => m.movement_type?.value === "expense")

  // Agrupar por categoría (tipo de servicio)
  const categoryMap = new Map<string, { amount: number; count: number }>()

  expenseMovements.forEach((movement) => {
    // Obtener categoría de expense_items o service_provider_service
    let category = "Otros"

    if (movement.expense_items && movement.expense_items.length > 0) {
      const firstItem = movement.expense_items[0]
      category = firstItem.service_provider_service?.service_type?.label || firstItem.service_name || "Otros"
    } else if (movement.service_provider_service?.service_type?.label) {
      category = movement.service_provider_service.service_type.label
    }

    if (!categoryMap.has(category)) {
      categoryMap.set(category, { amount: 0, count: 0 })
    }

    const data = categoryMap.get(category)!
    data.amount += movement.amount || 0
    data.count += 1
  })

  const totalExpenses = Array.from(categoryMap.values()).reduce((sum, d) => sum + d.amount, 0)

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}

/**
 * Obtiene datos de gastos por propiedad
 */
export async function getExpensesByProperty(
  tenantId: string,
  filters: ReportsFilters
): Promise<ExpenseByProperty[]> {
  const { dateFrom, dateTo } = getDateRange(filters)
  const movements = await getMovements(tenantId, {
    year: filters.year || undefined,
    dateFrom,
    dateTo,
  })

  const expenseMovements = movements.filter((m) => m.movement_type?.value === "expense")
  const allProperties = await getProperties(tenantId)

  // Agrupar gastos por propiedad (a través de bookings)
  const propertyMap = new Map<string, { expenses: ExpenseData[]; total: number }>()

  expenseMovements.forEach((movement) => {
    if (!movement.booking?.property?.name) return

    // Usar el nombre de la propiedad como clave ya que no tenemos property.id en el tipo
    const propertyName = movement.booking.property.name

    if (!propertyMap.has(propertyName)) {
      propertyMap.set(propertyName, { expenses: [], total: 0 })
    }

    const data = propertyMap.get(propertyName)!

    // Obtener categoría
    let category = "Otros"
    if (movement.expense_items && movement.expense_items.length > 0) {
      const firstItem = movement.expense_items[0]
      category = firstItem.service_provider_service?.service_type?.label || firstItem.service_name || "Otros"
    } else if (movement.service_provider_service?.service_type?.label) {
      category = movement.service_provider_service.service_type.label
    }

    // Buscar o crear categoría
    let categoryData = data.expenses.find((e) => e.category === category)
    if (!categoryData) {
      categoryData = { category, amount: 0, count: 0, percentage: 0 }
      data.expenses.push(categoryData)
    }

    categoryData.amount += movement.amount || 0
    categoryData.count += 1
    data.total += movement.amount || 0
  })

  // Calcular porcentajes
  propertyMap.forEach((data) => {
    data.expenses.forEach((expense) => {
      expense.percentage = data.total > 0 ? (expense.amount / data.total) * 100 : 0
    })
  })

  return Array.from(propertyMap.entries()).map(([propertyName, data]) => {
    const property = allProperties.find((p) => p.name === propertyName)
    return {
      propertyId: property?.id || "",
      propertyName: property?.name || propertyName || "Propiedad desconocida",
      totalExpenses: data.total,
      categories: data.expenses.sort((a, b) => b.amount - a.amount),
    }
  })
}

/**
 * Obtiene datos de rentabilidad por propiedad
 */
export async function getProfitabilityData(
  tenantId: string,
  filters: ReportsFilters
): Promise<ProfitabilityData[]> {
  const { dateFrom, dateTo } = getDateRange(filters)
  const allProperties = await getProperties(tenantId)
  const activeProperties = allProperties.filter((p) => p.is_active)

  const filteredProperties = filters.propertyId
    ? activeProperties.filter((p) => p.id === filters.propertyId)
    : activeProperties

  const movements = await getMovements(tenantId, {
    year: filters.year || undefined,
    dateFrom,
    dateTo,
  })

  const incomeMovements = movements.filter((m) => m.movement_type?.value === "income")
  const expenseMovements = movements.filter((m) => m.movement_type?.value === "expense")

  const profitabilityPromises = filteredProperties.map(async (property) => {
    const bookings = await getBookingsInRange(tenantId, dateFrom, dateTo, property.id)
    const revenue = bookings.reduce((sum, b) => sum + (b.net_amount || 0), 0)

    // Gastos asociados a esta propiedad (a través de bookings)
    const propertyExpenses = expenseMovements
      .filter((m) => m.booking?.property?.name === property.name)
      .reduce((sum, m) => sum + (m.amount || 0), 0)

    const netProfit = revenue - propertyExpenses

    // Calcular ocupación
    const daysInPeriod = Math.ceil(
      (new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24)
    )
    const bookedNights = calculateBookedNights(bookings)
    const occupancyRate = calculateOccupancyRate(bookedNights, daysInPeriod)

    // ROI simplificado (asumiendo inversión inicial de base_price_per_night * 365)
    const investment = (property.base_price_per_night || 0) * 365
    const roi = calculateROI(revenue, propertyExpenses, investment)

    // Cashflow mensual
    const monthlyCashflow = netProfit / Math.max(1, daysInPeriod / 30)

    // Break-even simplificado
    const variableCostPerNight = propertyExpenses / Math.max(1, bookedNights)
    const revenuePerNight = revenue / Math.max(1, bookedNights)
    const breakEvenPoint = calculateBreakEvenPoint(0, variableCostPerNight, revenuePerNight)

    return {
      propertyId: property.id,
      propertyName: property.name,
      revenue,
      expenses: propertyExpenses,
      netProfit,
      roi,
      cashflow: monthlyCashflow,
      breakEvenPoint,
      occupancyRate,
    }
  })

  return Promise.all(profitabilityPromises)
}

/**
 * Obtiene datos de análisis de reservas
 */
export async function getBookingAnalytics(
  tenantId: string,
  filters: ReportsFilters
): Promise<BookingAnalytics[]> {
  const { dateFrom, dateTo } = getDateRange(filters)
  const bookings = await getBookingsInRange(tenantId, dateFrom, dateTo, filters.propertyId)

  const filteredBookings = filters.channelId
    ? bookings.filter((b) => b.channel_id === filters.channelId)
    : bookings

  return filteredBookings.map((booking) => {
    const nights = calculateStayDuration(booking.check_in_date, booking.check_out_date)
    const leadTime = booking.created_at
      ? calculateLeadTime(booking.created_at, booking.check_in_date)
      : 0
    const advanceBooking = booking.created_at
      ? calculateAdvanceBooking(booking.created_at, booking.check_in_date)
      : 0

    return {
      bookingId: booking.id,
      bookingCode: booking.booking_code,
      propertyName: booking.property?.name || "N/A",
      guestName: booking.person
        ? `${booking.person.first_name || ""} ${booking.person.last_name || ""}`.trim()
        : "N/A",
      checkInDate: booking.check_in_date,
      checkOutDate: booking.check_out_date,
      nights,
      revenue: booking.total_amount || 0,
      netRevenue: booking.net_amount || 0,
      channelName: booking.channel?.person?.full_name || null,
      status: booking.booking_status?.label || "N/A",
      leadTime,
      advanceBooking,
    }
  })
}

/**
 * Obtiene comparativa mensual año-a-año
 */
export async function getMonthlyComparison(
  tenantId: string,
  filters: ReportsFilters,
  metric: "revenue" | "bookings" | "occupancy"
): Promise<MonthlyComparison[]> {
  const { dateFrom, dateTo } = getDateRange(filters)
  const currentYear = filters.year || new Date().getFullYear()
  const previousYear = filters.compareYear || currentYear - 1

  // Datos año actual
  const currentBookings = await getBookingsInRange(tenantId, dateFrom, dateTo, filters.propertyId)

  // Datos año anterior
  const prevRange = getPreviousYearRange(currentYear)
  const previousBookings = await getBookingsInRange(
    tenantId,
    prevRange.start,
    prevRange.end,
    filters.propertyId
  )

  // Obtener propiedades una sola vez para occupancy
  const allProperties = metric === "occupancy" ? await getProperties(tenantId) : []
  const activeProperties = allProperties.filter((p) => p.is_active)
  const numberOfProperties = activeProperties.length

  const months = generateMonthRange(dateFrom, dateTo)

  return months.map((monthKey) => {
    const [year, month] = monthKey.split("-")
    const monthStart = `${year}-${month}-01`
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
    const monthEnd = `${year}-${month}-${String(lastDay).padStart(2, "0")}`

    // Filtrar bookings del mes actual
    const currentMonthBookings = currentBookings.filter((b) => {
      const checkIn = new Date(b.check_in_date)
      return checkIn.getFullYear() === parseInt(year) && checkIn.getMonth() + 1 === parseInt(month)
    })

    // Filtrar bookings del mes del año anterior
    const previousMonthBookings = previousBookings.filter((b) => {
      const checkIn = new Date(b.check_in_date)
      return checkIn.getFullYear() === previousYear && checkIn.getMonth() + 1 === parseInt(month)
    })

    let currentValue = 0
    let previousValue = 0

    if (metric === "revenue") {
      currentValue = currentMonthBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
      previousValue = previousMonthBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
    } else if (metric === "bookings") {
      currentValue = currentMonthBookings.length
      previousValue = previousMonthBookings.length
    } else if (metric === "occupancy") {
      const currentNights = calculateBookedNights(currentMonthBookings)
      const currentAvailable = calculateAvailableNights(monthStart, monthEnd, numberOfProperties)
      currentValue = calculateOccupancyRate(currentNights, currentAvailable)

      const previousNights = calculateBookedNights(previousMonthBookings)
      const previousAvailable = calculateAvailableNights(monthStart, monthEnd, numberOfProperties)
      previousValue = calculateOccupancyRate(previousNights, previousAvailable)
    }

    const change = previousValue > 0 ? calculatePercentageChange(currentValue, previousValue) : null

    return {
      month: formatMonthKeyLong(monthKey),
      currentYear,
      previousYear,
      currentValue,
      previousValue,
      change,
    }
  })
}

// Helper functions

function getEmptyKPIData(): KPIData {
  return {
    totalRevenue: 0,
    netRevenue: 0,
    totalBookings: 0,
    nightsBooked: 0,
    occupancyRate: 0,
    adr: 0,
    revpar: 0,
    trevpar: 0,
    netProfit: 0,
    averageLeadTime: 0,
    averageAdvanceBooking: 0,
    averageStayDuration: 0,
    monthlyCashflow: 0,
  }
}

function getDateRange(filters: ReportsFilters): { dateFrom: string; dateTo: string } {
  if (filters.dateFrom && filters.dateTo) {
    return { dateFrom: filters.dateFrom, dateTo: filters.dateTo }
  }

  if (filters.year) {
    const yearRange = getYearDateRange(filters.year)
    return { dateFrom: yearRange.start, dateTo: yearRange.end }
  }

  // Por defecto, año actual
  const currentYear = new Date().getFullYear()
  const yearRange = getYearDateRange(currentYear)
  return { dateFrom: yearRange.start, dateTo: yearRange.end }
}

async function getBookingsInRange(
  tenantId: string,
  dateFrom: string,
  dateTo: string,
  propertyId?: string | null
) {
  const allBookings = await getBookings(tenantId, null) // Obtener todos sin filtro de año

  return allBookings.filter((booking) => {
    // Una reserva está en el rango si se solapa con él
    const checkIn = new Date(booking.check_in_date)
    const checkOut = new Date(booking.check_out_date)
    const rangeStart = new Date(dateFrom)
    const rangeEnd = new Date(dateTo)

    const overlaps = checkIn <= rangeEnd && checkOut >= rangeStart

    if (!overlaps) return false

    if (propertyId) {
      return booking.property_id === propertyId
    }

    return true
  })
}

