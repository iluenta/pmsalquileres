// Tipos para el sistema de movimientos financieros

import type { ConfigurationValue } from "@/lib/api/configuration"

export interface Movement {
  id: string
  tenant_id: string
  movement_type_id: string // ID de configuration_value donde configuration_type = 'movement_type'
  booking_id: string | null // Para ingresos (requerido) y gastos (opcional)
  service_provider_id: string | null // Solo para gastos (requerido)
  service_provider_service_id: string | null // Opcional, solo para gastos (deprecated, usar expense_items)
  treasury_account_id: string
  payment_method_id: string // ID de configuration_value donde configuration_type = 'payment_method'
  movement_status_id: string // ID de configuration_value donde configuration_type = 'movement_status'
  amount: number
  invoice_number: string | null
  reference: string | null
  movement_date: string // Date como string ISO
  notes: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface MovementExpenseItem {
  id: string
  movement_id: string
  service_provider_service_id: string | null
  service_name: string
  amount: number
  tax_type_id: string | null
  tax_amount: number
  total_amount: number
  notes: string | null
  created_at: string
  updated_at: string
  service_provider_service?: {
    id: string
    service_type?: {
      label: string
    }
  }
  tax_type?: ConfigurationValue
}

export interface MovementWithDetails extends Movement {
  movement_type?: ConfigurationValue
  booking?: {
    id: string
    booking_code: string
    check_in_date?: string
    check_out_date?: string
    property?: {
      name: string
    }
    person?: {
      first_name: string | null
      last_name: string | null
    } | null
  } | null
  service_provider?: {
    id: string
    person?: {
      full_name: string | null
    }
  } | null
  service_provider_service?: {
    id: string
    service_type?: {
      label: string
    }
  } | null
  expense_items?: MovementExpenseItem[]
  treasury_account?: {
    id: string
    name: string
    account_number: string | null
    bank_name: string | null
  }
  payment_method?: ConfigurationValue
  movement_status?: ConfigurationValue
}

// Tipos para operaciones CRUD
export interface CreateExpenseItemData {
  service_provider_service_id?: string | null
  service_name: string
  amount: number
  tax_type_id?: string | null
  tax_amount?: number
  total_amount?: number
  notes?: string | null
}

export interface UpdateExpenseItemData {
  service_provider_service_id?: string | null
  service_name?: string
  amount?: number
  tax_type_id?: string | null
  tax_amount?: number
  total_amount?: number
  notes?: string | null
}

export interface CreateMovementData {
  movement_type_id: string
  booking_id?: string | null // Para ingresos (requerido) y gastos (opcional)
  service_provider_id?: string | null // Solo para gastos (requerido)
  service_provider_service_id?: string | null // Opcional, solo para gastos (deprecated, usar expense_items)
  treasury_account_id: string
  payment_method_id: string
  movement_status_id: string
  amount: number
  invoice_number?: string | null
  reference?: string | null
  movement_date: string
  notes?: string | null
  expense_items?: CreateExpenseItemData[] // Solo para gastos
}

export interface UpdateMovementData {
  movement_type_id?: string
  booking_id?: string | null
  service_provider_id?: string | null
  service_provider_service_id?: string | null
  treasury_account_id?: string
  payment_method_id?: string
  movement_status_id?: string
  amount?: number
  invoice_number?: string | null
  reference?: string | null
  movement_date?: string
  notes?: string | null
  expense_items?: (CreateExpenseItemData & { id?: string })[] // Para crear/actualizar/eliminar items
}

// Tipos auxiliares para cálculos
export interface BookingPaymentInfo {
  paid_amount: number
  pending_amount: number
  total_to_pay: number // net_amount si hay canal, total_amount si no hay canal
}

