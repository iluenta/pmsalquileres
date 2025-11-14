// Servicio para operaciones CRUD de movimientos financieros
// Integrado con Supabase y multi-tenant

import { getSupabaseServerClient } from '@/lib/supabase/server'
import type {
  Movement,
  MovementWithDetails,
  CreateMovementData,
  UpdateMovementData,
  BookingPaymentInfo,
} from '@/types/movements'
import type { ConfigurationValue } from '@/lib/api/configuration'

// Calcular importe pagado de una reserva (suma de movimientos de ingreso)
export async function calculateBookingPaidAmount(
  bookingId: string,
  tenantId: string
): Promise<number> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return 0
    
    // Obtener el tipo de movimiento "Ingreso"
    const { data: incomeType } = await supabase
      .from('configuration_types')
      .select('id')
      .eq('tenant_id', tenantId)
      .or('name.eq.movement_type,name.eq.Tipo de Movimiento')
      .eq('is_active', true)
      .single()
    
    if (!incomeType) return 0
    
    const { data: incomeValue } = await supabase
      .from('configuration_values')
      .select('id')
      .eq('configuration_type_id', incomeType.id)
      .or('value.eq.income,label.eq.Ingreso')
      .eq('is_active', true)
      .single()
    
    if (!incomeValue) return 0
    
    // Sumar todos los movimientos de ingreso asociados a la reserva
    const { data: movements, error } = await supabase
      .from('movements')
      .select('amount')
      .eq('tenant_id', tenantId)
      .eq('booking_id', bookingId)
      .eq('movement_type_id', incomeValue.id)
    
    if (error) {
      console.error('Error calculating paid amount:', error)
      return 0
    }
    
    return movements?.reduce((sum: number, m: { amount?: number | null }) => sum + Number(m.amount || 0), 0) || 0
  } catch (error) {
    console.error('Error in calculateBookingPaidAmount:', error)
    return 0
  }
}

// Calcular información de pago de una reserva
export async function calculateBookingPaymentInfo(
  bookingId: string,
  tenantId: string
): Promise<BookingPaymentInfo> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return { paid_amount: 0, pending_amount: 0, total_to_pay: 0 }
    }
    
    // Obtener la reserva
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('total_amount, net_amount, channel_id')
      .eq('id', bookingId)
      .eq('tenant_id', tenantId)
      .single()
    
    if (bookingError || !booking) {
      // Si la reserva no existe (error PGRST116), es un caso válido (puede haber sido eliminada)
      // No loguear como error, solo retornar valores por defecto
      if (bookingError?.code === 'PGRST116' || bookingError?.message?.includes('0 rows')) {
        // Reserva no encontrada - caso válido, no es un error
        return { paid_amount: 0, pending_amount: 0, total_to_pay: 0 }
      }
      // Otros errores sí se loguean
      console.error('Error fetching booking:', bookingError)
      return { paid_amount: 0, pending_amount: 0, total_to_pay: 0 }
    }
    
    // Determinar el total a pagar
    // Si tiene canal: net_amount, si no: total_amount
    const totalToPay = booking.channel_id 
      ? Number(booking.net_amount || 0)
      : Number(booking.total_amount || 0)
    
    // Calcular importe pagado
    const paidAmount = await calculateBookingPaidAmount(bookingId, tenantId)
    
    // Calcular pendiente
    const pendingAmount = Math.max(0, totalToPay - paidAmount)
    
    return {
      paid_amount: paidAmount,
      pending_amount: pendingAmount,
      total_to_pay: totalToPay,
    }
  } catch (error) {
    console.error('Error in calculateBookingPaymentInfo:', error)
    return { paid_amount: 0, pending_amount: 0, total_to_pay: 0 }
  }
}

