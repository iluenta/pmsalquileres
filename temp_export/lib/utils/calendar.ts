/**
 * Utilidades para el calendario y verificación de disponibilidad
 */

import type { BookingWithDetails } from "@/types/bookings"

/**
 * Verifica si dos rangos de fechas se solapan
 * @param start1 Fecha de inicio del primer rango
 * @param end1 Fecha de fin del primer rango (exclusiva)
 * @param start2 Fecha de inicio del segundo rango
 * @param end2 Fecha de fin del segundo rango (exclusiva)
 * @returns true si hay solapamiento
 */
export function datesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  // end1 y end2 son exclusivos (check-out no cuenta como ocupado)
  // Hay solapamiento si: start1 < end2 && start2 < end1
  return start1 < end2 && start2 < end1
}

/**
 * Verifica si una fecha está dentro de un rango
 * @param date Fecha a verificar
 * @param start Fecha de inicio del rango
 * @param end Fecha de fin del rango (exclusiva)
 * @returns true si la fecha está en el rango
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date < end
}

/**
 * Obtiene todos los días en un rango de fechas
 * @param start Fecha de inicio
 * @param end Fecha de fin (exclusiva)
 * @returns Array de fechas
 */
export function getDaysInRange(start: Date, end: Date): Date[] {
  const days: Date[] = []
  const current = new Date(start)
  
  while (current < end) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  
  return days
}

/**
 * Calcula el número de noches entre dos fechas
 * @param checkIn Fecha de entrada
 * @param checkOut Fecha de salida
 * @returns Número de noches
 */
export function calculateNights(checkIn: Date, checkOut: Date): number {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

