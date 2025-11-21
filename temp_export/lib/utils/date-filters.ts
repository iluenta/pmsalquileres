/**
 * Utilidades para filtros de fecha por año/temporada
 */

/**
 * Obtiene el rango de fechas para un año específico
 * @param year Año (ej: 2024). Si es null, retorna null
 * @returns Objeto con startDate y endDate, o null si year es null
 */
export function getYearDateRange(year: number | null): { startDate: string; endDate: string } | null {
  if (year === null || year === undefined) {
    return null
  }

  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`

  return { startDate, endDate }
}

/**
 * Verifica si una reserva pertenece a un año específico
 * Una reserva pertenece a un año si:
 * - Su check_in_date está en ese año, O
 * - Su check_out_date está en ese año, O
 * - Se solapa con ese año
 * @param checkIn Fecha de entrada
 * @param checkOut Fecha de salida
 * @param year Año a verificar
 * @returns true si la reserva pertenece al año
 */
export function bookingBelongsToYear(
  checkIn: string | Date,
  checkOut: string | Date,
  year: number
): boolean {
  const checkInDate = typeof checkIn === "string" ? new Date(checkIn) : checkIn
  const checkOutDate = typeof checkOut === "string" ? new Date(checkOut) : checkOut

  const yearStart = new Date(year, 0, 1) // 1 de enero
  const yearEnd = new Date(year, 11, 31, 23, 59, 59) // 31 de diciembre

  // Una reserva pertenece al año si:
  // - check_in_date <= yearEnd AND check_out_date >= yearStart
  return checkInDate <= yearEnd && checkOutDate >= yearStart
}

/**
 * Aplica filtro de año a una query de Supabase para bookings
 * @param query Query builder de Supabase
 * @param year Año a filtrar (null = sin filtro)
 * @returns Query builder con el filtro aplicado
 */
export function applyYearFilterToBookingsQuery(
  query: any,
  year: number | null | undefined
): any {
  if (year === null || year === undefined) {
    return query
  }

  const yearStart = `${year}-01-01`
  const yearEnd = `${year}-12-31`

  // Una reserva pertenece al año si se solapa con él
  // check_in_date <= yearEnd AND check_out_date >= yearStart
  return query.or(`check_in_date.lte.${yearEnd},check_out_date.gte.${yearStart}`)
}

/**
 * Aplica filtro de año a una query de Supabase para payments
 * @param query Query builder de Supabase
 * @param year Año a filtrar (null = sin filtro)
 * @returns Query builder con el filtro aplicado
 */
export function applyYearFilterToPaymentsQuery(
  query: any,
  year: number | null | undefined
): any {
  if (year === null || year === undefined) {
    return query
  }

  const yearStart = `${year}-01-01`
  const yearEnd = `${year}-12-31`

  return query.gte("payment_date", yearStart).lte("payment_date", yearEnd)
}