// Obtener todos los movimientos
export async function getMovements(
  tenantId: string,
  options?: {
    movementType?: string // ID de configuration_value
    movementStatus?: string // ID de configuration_value
    bookingId?: string
    serviceProviderId?: string
    treasuryAccountId?: string
    dateFrom?: string
    dateTo?: string
    includeInactive?: boolean
  }
): Promise<MovementWithDetails[]> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return []
    
    let query = supabase
      .from('movements')
      .select(`
        *,
        booking:bookings(
          id,
          booking_code,
          property:properties(id, name),
          person:persons(id, first_name, last_name)
        ),
        service_provider:service_providers(
          id,
          person:persons(id, full_name)
        ),
        service_provider_service:service_provider_services(
          id,
          service_type:configuration_values!service_provider_services_service_type_id_fkey(id, label)
        ),
        treasury_account:treasury_accounts(
          id,
          name,
          account_number,
          bank_name
        )
      `)
      .eq('tenant_id', tenantId)
    
    if (options?.movementType) {
      query = query.eq('movement_type_id', options.movementType)
    }
    
    if (options?.movementStatus) {
      query = query.eq('movement_status_id', options.movementStatus)
    }
    
    if (options?.bookingId) {
      query = query.eq('booking_id', options.bookingId)
    }
    
    if (options?.serviceProviderId) {
      query = query.eq('service_provider_id', options.serviceProviderId)
    }
    
    if (options?.treasuryAccountId) {
      query = query.eq('treasury_account_id', options.treasuryAccountId)
    }
    
    if (options?.dateFrom) {
      query = query.gte('movement_date', options.dateFrom)
    }
    
    if (options?.dateTo) {
      query = query.lte('movement_date', options.dateTo)
    }
    
    const { data: movements, error } = await query
      .order('movement_date', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching movements:', error)
      return []
    }
    
    if (!movements || movements.length === 0) {
      return []
    }
    
    // Obtener tipos de configuración
    const configTypeIds = [
      ...new Set(movements.map((m: any) => [
        m.movement_type_id,
        m.payment_method_id,
        m.movement_status_id,
      ]).flat().filter(Boolean))
    ]
    
    const configValuesMap = new Map<string, ConfigurationValue>()
    if (configTypeIds.length > 0) {
      const { data: configValues } = await supabase
        .from('configuration_values')
        .select('id, label, value, description, color, icon')
        .in('id', configTypeIds)
      
      ;(configValues || []).forEach((cv: any) => {
        configValuesMap.set(cv.id, cv)
      })
    }
    
    // Combinar datos
    return movements.map((movement: any) => ({
      ...movement,
      movement_type: configValuesMap.get(movement.movement_type_id),
      payment_method: configValuesMap.get(movement.payment_method_id),
      movement_status: configValuesMap.get(movement.movement_status_id),
    }))
  } catch (error) {
    console.error('Error in getMovements:', error)
    return []
  }
}

// Obtener movimientos de una reserva (pagos)
export async function getBookingPayments(
  bookingId: string,
  tenantId: string
): Promise<MovementWithDetails[]> {
  return getMovements(tenantId, { bookingId })
}

// Obtener un movimiento por ID
export async function getMovementById(
  id: string,
  tenantId: string
): Promise<MovementWithDetails | null> {
  try {
    const movements = await getMovements(tenantId)
    return movements.find(m => m.id === id) || null
  } catch (error) {
    console.error('Error in getMovementById:', error)
    return null
  }
}

