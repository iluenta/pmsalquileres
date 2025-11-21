// Utilidades para cálculos de reportes y análisis

import type { Booking, BookingWithDetails } from "@/types/bookings"
import type { MovementWithDetails } from "@/types/movements"

/**
 * Calcula el ADR (Average Daily Rate) - Ingreso promedio por noche
 */
export function calculateADR(revenue: number, nights: number): number {
  if (nights === 0) return 0
  return revenue / nights
}

/**
 * Calcula el RevPAR (Revenue per Available Room) - Ingreso por habitación disponible
 */
export function calculateRevPAR(revenue: number, availableNights: number): number {
  if (availableNights === 0) return 0
  return revenue / availableNights
}

/**
 * Calcula el TRevPAR (Total Revenue per Available Room) - Ingreso total por habitación disponible
 * Incluye ingresos adicionales (comisiones, servicios, etc.)
 */
export function calculateTRevPAR(totalRevenue: number, availableNights: number): number {
  if (availableNights === 0) return 0
  return totalRevenue / availableNights
}

/**
 * Calcula la tasa de ocupación
 */
export function calculateOccupancyRate(bookedNights: number, availableNights: number): number {
  if (availableNights === 0) return 0
  return (bookedNights / availableNights) * 100
}

/**
 * Calcula el ROI (Return on Investment) como porcentaje
 */
export function calculateROI(revenue: number, expenses: number, investment: number = 0): number {
  if (investment === 0) return 0
  const netProfit = revenue - expenses
  return (netProfit / investment) * 100
}

/**
 * Calcula el break-even point (número de noches necesarias)
 */
export function calculateBreakEvenPoint(
  fixedCosts: number,
  variableCostPerNight: number,
  revenuePerNight: number
): number {
  if (revenuePerNight <= variableCostPerNight) return Infinity
  return Math.ceil(fixedCosts / (revenuePerNight - variableCostPerNight))
}

/**
 * Calcula el lead time (días entre booking y check-in)
 */
export function calculateLeadTime(bookingDate: string, checkInDate: string): number {
  const booking = new Date(bookingDate)
  const checkIn = new Date(checkInDate)
  const diffTime = checkIn.getTime() - booking.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Calcula la antelación de reserva (días entre creación y check-in)
 */
export function calculateAdvanceBooking(createdAt: string, checkInDate: string): number {
  const created = new Date(createdAt)
  const checkIn = new Date(checkInDate)
  const diffTime = checkIn.getTime() - created.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Calcula la duración de estancia (noches)
 */
export function calculateStayDuration(checkInDate: string, checkOutDate: string): number {
  const checkIn = new Date(checkInDate)
  const checkOut = new Date(checkOutDate)
  const diffTime = checkOut.getTime() - checkIn.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Calcula el número de noches disponibles en un período
 */
export function calculateAvailableNights(
  startDate: string,
  endDate: string,
  numberOfProperties: number
): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = end.getTime() - start.getTime()
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return days * numberOfProperties
}

/**
 * Calcula el número de noches reservadas de una lista de bookings
 */
export function calculateBookedNights(bookings: Array<{ check_in_date: string; check_out_date: string }>): number {
  return bookings.reduce((total, booking) => {
    const nights = calculateStayDuration(booking.check_in_date, booking.check_out_date)
    return total + nights
  }, 0)
}

/**
 * Agrupa datos por mes
 */
export function groupByMonth<T>(
  data: T[],
  dateField: (item: T) => string,
  valueField: (item: T) => number
): Record<string, number> {
  const grouped: Record<string, number> = {}
  
  data.forEach((item) => {
    const date = new Date(dateField(item))
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    grouped[monthKey] = (grouped[monthKey] || 0) + valueField(item)
  })
  
  return grouped
}

/**
 * Agrupa datos por año
 */
export function groupByYear<T>(
  data: T[],
  dateField: (item: T) => string,
  valueField: (item: T) => number
): Record<string, number> {
  const grouped: Record<string, number> = {}
  
  data.forEach((item) => {
    const date = new Date(dateField(item))
    const yearKey = String(date.getFullYear())
    grouped[yearKey] = (grouped[yearKey] || 0) + valueField(item)
  })
  
  return grouped
}

/**
 * Calcula el promedio de un array de números
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0
  const sum = values.reduce((acc, val) => acc + val, 0)
  return sum / values.length
}

/**
 * Calcula el cambio porcentual entre dos valores
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * Formatea un número como porcentaje
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Formatea un número como moneda
 */
export function formatCurrency(value: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

