// Utilidades para manejo de fechas en reportes

/**
 * Genera un rango de fechas para un año completo
 */
export function getYearDateRange(year: number): { start: string; end: string } {
  const start = `${year}-01-01`
  const end = `${year}-12-31`
  return { start, end }
}

/**
 * Genera un rango de fechas para un mes específico
 */
export function getMonthDateRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, "0")}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
  return { start, end }
}

/**
 * Genera un array de meses en formato "YYYY-MM"
 */
export function generateMonthRange(startDate: string, endDate: string): string[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const months: string[] = []
  
  const current = new Date(start.getFullYear(), start.getMonth(), 1)
  
  while (current <= end) {
    const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`
    months.push(monthKey)
    current.setMonth(current.getMonth() + 1)
  }
  
  return months
}

/**
 * Formatea una fecha en formato "YYYY-MM" a formato legible "MM/YYYY"
 */
export function formatMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split("-")
  return `${month}/${year}`
}

/**
 * Formatea una fecha en formato "YYYY-MM" a formato legible "MMM YYYY" (ej: "Ene 2024")
 */
export function formatMonthKeyLong(monthKey: string): string {
  const [year, month] = monthKey.split("-")
  const monthNames = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  ]
  return `${monthNames[parseInt(month) - 1]} ${year}`
}

/**
 * Obtiene el primer día del mes para una fecha dada
 */
export function getFirstDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

/**
 * Obtiene el último día del mes para una fecha dada
 */
export function getLastDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

/**
 * Compara dos períodos y calcula la diferencia
 */
export function comparePeriods(
  currentStart: string,
  currentEnd: string,
  previousStart: string,
  previousEnd: string
): {
  currentDays: number
  previousDays: number
  daysDifference: number
} {
  const currentStartDate = new Date(currentStart)
  const currentEndDate = new Date(currentEnd)
  const previousStartDate = new Date(previousStart)
  const previousEndDate = new Date(previousEnd)
  
  const currentDays = Math.ceil(
    (currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const previousDays = Math.ceil(
    (previousEndDate.getTime() - previousStartDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  return {
    currentDays,
    previousDays,
    daysDifference: currentDays - previousDays,
  }
}

/**
 * Valida que una fecha esté en formato YYYY-MM-DD
 */
export function isValidDateFormat(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date)
}

/**
 * Convierte una fecha de formato DD/MM/YYYY a YYYY-MM-DD
 */
export function convertDateFormat(date: string): string {
  if (date.includes("/")) {
    const parts = date.split("/")
    if (parts.length === 3) {
      const [day, month, year] = parts
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    }
  }
  return date
}

/**
 * Obtiene el año anterior
 */
export function getPreviousYear(year: number): number {
  return year - 1
}

/**
 * Obtiene el rango de fechas para el año anterior
 */
export function getPreviousYearRange(year: number): { start: string; end: string } {
  return getYearDateRange(year - 1)
}