// Crear movimiento
export async function createMovement(
  data: CreateMovementData,
  tenantId: string
): Promise<Movement | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null
    
    // Validaciones según tipo de movimiento
    if (data.booking_id && data.service_provider_id) {
      throw new Error('Un movimiento no puede tener tanto reserva como proveedor')
    }
    
    // Si es ingreso, debe tener booking_id
    // Si es gasto, debe tener service_provider_id
    const { data: movementType } = await supabase
      .from('configuration_values')
      .select('value, label')
      .eq('id', data.movement_type_id)
      .single()
    
    if (!movementType) {
      throw new Error('Tipo de movimiento no válido')
    }
    
    const isIncome = movementType.value === 'income' || movementType.label === 'Ingreso'
    
    if (isIncome) {
      if (!data.booking_id) {
        throw new Error('Los ingresos deben estar asociados a una reserva')
      }
      
      // Validar que el importe no exceda el pendiente
      const paymentInfo = await calculateBookingPaymentInfo(data.booking_id, tenantId)
      if (data.amount > paymentInfo.pending_amount) {
        throw new Error(`El importe del pago (${data.amount.toFixed(2)} €) excede el importe pendiente (${paymentInfo.pending_amount.toFixed(2)} €)`)
      }
    } else {
      if (!data.service_provider_id) {
        throw new Error('Los gastos deben estar asociados a un proveedor de servicios')
      }
    }
    
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data: movement, error } = await supabase
      .from('movements')
      .insert({
        tenant_id: tenantId,
        movement_type_id: data.movement_type_id,
        booking_id: data.booking_id || null,
        service_provider_id: data.service_provider_id || null,
        service_provider_service_id: data.service_provider_service_id || null,
        treasury_account_id: data.treasury_account_id,
        payment_method_id: data.payment_method_id,
        movement_status_id: data.movement_status_id,
        amount: data.amount,
        invoice_number: data.invoice_number?.trim() || null,
        reference: data.reference?.trim() || null,
        movement_date: data.movement_date,
        notes: data.notes?.trim() || null,
        created_by: user?.id || null,
      })
      .select()
      .single()
    
    if (error || !movement) {
      console.error('Error creating movement:', error)
      throw error || new Error('Error al crear el movimiento')
    }
    
    return movement
  } catch (error) {
    console.error('Error in createMovement:', error)
    throw error
  }
}

// Actualizar movimiento
export async function updateMovement(
  id: string,
  data: UpdateMovementData,
  tenantId: string
): Promise<Movement | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null
    
    // Obtener movimiento actual
    const { data: currentMovement } = await supabase
      .from('movements')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()
    
    if (!currentMovement) {
      throw new Error('Movimiento no encontrado')
    }
    
    // Validaciones si se cambia el importe o la reserva
    if (data.amount !== undefined || data.booking_id !== undefined) {
      const bookingId = data.booking_id !== undefined ? data.booking_id : currentMovement.booking_id
      if (bookingId) {
        const paymentInfo = await calculateBookingPaymentInfo(bookingId, tenantId)
        const newAmount = data.amount !== undefined ? data.amount : currentMovement.amount
        // Restar el importe actual del movimiento
        const currentPaid = paymentInfo.paid_amount - Number(currentMovement.amount)
        const newPending = paymentInfo.total_to_pay - currentPaid
        
        if (newAmount > newPending) {
          throw new Error(`El importe del pago (${newAmount.toFixed(2)} €) excede el importe pendiente (${newPending.toFixed(2)} €)`)
        }
      }
    }
    
    const updateData: any = {}
    if (data.movement_type_id !== undefined) updateData.movement_type_id = data.movement_type_id
    if (data.booking_id !== undefined) updateData.booking_id = data.booking_id || null
    if (data.service_provider_id !== undefined) updateData.service_provider_id = data.service_provider_id || null
    if (data.service_provider_service_id !== undefined) updateData.service_provider_service_id = data.service_provider_service_id || null
    if (data.treasury_account_id !== undefined) updateData.treasury_account_id = data.treasury_account_id
    if (data.payment_method_id !== undefined) updateData.payment_method_id = data.payment_method_id
    if (data.movement_status_id !== undefined) updateData.movement_status_id = data.movement_status_id
    if (data.amount !== undefined) updateData.amount = data.amount
    if (data.invoice_number !== undefined) updateData.invoice_number = data.invoice_number?.trim() || null
    if (data.reference !== undefined) updateData.reference = data.reference?.trim() || null
    if (data.movement_date !== undefined) updateData.movement_date = data.movement_date
    if (data.notes !== undefined) updateData.notes = data.notes?.trim() || null
    
    const { data: movement, error } = await supabase
      .from('movements')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single()
    
    if (error || !movement) {
      console.error('Error updating movement:', error)
      throw error || new Error('Error al actualizar el movimiento')
    }
    
    return movement
  } catch (error) {
    console.error('Error in updateMovement:', error)
    throw error
  }
}

// Eliminar movimiento
export async function deleteMovement(
  id: string,
  tenantId: string
): Promise<boolean> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return false
    
    const { error } = await supabase
      .from('movements')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId)
    
    if (error) {
      console.error('Error deleting movement:', error)
      throw error
    }
    
    return true
  } catch (error) {
    console.error('Error in deleteMovement:', error)
    throw error
  }
}

