// Servicio para operaciones CRUD de reservas
// Integrado con Supabase y multi-tenant

import { getSupabaseServerClient } from '@/lib/supabase/server'
import { CONFIG_CODES } from '@/lib/constants/config'
import { calculateBookingPaymentInfo } from '@/lib/api/movements'
import type {
  Booking,
  BookingWithDetails,
  CreateBookingData,
  UpdateBookingData,
  Person,
  CreatePersonData,
  UpdatePersonData,
  PersonContactInfo,
  CreatePersonContactInfoData,
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

// Función auxiliar para obtener el ID de configuration_type 'PERSON_TYPE'
async function getPersonTypeConfigId(tenantId: string): Promise<string | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null

    // Usar el código estable
    const { data, error } = await supabase
      .from('configuration_types')
      .select('id, name')
      .eq('tenant_id', tenantId)
      .eq('code', CONFIG_CODES.PERSON_TYPE)
      .single()

    if (error) {
      console.warn('Error getting person_type config by code, trying fallback:', error)
      // Fallback a búsqueda por nombre
      const { data: legacyData, error: legacyError } = await supabase
        .from('configuration_types')
        .select('id, name')
        .eq('tenant_id', tenantId)
        .or('name.eq.person_type,name.eq.Tipo de Persona,name.eq.Tipos de Persona')
        .limit(1)
        .maybeSingle()

      if (legacyError || !legacyData) {
        console.error('No se encontró configuration_type "PERSON_TYPE" para tenant', tenantId)
        return null
      }
      return legacyData.id
    }

    return data.id
  } catch (error) {
    console.error('Error in getPersonTypeConfigId:', error)
    return null
  }
}

// Función auxiliar para crear automáticamente la configuración person_type si no existe
async function ensurePersonTypeConfig(tenantId: string): Promise<string | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      console.error('No supabase client available')
      return null
    }

    console.log(`[DEBUG] Ensuring person_type config exists for tenant: ${tenantId}`)

    // Verificar si ya existe el tipo de configuración
    let configTypeId = await getPersonTypeConfigId(tenantId)

    if (!configTypeId) {
      // Crear el tipo de configuración
      console.log(`[DEBUG] Creating person_type configuration type for tenant ${tenantId}`)
      const { data: newType, error: createTypeError } = await supabase
        .from('configuration_types')
        .insert({
          tenant_id: tenantId,
          name: 'person_type',
          description: 'Tipos de persona (huésped, propietario, contacto, etc.)',
          is_active: true,
          sort_order: 20,
        })
        .select('id')
        .single()

      if (createTypeError) {
        console.error('[DEBUG] Error creating person_type config:', createTypeError)
        return null
      }

      configTypeId = newType.id
      console.log(`[DEBUG] ✅ Created person_type config type: ${configTypeId}`)
    }

    // Verificar si ya existe el valor 'guest'
    const { data: existingGuest, error: checkError } = await supabase
      .from('configuration_values')
      .select('id')
      .eq('configuration_type_id', configTypeId)
      .eq('is_active', true)
      .or('value.eq.guest,label.ilike.huésped')
      .limit(1)

    if (checkError) {
      console.error('[DEBUG] Error checking for guest value:', checkError)
    }

    if (!existingGuest || existingGuest.length === 0) {
      // Crear los valores por defecto
      console.log(`[DEBUG] Creating default person_type values for tenant ${tenantId}`)

      const values = [
        { value: 'guest', label: 'Huésped', description: 'Persona que realiza una reserva o estancia', sort_order: 1 },
        { value: 'owner', label: 'Propietario', description: 'Propietario de la propiedad', sort_order: 2 },
        { value: 'contact', label: 'Contacto', description: 'Contacto o persona de referencia', sort_order: 3 },
      ]

      const { error: insertError } = await supabase
        .from('configuration_values')
        .insert(
          values.map(v => ({
            configuration_type_id: configTypeId,
            value: v.value,
            label: v.label,
            description: v.description,
            is_active: true,
            sort_order: v.sort_order,
          }))
        )

      if (insertError) {
        console.error('[DEBUG] Error creating person_type values:', insertError)
        return null
      }

      console.log(`[DEBUG] ✅ Created default person_type values`)
    }

    // Obtener el ID del valor 'guest'
    const { data: guestValue, error: guestError } = await supabase
      .from('configuration_values')
      .select('id')
      .eq('configuration_type_id', configTypeId)
      .eq('is_active', true)
      .or('value.eq.guest,label.ilike.huésped')
      .limit(1)
      .maybeSingle()

    if (guestError) {
      console.error('[DEBUG] Error getting guest value after creation:', guestError)
      return null
    }

    if (!guestValue) {
      console.error('[DEBUG] No se pudo obtener el valor guest después de crearlo')
      return null
    }

    console.log(`[DEBUG] ✅ Guest person_type value ID: ${guestValue.id}`)
    return guestValue.id
  } catch (error) {
    console.error('[DEBUG] Exception in ensurePersonTypeConfig:', error)
    return null
  }
}

