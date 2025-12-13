import type { MovementWithDetails } from "@/types/movements"

/**
 * Determina la ruta correcta para editar un movimiento según su tipo
 * @param movement - El movimiento o un objeto con movement_type
 * @returns La ruta correcta: /dashboard/incomes/[id]/edit o /dashboard/expenses/[id]/edit
 */
export function getMovementEditRoute(movement: MovementWithDetails | { id: string; movement_type?: { value?: string; label?: string } | null }): string {
  const movementType = 'movement_type' in movement ? movement.movement_type : (movement as MovementWithDetails).movement_type
  
  const isIncome = 
    movementType?.value === "income" || 
    movementType?.label === "Ingreso" || 
    movementType?.label?.toLowerCase().includes("ingreso")

  return isIncome 
    ? `/dashboard/incomes/${movement.id}/edit`
    : `/dashboard/expenses/${movement.id}/edit`
}

/**
 * Determina la ruta correcta para la lista de movimientos según el tipo
 * @param movementTypeValue - El tipo de movimiento ("income" o "expense")
 * @returns La ruta correcta: /dashboard/incomes o /dashboard/expenses
 */
export function getMovementListRoute(movementTypeValue: "income" | "expense"): string {
  return movementTypeValue === "income" 
    ? "/dashboard/incomes"
    : "/dashboard/expenses"
}

/**
 * Determina si un movimiento es un ingreso
 * @param movement - El movimiento o un objeto con movement_type
 * @returns true si es un ingreso, false si es un gasto
 */
export function isIncomeMovement(movement: MovementWithDetails | { movement_type?: { value?: string; label?: string } | null }): boolean {
  const movementType = 'movement_type' in movement ? movement.movement_type : (movement as MovementWithDetails).movement_type
  
  return !!(
    movementType?.value === "income" || 
    movementType?.label === "Ingreso" || 
    movementType?.label?.toLowerCase().includes("ingreso")
  )
}
