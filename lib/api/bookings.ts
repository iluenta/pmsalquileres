// Servicio para operaciones CRUD de reservas
// Integrado con Supabase y multi-tenant

import { getSupabaseServerClient } from '@/lib/supabase/server'
import type {
  Booking,
  BookingWithDetails,
  CreateBookingData,
  UpdateBookingData,
  Person,
  CreatePersonData,
  UpdatePersonData,
} from '@/types/bookings'

// Función auxiliar para obtener el tenant_id del usuario autenticado
async function getCurrentUserTenantId(): Promise<string | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return null
    }
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return null
    }
    
    const { data: userData, error } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single()
    
    if (error || !userData) {
      return null
    }
    
    return userData.tenant_id
  } catch (error) {
    console.error('Error getting tenant ID:', error)
    return null
  }
}

// ===== BOOKINGS =====

export async function getBookings(tenantId: string): Promise<BookingWithDetails[]> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return []
    
    // Obtener bookings con relaciones manualmente para mayor compatibilidad
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching bookings:', error)
      return []
    }
    
    if (!bookings || bookings.length === 0) {
      return []
    }
    
    // Obtener propiedades
    const propertyIds = [...new Set(bookings.map((b: any) => b.property_id))]
    const { data: properties } = await supabase
      .from('properties')
      .select('id, name, property_code')
      .in('id', propertyIds)
    
    // Obtener personas
    const personIds = [...new Set(bookings.map((b: any) => b.person_id))]
    const { data: persons } = await supabase
      .from('persons')
      .select('id, first_name, last_name, email, phone')
      .in('id', personIds)
    
    // Obtener estados de reserva
    const statusIds = [...new Set(bookings.map((b: any) => b.booking_status_id).filter(Boolean))]
    const { data: statuses } = statusIds.length > 0
      ? await supabase
          .from('configuration_values')
          .select('id, label, color, icon')
          .in('id', statusIds)
      : { data: [] }
    
    // Combinar datos
    const propertiesMap = new Map((properties || []).map((p: any) => [p.id, p]))
    const personsMap = new Map((persons || []).map((p: any) => [p.id, p]))
    const statusesMap = new Map((statuses || []).map((s: any) => [s.id, s]))
    
    return bookings.map((booking: any) => ({
      ...booking,
      property: propertiesMap.get(booking.property_id) || null,
      person: personsMap.get(booking.person_id) || null,
      booking_status: booking.booking_status_id ? statusesMap.get(booking.booking_status_id) || null : null,
    }))
  } catch (error) {
    console.error('Error in getBookings:', error)
    return []
  }
}

export async function getBookingById(id: string, tenantId: string): Promise<BookingWithDetails | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null
    
    // Obtener booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()
    
    if (error || !booking) {
      console.error('Error fetching booking:', error)
      return null
    }
    
    // Obtener propiedad
    const { data: property } = await supabase
      .from('properties')
      .select('id, name, property_code')
      .eq('id', booking.property_id)
      .single()
    
    // Obtener persona
    const { data: person } = await supabase
      .from('persons')
      .select('id, first_name, last_name, email, phone')
      .eq('id', booking.person_id)
      .single()
    
    // Obtener estado si existe
    let bookingStatus = null
    if (booking.booking_status_id) {
      const { data: status } = await supabase
        .from('configuration_values')
        .select('id, label, color, icon')
        .eq('id', booking.booking_status_id)
        .single()
      
      bookingStatus = status || null
    }
    
    return {
      ...booking,
      property: property || null,
      person: person || null,
      booking_status: bookingStatus,
    }
  } catch (error) {
    console.error('Error in getBookingById:', error)
    return null
  }
}

export async function createBooking(data: CreateBookingData): Promise<Booking | null> {
  try {
    const tenantId = await getCurrentUserTenantId()
    if (!tenantId) {
      throw new Error('No se pudo determinar el tenant del usuario')
    }
    
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null
    
    // Generar código de reserva
    const { data: bookingCode } = await supabase.rpc('generate_booking_code', {
      tenant_uuid: tenantId,
    })
    
    const { data: { user } } = await supabase.auth.getUser()
    
    const bookingData = {
      ...data,
      tenant_id: tenantId,
      booking_code: bookingCode || `BK-${Date.now()}`,
      paid_amount: data.paid_amount || 0,
      booking_status_id: data.booking_status_id || null,
      notes: data.notes || null,
      created_by: user?.id || null,
    }
    
    const { data: result, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating booking:', error)
      throw error
    }
    
    return result
  } catch (error) {
    console.error('Error in createBooking:', error)
    return null
  }
}