// Función auxiliar para obtener el valor de configuration_value 'guest' en person_type
async function getGuestPersonTypeValue(tenantId: string): Promise<string | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      console.error('No supabase client available')
      return null
    }

    console.log(`[DEBUG] Searching for guest person_type for tenant: ${tenantId}`)

    // ESTRATEGIA 1: Buscar directamente el valor 'guest' en configuration_values
    // haciendo JOIN con configuration_types para filtrar por tenant
    // Primero obtener todos los configuration_types del tenant
    const { data: allTypes, error: typesError } = await supabase
      .from('configuration_types')
      .select('id, name')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)

    if (typesError) {
      console.error('[DEBUG] Error getting configuration_types:', typesError)
    }

    console.log(`[DEBUG] Found ${allTypes?.length || 0} configuration types for tenant`)
    if (allTypes && allTypes.length > 0) {
      console.log(`[DEBUG] Configuration types:`, allTypes.map((t: any) => `${t.name} (${t.id})`))
    }

    // Si tenemos tipos, buscar el valor 'guest' en esos tipos
    if (allTypes && allTypes.length > 0) {
      const typeIds = allTypes.map((t: any) => t.id)

      // Buscar por value='guest' o label='Huésped'
      const { data: guestValue, error: guestError } = await supabase
        .from('configuration_values')
        .select('id, label, value, configuration_type_id')
        .in('configuration_type_id', typeIds)
        .eq('is_active', true)
        .or('value.eq.guest,label.ilike.huésped,label.ilike.guest')
        .limit(1)

      if (guestError) {
        console.error('[DEBUG] Error searching for guest value:', guestError)
      }

      if (guestValue && guestValue.length > 0) {
        console.log(`[DEBUG] ✅ Found guest value: ${guestValue[0].label} (${guestValue[0].value}) with id: ${guestValue[0].id}`)
        return guestValue[0].id
      } else {
        console.warn('[DEBUG] No se encontró valor guest en los tipos encontrados')
      }
    }

    // ESTRATEGIA 2: Intentar obtener el configuration_type por nombre
    const personTypeConfigId = await getPersonTypeConfigId(tenantId)

    if (personTypeConfigId) {
      console.log(`[DEBUG] Found person_type config: ${personTypeConfigId}`)

      // Buscar el valor 'guest' en este tipo específico
      const { data, error } = await supabase
        .from('configuration_values')
        .select('id, label, value')
        .eq('configuration_type_id', personTypeConfigId)
        .eq('is_active', true)
        .or('value.eq.guest,label.ilike.huésped,label.ilike.guest')
        .limit(1)

      if (error) {
        console.error('[DEBUG] Error getting guest value from config type:', error)
      }

      if (data && data.length > 0) {
        console.log(`[DEBUG] ✅ Found guest value via config type: ${data[0].label} (${data[0].value})`)
        return data[0].id
      }

      // Si no existe 'guest', obtener el primer valor activo
      console.warn('[DEBUG] No se encontró "guest", obteniendo primer valor activo')
      const { data: altData } = await supabase
        .from('configuration_values')
        .select('id, label, value')
        .eq('configuration_type_id', personTypeConfigId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(1)

      if (altData && altData.length > 0) {
        console.log(`[DEBUG] Using alternative: ${altData[0].label} (${altData[0].value})`)
        return altData[0].id
      }
    }

    // ESTRATEGIA 3: Si no existe, crear automáticamente la configuración
    console.log(`[DEBUG] ❌ No se encontró person_type config, intentando crearla automáticamente`)
    return await ensurePersonTypeConfig(tenantId)
  } catch (error) {
    console.error('[DEBUG] Exception in getGuestPersonTypeValue:', error)
    return null
  }
}

