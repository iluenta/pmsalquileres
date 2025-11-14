// Servicio para operaciones CRUD de cuentas de tesorería
// Integrado con Supabase y multi-tenant

import { getSupabaseServerClient } from '@/lib/supabase/server'
import type {
  TreasuryAccount,
  CreateTreasuryAccountData,
  UpdateTreasuryAccountData,
} from '@/types/treasury-accounts'

// Obtener todas las cuentas de tesorería
export async function getTreasuryAccounts(
  tenantId: string,
  options?: {
    includeInactive?: boolean
  }
): Promise<TreasuryAccount[]> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return []
    
    let query = supabase
      .from('treasury_accounts')
      .select('*')
      .eq('tenant_id', tenantId)
    
    if (!options?.includeInactive) {
      query = query.eq('is_active', true)
    }
    
    const { data: accounts, error } = await query
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching treasury accounts:', error)
      return []
    }
    
    return accounts || []
  } catch (error) {
    console.error('Error in getTreasuryAccounts:', error)
    return []
  }
}

// Obtener una cuenta de tesorería por ID
export async function getTreasuryAccountById(
  id: string,
  tenantId: string
): Promise<TreasuryAccount | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null
    
    const { data: account, error } = await supabase
      .from('treasury_accounts')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()
    
    if (error) {
      console.error('Error fetching treasury account:', error)
      return null
    }
    
    return account
  } catch (error) {
    console.error('Error in getTreasuryAccountById:', error)
    return null
  }
}

// Crear cuenta de tesorería
export async function createTreasuryAccount(
  data: CreateTreasuryAccountData,
  tenantId: string
): Promise<TreasuryAccount | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null
    
    const { data: account, error } = await supabase
      .from('treasury_accounts')
      .insert({
        tenant_id: tenantId,
        name: data.name.trim(),
        account_number: data.account_number?.trim() || null,
        bank_name: data.bank_name?.trim() || null,
        is_active: data.is_active !== undefined ? data.is_active : true,
      })
      .select()
      .single()
    
    if (error || !account) {
      console.error('Error creating treasury account:', error)
      throw error || new Error('Error al crear la cuenta de tesorería')
    }
    
    return account
  } catch (error) {
    console.error('Error in createTreasuryAccount:', error)
    throw error
  }
}

// Actualizar cuenta de tesorería
export async function updateTreasuryAccount(
  id: string,
  data: UpdateTreasuryAccountData,
  tenantId: string
): Promise<TreasuryAccount | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null
    
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.account_number !== undefined) updateData.account_number = data.account_number?.trim() || null
    if (data.bank_name !== undefined) updateData.bank_name = data.bank_name?.trim() || null
    if (data.is_active !== undefined) updateData.is_active = data.is_active
    
    const { data: account, error } = await supabase
      .from('treasury_accounts')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single()
    
    if (error || !account) {
      console.error('Error updating treasury account:', error)
      throw error || new Error('Error al actualizar la cuenta de tesorería')
    }
    
    return account
  } catch (error) {
    console.error('Error in updateTreasuryAccount:', error)
    throw error
  }
}

// Eliminar cuenta de tesorería
export async function deleteTreasuryAccount(
  id: string,
  tenantId: string
): Promise<boolean> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return false
    
    // Verificar si hay movimientos asociados
    const { data: movements, error: movementsError } = await supabase
      .from('movements')
      .select('id')
      .eq('treasury_account_id', id)
      .eq('tenant_id', tenantId)
      .limit(1)
    
    if (movementsError) {
      console.error('Error checking movements:', movementsError)
    } else if (movements && movements.length > 0) {
      throw new Error('No se puede eliminar la cuenta porque tiene movimientos asociados')
    }
    
    const { error } = await supabase
      .from('treasury_accounts')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId)
    
    if (error) {
      console.error('Error deleting treasury account:', error)
      throw error
    }
    
    return true
  } catch (error) {
    console.error('Error in deleteTreasuryAccount:', error)
    throw error
  }
}