export async function updateBooking(id: string, data: UpdateBookingData, tenantId: string): Promise<Booking | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null
    
    const { data: result, error } = await supabase
      .from('bookings')
      .update(data)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating booking:', error)
      throw error
    }
    
    return result
  } catch (error) {
    console.error('Error in updateBooking:', error)
    return null
  }
}

export async function deleteBooking(id: string, tenantId: string): Promise<boolean> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return false
    
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId)
    
    if (error) {
      console.error('Error deleting booking:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error in deleteBooking:', error)
    return false
  }
}

// ===== PERSONS (GUESTS) =====

export async function searchPersons(
  tenantId: string,
  searchTerm: string,
  category: string = 'guest'
): Promise<Person[]> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return []
    
    if (!searchTerm || searchTerm.length < 2) {
      return []
    }
    
    const searchPattern = `%${searchTerm}%`
    
    // Usar OR con sintaxis correcta de Supabase PostgREST
    // La sintaxis es: field1.ilike.pattern,field2.ilike.pattern
    const { data, error } = await supabase
      .from('persons')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('person_category', category)
      .or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},email.ilike.${searchPattern},phone.ilike.${searchPattern}`)
      .order('last_name', { ascending: true })
      .limit(20)
    
    if (error) {
      console.error('Error searching persons:', error)
      // Si falla con .or(), intentar múltiples búsquedas y combinar resultados
      const [firstSearch, lastSearch, emailSearch, phoneSearch] = await Promise.all([
        supabase.from('persons').select('*').eq('tenant_id', tenantId).eq('person_category', category).ilike('first_name', searchPattern),
        supabase.from('persons').select('*').eq('tenant_id', tenantId).eq('person_category', category).ilike('last_name', searchPattern),
        supabase.from('persons').select('*').eq('tenant_id', tenantId).eq('person_category', category).ilike('email', searchPattern),
        supabase.from('persons').select('*').eq('tenant_id', tenantId).eq('person_category', category).ilike('phone', searchPattern),
      ])
      
      // Combinar resultados únicos por ID
      const allResults = [
        ...(firstSearch.data || []),
        ...(lastSearch.data || []),
        ...(emailSearch.data || []),
        ...(phoneSearch.data || []),
      ]
      
      const uniqueResults = Array.from(
        new Map(allResults.map((p: any) => [p.id, p])).values()
      )
      
      // Ordenar por apellido
      uniqueResults.sort((a: any, b: any) => 
        (a.last_name || '').localeCompare(b.last_name || '')
      )
      
      return uniqueResults.slice(0, 20) as Person[]
    }
    
    return data || []
  } catch (error) {
    console.error('Error in searchPersons:', error)
    return []
  }
}

export async function getPersonById(id: string, tenantId: string): Promise<Person | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null
    
    const { data, error } = await supabase
      .from('persons')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()
    
    if (error) {
      console.error('Error fetching person:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error in getPersonById:', error)
    return null
  }
}

export async function createPerson(data: CreatePersonData, tenantId: string): Promise<Person | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null
    
    const personData = {
      ...data,
      tenant_id: tenantId,
      person_category: 'guest',
      email: data.email || null,
      phone: data.phone || null,
      notes: data.notes || null,
    }
    
    const { data: result, error } = await supabase
      .from('persons')
      .insert(personData)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating person:', error)
      throw error
    }
    
    return result
  } catch (error) {
    console.error('Error in createPerson:', error)
    return null
  }
}

export async function updatePerson(id: string, data: UpdatePersonData, tenantId: string): Promise<Person | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null
    
    const { data: result, error } = await supabase
      .from('persons')
      .update(data)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating person:', error)
      throw error
    }
    
    return result
  } catch (error) {
    console.error('Error in updatePerson:', error)
    return null
  }
}