// Función auxiliar para obtener contactos de una persona
export async function getPersonContacts(personId: string, tenantId: string): Promise<PersonContactInfo[]> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return []

    const { data, error } = await supabase
      .from('person_contact_infos')
      .select('*')
      .eq('person_id', personId)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('is_primary', { ascending: false })

    if (error) {
      console.error('Error fetching person contacts:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getPersonContacts:', error)
    return []
  }
}

// Función auxiliar para extraer email y phone desde contactos
export function extractEmailAndPhoneFromContacts(contacts: PersonContactInfo[]): { email: string | null, phone: string | null } {
  const emailContact = contacts.find(c => c.contact_type.toLowerCase() === 'email' && c.is_primary)
  const phoneContact = contacts.find(c => c.contact_type.toLowerCase() === 'phone' && c.is_primary)

  // Si no hay primario, tomar el primero disponible
  const email = emailContact?.contact_value || contacts.find(c => c.contact_type.toLowerCase() === 'email')?.contact_value || null
  const phone = phoneContact?.contact_value || contacts.find(c => c.contact_type.toLowerCase() === 'phone')?.contact_value || null

  return { email, phone }
}

// ===== BOOKINGS =====

// Obtener reservas no pagadas completamente (para selector en movimientos)
export async function getUnpaidBookings(tenantId: string): Promise<BookingWithDetails[]> {
  try {
    const allBookings = await getBookings(tenantId, null)
    // Filtrar solo las que tienen pending_amount > 0
    return allBookings.filter((booking) => booking.pending_amount > 0)
  } catch (error) {
    console.error('Error in getUnpaidBookings:', error)
    return []
  }
}

