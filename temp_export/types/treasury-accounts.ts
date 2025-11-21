// Tipos para el sistema de cuentas de tesorería

export interface TreasuryAccount {
  id: string
  tenant_id: string
  name: string
  account_number: string | null
  bank_name: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Tipos para operaciones CRUD
export interface CreateTreasuryAccountData {
  name: string
  account_number?: string | null
  bank_name?: string | null
  is_active?: boolean
}

export interface UpdateTreasuryAccountData {
  name?: string
  account_number?: string | null
  bank_name?: string | null
  is_active?: boolean
}

