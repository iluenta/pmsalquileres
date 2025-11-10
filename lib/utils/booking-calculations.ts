/**
 * Utilidades para calcular comisiones e impuestos de reservas
 * Estas funciones se utilizan en múltiples partes de la aplicación
 */

export interface BookingCalculationParams {
  totalAmount: number
  salesCommissionPercentage: number | null
  collectionCommissionPercentage: number | null
  taxPercentage: number | null
}

export interface BookingCalculationResult {
  salesCommissionAmount: number
  collectionCommissionAmount: number
  taxAmount: number
  netAmount: number
}

/**
 * Calcula las comisiones e impuestos de una reserva
 * @param params Parámetros de cálculo
 * @returns Resultado con todos los importes calculados
 */
export function calculateBookingAmounts(
  params: BookingCalculationParams
): BookingCalculationResult {
  const {
    totalAmount,
    salesCommissionPercentage,
    collectionCommissionPercentage,
    taxPercentage,
  } = params

  // Calcular comisión de venta
  const salesCommissionAmount = salesCommissionPercentage
    ? (totalAmount * salesCommissionPercentage) / 100
    : 0

  // Calcular comisión de cobro
  const collectionCommissionAmount = collectionCommissionPercentage
    ? (totalAmount * collectionCommissionPercentage) / 100
    : 0

  // Calcular impuesto sobre las comisiones (venta + cobro)
  const commissionsTotal = salesCommissionAmount + collectionCommissionAmount
  const taxAmount = taxPercentage && commissionsTotal > 0
    ? (commissionsTotal * taxPercentage) / 100
    : 0

  // Calcular importe neto: total - comisiones - impuesto
  const netAmount =
    totalAmount - salesCommissionAmount - collectionCommissionAmount - taxAmount

  return {
    salesCommissionAmount: Math.round(salesCommissionAmount * 100) / 100,
    collectionCommissionAmount: Math.round(collectionCommissionAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    netAmount: Math.max(0, Math.round(netAmount * 100) / 100), // Asegurar que no sea negativo
  }
}

/**
 * Recalcula el importe neto cuando se modifican manualmente las comisiones o impuestos
 * @param totalAmount Importe total
 * @param salesCommissionAmount Importe de comisión de venta (puede ser modificado manualmente)
 * @param collectionCommissionAmount Importe de comisión de cobro (puede ser modificado manualmente)
 * @param taxAmount Importe de impuesto (puede ser modificado manualmente)
 * @returns Importe neto recalculado
 */
export function recalculateNetAmount(
  totalAmount: number,
  salesCommissionAmount: number,
  collectionCommissionAmount: number,
  taxAmount: number
): number {
  const netAmount =
    totalAmount - salesCommissionAmount - collectionCommissionAmount - taxAmount
  return Math.max(0, Math.round(netAmount * 100) / 100) // Asegurar que no sea negativo
}