export async function getBookings(tenantId: string, year?: number | null): Promise<BookingWithDetails[]> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return []

    // Construir query base
    let query = supabase
      .from('bookings')
      .select('*')
      .eq('tenant_id', tenantId)

    // Aplicar filtro de año si se proporciona
    if (year !== null && year !== undefined) {
      const yearStart = `${year}-01-01`
      const yearEnd = `${year}-12-31`
      // Una reserva pertenece al año si se solapa con él
      // check_in_date <= fin del año Y check_out_date >= inicio del año
      query = query.lte('check_in_date', yearEnd).gte('check_out_date', yearStart)
    }

    // Obtener bookings con relaciones manualmente para mayor compatibilidad
    const { data: bookings, error } = await query.order('created_at', { ascending: false })

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

    // Obtener personas (filtrar null/undefined para períodos cerrados)
    const personIds = [...new Set(bookings.map((b: any) => b.person_id).filter((id: any): id is string => id !== null && id !== undefined))]
    const { data: persons } = personIds.length > 0
      ? await supabase
        .from('persons')
        .select('id, first_name, last_name')
        .in('id', personIds)
      : { data: [] }

    // Obtener contactos de todas las personas
    const { data: allContacts } = personIds.length > 0
      ? await supabase
        .from('person_contact_infos')
        .select('*')
        .in('person_id', personIds)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
      : { data: [] }

    // Crear map de contactos por persona
    const contactsByPerson = new Map<string, PersonContactInfo[]>()
      ; (allContacts || []).forEach((contact: any) => {
        const existing = contactsByPerson.get(contact.person_id) || []
        existing.push(contact)
        contactsByPerson.set(contact.person_id, existing)
      })

    // Combinar personas con sus contactos (email/phone)
    const personsMap = new Map(
      (persons || []).map((p: any) => {
        const contacts = contactsByPerson.get(p.id) || []
        const { email, phone } = extractEmailAndPhoneFromContacts(contacts)
        return [p.id, { ...p, email, phone }]
      })
    )

    // Obtener estados de reserva
    const statusIds = [...new Set(bookings.map((b: any) => b.booking_status_id).filter(Boolean))]
    const { data: statuses } = statusIds.length > 0
      ? await supabase
        .from('configuration_values')
        .select('id, label, color, icon')
        .in('id', statusIds)
      : { data: [] }

    // Obtener tipos de reserva
    const bookingTypeIds = [...new Set(bookings.map((b: any) => b.booking_type_id).filter(Boolean))]
    const { data: bookingTypes } = bookingTypeIds.length > 0
      ? await supabase
        .from('configuration_values')
        .select('id, label, color, icon, value')
        .in('id', bookingTypeIds)
      : { data: [] }

    // Obtener canales de venta
    const channelIds = [...new Set(bookings.map((b: any) => b.channel_id).filter(Boolean))]
    const { data: channels } = channelIds.length > 0
      ? await supabase
        .from('sales_channels')
        .select('id, logo_url, sales_commission, collection_commission, person_id, apply_tax, tax_type_id')
        .in('id', channelIds)
      : { data: [] }

    // Obtener tipos de impuesto si existen
    const taxTypeIds = [...new Set((channels || []).map((c: any) => c.tax_type_id).filter(Boolean))]
    const taxTypesMap = new Map<string, any>()
    if (taxTypeIds.length > 0) {
      const { data: taxTypes } = await supabase
        .from('configuration_values')
        .select('id, label, description')
        .in('id', taxTypeIds)

        ; (taxTypes || []).forEach((taxType: any) => {
          taxTypesMap.set(taxType.id, {
            id: taxType.id,
            label: taxType.label,
            description: taxType.description,
          })
        })
    }

    // Obtener personas de los canales
    const channelPersonIds = [...new Set((channels || []).map((c: any) => c.person_id))]
    const { data: channelPersons } = channelPersonIds.length > 0
      ? await supabase
        .from('persons')
        .select('id, full_name')
        .in('id', channelPersonIds)
      : { data: [] }

    // Obtener contactos de personas de canales
    const { data: channelContacts } = channelPersonIds.length > 0
      ? await supabase
        .from('person_contact_infos')
        .select('*')
        .in('person_id', channelPersonIds)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
      : { data: [] }

    // Crear map de contactos por persona de canal
    const channelContactsByPerson = new Map<string, PersonContactInfo[]>()
      ; (channelContacts || []).forEach((contact: any) => {
        const existing = channelContactsByPerson.get(contact.person_id) || []
        existing.push(contact)
        channelContactsByPerson.set(contact.person_id, existing)
      })

    // Combinar canales con sus personas
    const channelsMap = new Map(
      (channels || []).map((c: any) => {
        const person = (channelPersons || []).find((p: any) => p.id === c.person_id)
        const contacts = channelContactsByPerson.get(c.person_id) || []
        const { email, phone } = extractEmailAndPhoneFromContacts(contacts)
        const taxType = c.apply_tax && c.tax_type_id ? taxTypesMap.get(c.tax_type_id) : null
        return [c.id, {
          id: c.id,
          logo_url: c.logo_url,
          sales_commission: c.sales_commission,
          collection_commission: c.collection_commission,
          apply_tax: c.apply_tax || false,
          tax_type: taxType,
          person: person ? {
            full_name: person.full_name || '',
            email,
            phone,
          } : null,
        }]
      })
    )

    // Combinar datos
    const propertiesMap = new Map((properties || []).map((p: any) => [p.id, p]))
    const statusesMap = new Map((statuses || []).map((s: any) => [s.id, s]))
    const bookingTypesMap = new Map((bookingTypes || []).map((bt: any) => [bt.id, bt]))

    // Calcular paid_amount y pending_amount para cada reserva
    // Usar Promise.allSettled para manejar errores individuales sin fallar toda la operación
    const bookingsWithPaymentsResults = await Promise.allSettled(
      bookings.map(async (booking: any) => {
        const paymentInfo = await calculateBookingPaymentInfo(booking.id, tenantId)
        return {
          ...booking,
          paid_amount: paymentInfo.paid_amount,
          pending_amount: paymentInfo.pending_amount,
          property: propertiesMap.get(booking.property_id) || null,
          person: personsMap.get(booking.person_id) || null,
          channel: booking.channel_id ? channelsMap.get(booking.channel_id) || null : null,
          booking_status: booking.booking_status_id ? statusesMap.get(booking.booking_status_id) || null : null,
          booking_type: booking.booking_type_id ? bookingTypesMap.get(booking.booking_type_id) || null : null,
        }
      })
    )

    // Filtrar solo los resultados exitosos y usar valores por defecto para los que fallaron
    const bookingsWithPayments = bookingsWithPaymentsResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        // Si falló el cálculo, usar valores por defecto pero mantener la reserva
        const booking = bookings[index]
        return {
          ...booking,
          paid_amount: 0,
          pending_amount: booking.channel_id ? (booking.net_amount || 0) : booking.total_amount,
          property: propertiesMap.get(booking.property_id) || null,
          person: personsMap.get(booking.person_id) || null,
          channel: booking.channel_id ? channelsMap.get(booking.channel_id) || null : null,
          booking_status: booking.booking_status_id ? statusesMap.get(booking.booking_status_id) || null : null,
          booking_type: booking.booking_type_id ? bookingTypesMap.get(booking.booking_type_id) || null : null,
        }
      }
    })

    return bookingsWithPayments
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

    // Obtener persona (solo si existe person_id, períodos cerrados no tienen huésped)
    let personWithContacts = null
    if (booking.person_id) {
      const { data: person } = await supabase
        .from('persons')
        .select('id, first_name, last_name')
        .eq('id', booking.person_id)
        .single()

      // Obtener contactos de la persona
      if (person) {
        const contacts = await getPersonContacts(person.id, tenantId)
        const { email, phone } = extractEmailAndPhoneFromContacts(contacts)
        personWithContacts = { ...person, email, phone }
      }
    }

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

    // Obtener tipo de reserva si existe
    let bookingType = null
    if (booking.booking_type_id) {
      const { data: type } = await supabase
        .from('configuration_values')
        .select('id, label, color, icon, value')
        .eq('id', booking.booking_type_id)
        .single()

      bookingType = type || null
    }

    // Obtener canal si existe
    let channel = null
    if (booking.channel_id) {
      const { data: channelData } = await supabase
        .from('sales_channels')
        .select('id, logo_url, sales_commission, collection_commission, person_id, apply_tax, tax_type_id')
        .eq('id', booking.channel_id)
        .single()

      if (channelData) {
        // Obtener persona del canal
        const { data: channelPerson } = await supabase
          .from('persons')
          .select('id, full_name')
          .eq('id', channelData.person_id)
          .single()

        if (channelPerson) {
          const channelPersonContacts = await getPersonContacts(channelPerson.id, tenantId)
          const { email, phone } = extractEmailAndPhoneFromContacts(channelPersonContacts)

          // Obtener tipo de impuesto si existe
          let taxType = null
          if (channelData.apply_tax && channelData.tax_type_id) {
            const { data: taxTypeData } = await supabase
              .from('configuration_values')
              .select('id, label, description')
              .eq('id', channelData.tax_type_id)
              .single()

            if (taxTypeData) {
              taxType = {
                id: taxTypeData.id,
                label: taxTypeData.label,
                description: taxTypeData.description,
              }
            }
          }

          channel = {
            id: channelData.id,
            logo_url: channelData.logo_url,
            sales_commission: channelData.sales_commission,
            collection_commission: channelData.collection_commission,
            apply_tax: channelData.apply_tax || false,
            tax_type: taxType,
            person: {
              full_name: channelPerson.full_name || '',
              email,
              phone,
            },
          }
        }
      }
    }

    // Calcular paid_amount y pending_amount dinámicamente
    const paymentInfo = await calculateBookingPaymentInfo(id, tenantId)

    return {
      ...booking,
      paid_amount: paymentInfo.paid_amount,
      pending_amount: paymentInfo.pending_amount,
      property: property || null,
      person: personWithContacts,
      channel,
      booking_status: bookingStatus,
      booking_type: bookingType || null,
    }
  } catch (error) {
    console.error('Error in getBookingById:', error)
    return null
  }
}

export async function createBooking(data: CreateBookingData, tenantId?: string): Promise<Booking> {
  const userTenantId = tenantId || await getCurrentUserTenantId()
  if (!userTenantId) {
    throw new Error('No se pudo determinar el tenant del usuario')
  }

  const supabase = await getSupabaseServerClient()
  if (!supabase) {
    throw new Error('No se pudo conectar con la base de datos')
  }

  // Generar código de reserva
  const { data: bookingCode } = await supabase.rpc('generate_booking_code', {
    tenant_uuid: userTenantId,
  })

  const { data: { user } } = await supabase.auth.getUser()

  // Normalizar channel_id y channel_booking_number: convertir cadenas vacías a null
  const normalizedChannelId = data.channel_id && typeof data.channel_id === 'string' && data.channel_id.trim() !== "" ? data.channel_id.trim() : null
  const normalizedChannelBookingNumber = data.channel_booking_number && typeof data.channel_booking_number === 'string' && data.channel_booking_number.trim() !== "" ? data.channel_booking_number.trim() : null

  const bookingData = {
    ...data,
    tenant_id: userTenantId,
    booking_code: bookingCode || `BK-${Date.now()}`,
    person_id: data.person_id || null, // Permitir NULL para períodos cerrados
    channel_id: normalizedChannelId, // Incluir explícitamente channel_id normalizado
    channel_booking_number: normalizedChannelBookingNumber, // Incluir explícitamente channel_booking_number normalizado
    sales_commission_amount: data.sales_commission_amount ?? 0,
    collection_commission_amount: data.collection_commission_amount ?? 0,
    tax_amount: data.tax_amount ?? 0,
    net_amount: data.net_amount ?? 0,
    booking_status_id: data.booking_status_id || null,
    booking_type_id: data.booking_type_id && typeof data.booking_type_id === 'string' && data.booking_type_id.trim() !== "" ? data.booking_type_id.trim() : null, // Normalizar booking_type_id
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
    // Crear un error más descriptivo
    let errorMessage = error.message || "Error al crear la reserva"

    if (error.code === '23502') {
      // Violación de NOT NULL constraint
      if (error.message?.includes('person_id')) {
        errorMessage = "Error: Los períodos cerrados no requieren huésped. Por favor, ejecuta el script 037_allow_null_person_id_in_bookings.sql"
      } else {
        errorMessage = `Error: Campo requerido faltante: ${error.message}`
      }
    } else if (error.code === '23514') {
      // Violación de check constraint
      if (error.message?.includes('bookings_check_guests')) {
        errorMessage = "Error: El número de huéspedes no puede ser negativo. Para períodos cerrados, ejecuta el script 038_fix_bookings_check_guests_constraint.sql"
      } else {
        errorMessage = `Error de validación: ${error.message}`
      }
    }

    throw new Error(errorMessage)
  }

  if (!result) {
    throw new Error('No se recibió respuesta del servidor al crear la reserva')
  }

  return result
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

    // Obtener person_type_id para 'guest' usando la función que crea automáticamente si no existe
    // Esto asegura que siempre tengamos el tipo correcto
    const personTypeValueId = await getGuestPersonTypeValue(tenantId)

    console.log(`[DEBUG searchPersons] Searching for persons with term: "${searchTerm}", personTypeValueId: ${personTypeValueId}`)

    // Buscar en persons por nombre y apellido
    // Hacer dos búsquedas separadas y combinar resultados
    const [firstNameResults, lastNameResults] = await Promise.all([
      supabase
        .from('persons')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .ilike('first_name', searchPattern)
        .limit(20),
      supabase
        .from('persons')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .ilike('last_name', searchPattern)
        .limit(20),
    ])

    console.log(`[DEBUG searchPersons] Found ${firstNameResults.data?.length || 0} by first_name, ${lastNameResults.data?.length || 0} by last_name`)
    if (firstNameResults.data && firstNameResults.data.length > 0) {
      console.log(`[DEBUG searchPersons] First name results:`, firstNameResults.data.map((p: any) => ({
        id: p.id,
        name: `${p.first_name} ${p.last_name}`,
        person_type: p.person_type
      })))
    }

    const personsByName = [
      ...(firstNameResults.data || []),
      ...(lastNameResults.data || []),
    ]

    // Buscar en person_contact_infos por email y phone
    const { data: contacts, error: contactsError } = await supabase
      .from('person_contact_infos')
      .select('person_id')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .ilike('contact_value', searchPattern)
      .limit(20)

    // Obtener IDs de personas desde contactos
    const personIdsFromContacts = [...new Set((contacts || []).map((c: any) => c.person_id))]

    // Buscar esas personas
    const { data: personsByContact } = personIdsFromContacts.length > 0
      ? await supabase
        .from('persons')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .in('id', personIdsFromContacts)
      : { data: [] }

    // Combinar resultados únicos
    const allPersons = [
      ...(personsByName || []),
      ...(personsByContact || []),
    ]

    const uniquePersons = Array.from(
      new Map(allPersons.map((p: any) => [p.id, p])).values()
    )

    // Si se especificó person_type, filtrar por ese tipo
    let filteredPersons = uniquePersons
    if (personTypeValueId) {
      filteredPersons = uniquePersons.filter((p: any) => p.person_type === personTypeValueId)
      console.log(`[DEBUG searchPersons] Filtered ${uniquePersons.length} persons to ${filteredPersons.length} with person_type=${personTypeValueId}`)
    } else {
      console.warn(`[DEBUG searchPersons] No person_type found, returning all ${uniquePersons.length} persons without filtering`)
    }

    // Obtener contactos de todas las personas encontradas
    const personIds = filteredPersons.map((p: any) => p.id)
    const { data: allContacts } = personIds.length > 0
      ? await supabase
        .from('person_contact_infos')
        .select('*')
        .in('person_id', personIds)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
      : { data: [] }

    // Combinar personas con sus contactos
    const contactsByPerson = new Map<string, PersonContactInfo[]>()
      ; (allContacts || []).forEach((contact: any) => {
        const existing = contactsByPerson.get(contact.person_id) || []
        existing.push(contact)
        contactsByPerson.set(contact.person_id, existing)
      })

    // Agregar email/phone a cada persona
    const personsWithContacts = filteredPersons.map((p: any) => {
      const contacts = contactsByPerson.get(p.id) || []
      const { email, phone } = extractEmailAndPhoneFromContacts(contacts)
      return { ...p, email, phone }
    })

    // Ordenar por apellido
    personsWithContacts.sort((a: any, b: any) =>
      (a.last_name || '').localeCompare(b.last_name || '')
    )

    return personsWithContacts.slice(0, 20) as Person[]
  } catch (error) {
    console.error('Error in searchPersons:', error)
    // Si hay un error pero es por falta de configuración, devolver array vacío
    // El componente mostrará el mensaje de error apropiado
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

    // Obtener contactos
    const contacts = await getPersonContacts(id, tenantId)
    const { email, phone } = extractEmailAndPhoneFromContacts(contacts)

    return {
      ...data,
      email,
      phone,
      contacts,
    }
  } catch (error) {
    console.error('Error in getPersonById:', error)
    return null
  }
}

export async function createPerson(data: CreatePersonData, tenantId: string): Promise<Person | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null

    // Obtener person_type para 'guest'
    // La función getGuestPersonTypeValue ahora crea automáticamente la configuración si no existe
    let guestPersonTypeId = await getGuestPersonTypeValue(tenantId)

    if (!guestPersonTypeId) {
      // Si aún así no se puede obtener o crear, lanzar error
      console.error('No se pudo obtener ni crear el tipo de persona "guest"')
      throw new Error('No se pudo obtener ni crear el tipo de persona "guest". Por favor, verifica los permisos de la base de datos.')
    }

    // Crear la persona
    const personData = {
      tenant_id: tenantId,
      person_type: guestPersonTypeId,
      first_name: data.first_name,
      last_name: data.last_name,
      notes: data.notes || null,
      is_active: true,
    }

    const { data: person, error: personError } = await supabase
      .from('persons')
      .insert(personData)
      .select()
      .single()

    if (personError || !person) {
      console.error('Error creating person:', personError)
      throw personError || new Error('Error al crear la persona')
    }

    // Crear contactos si se proporcionaron
    const contactInserts: CreatePersonContactInfoData[] = []
    if (data.email) {
      contactInserts.push({
        person_id: person.id,
        contact_type: 'email',
        contact_value: data.email,
        is_primary: true,
      })
    }
    if (data.phone) {
      contactInserts.push({
        person_id: person.id,
        contact_type: 'phone',
        contact_value: data.phone,
        is_primary: !data.email, // Solo es primario si no hay email
      })
    }

    if (contactInserts.length > 0) {
      // Asegurar que solo un contacto sea primario
      if (contactInserts.length > 1) {
        contactInserts[1].is_primary = false
      }

      const { error: contactsError } = await supabase
        .from('person_contact_infos')
        .insert(
          contactInserts.map(contact => ({
            ...contact,
            tenant_id: tenantId,
            is_active: true,
          }))
        )

      if (contactsError) {
        console.error('Error creating person contacts:', contactsError)
        // No lanzar error, la persona ya se creó
      }
    }

    // Obtener la persona con sus contactos
    return await getPersonById(person.id, tenantId)
  } catch (error: any) {
    console.error('Error in createPerson:', error)
    // Re-lanzar el error para que la API route pueda capturarlo
    if (error instanceof Error) {
      throw error
    }
    throw new Error(error?.message || 'Error al crear la persona')
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

