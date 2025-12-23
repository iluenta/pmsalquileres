"use server"

import { createClient } from '@supabase/supabase-js'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { CreatePersonData, Booking, Person } from '@/types/bookings'
import { getPropertyTenantId } from './properties-public'
import { getOwnSalesChannel } from './sales-channels'
import { datesOverlap, calculateNights } from '@/lib/utils/calendar'
import { calculateBookingAmounts } from '@/lib/utils/booking-calculations'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabasePublic = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Obtiene las configuraciones necesarias usando el cliente del servidor
 */
async function getPublicConfigurations(propertyId: string, tenantId: string): Promise<{
  guestPersonTypeId: string | null
  pendingBookingStatusId: string | null
  commercialBookingTypeId: string | null
}> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      throw new Error('No se pudo conectar con la base de datos')
    }

    // Obtener todas las configuraciones necesarias en paralelo
    const [
      personTypeResult,
      bookingStatusResult,
      bookingTypeResult
    ] = await Promise.all([
      // Obtener tipo de persona "guest"
      supabase
        .from('configuration_types')
        .select('id')
        .eq('tenant_id', tenantId)
        .or('name.eq.person_type,name.eq.Tipo de Persona,name.eq.Tipos de Persona')
        .eq('is_active', true)
        .maybeSingle()
        .then(async (result: { data: { id: string } | null; error: any }) => {
          if (!result.data) return null
          const guestValue = await supabase
            .from('configuration_values')
            .select('id')
            .eq('configuration_type_id', result.data.id)
            .eq('is_active', true)
            .or('value.eq.guest,label.ilike.huésped,label.ilike.guest')
            .maybeSingle()
          return guestValue.data?.id || null
        }),

      // Obtener estado de reserva "Pendiente"
      supabase
        .from('configuration_types')
        .select('id')
        .eq('tenant_id', tenantId)
        .or('name.eq.Estado de Reserva,name.eq.Booking Status,name.eq.Estados de Reserva')
        .eq('is_active', true)
        .maybeSingle()
        .then(async (result: { data: { id: string } | null; error: any }) => {
          if (!result.data) return null
          const pendingValue = await supabase
            .from('configuration_values')
            .select('id')
            .eq('configuration_type_id', result.data.id)
            .eq('is_active', true)
            .or('value.eq.pending,label.ilike.pendiente')
            .maybeSingle()
          return pendingValue.data?.id || null
        }),

      // Obtener tipo de reserva "commercial"
      supabase
        .from('configuration_types')
        .select('id')
        .eq('tenant_id', tenantId)
        .or('name.eq.Tipo de Reserva,name.eq.Booking Type,name.eq.Tipos de Reserva')
        .eq('is_active', true)
        .maybeSingle()
        .then(async (result: { data: { id: string } | null; error: any }) => {
          if (!result.data) return null
          const commercialValue = await supabase
            .from('configuration_values')
            .select('id')
            .eq('configuration_type_id', result.data.id)
            .eq('is_active', true)
            .or('value.eq.commercial,label.ilike.comercial')
            .maybeSingle()
          return commercialValue.data?.id || null
        })
    ])

    return {
      guestPersonTypeId: personTypeResult,
      pendingBookingStatusId: bookingStatusResult,
      commercialBookingTypeId: bookingTypeResult,
    }
  } catch (error) {
    console.error('[bookings-public] Error getting configurations:', error)
    return {
      guestPersonTypeId: null,
      pendingBookingStatusId: null,
      commercialBookingTypeId: null,
    }
  }
}

/**
 * Busca o crea un huésped basado en email y teléfono
 * Usa el cliente del servidor para evitar problemas de RLS
 */
async function findOrCreateGuest(
  data: CreatePersonData,
  tenantId: string,
  guestTypeId: string
): Promise<Person | null> {
  try {
    if (!guestTypeId) {
      throw new Error('No se proporcionó el tipo de persona "guest"')
    }

    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      throw new Error('No se pudo conectar con la base de datos')
    }

    // Buscar huésped existente por email o teléfono
    let existingPerson: Person | null = null

    if (data.email) {
      const { data: emailContact } = await supabase
        .from('person_contact_infos')
        .select('person_id')
        .eq('contact_type', 'email')
        .eq('contact_value', data.email.toLowerCase().trim())
        .eq('is_active', true)
        .maybeSingle()

      if (emailContact) {
        const { data: person } = await supabase
          .from('persons')
          .select('*')
          .eq('id', emailContact.person_id)
          .eq('tenant_id', tenantId)
          .maybeSingle()

        if (person) {
          existingPerson = person as Person
        }
      }
    }

    // Si no se encontró por email, buscar por teléfono
    if (!existingPerson && data.phone) {
      const { data: phoneContact } = await supabase
        .from('person_contact_infos')
        .select('person_id')
        .eq('contact_type', 'phone')
        .eq('contact_value', data.phone.trim())
        .eq('is_active', true)
        .maybeSingle()

      if (phoneContact) {
        const { data: person } = await supabase
          .from('persons')
          .select('*')
          .eq('id', phoneContact.person_id)
          .eq('tenant_id', tenantId)
          .maybeSingle()

        if (person) {
          existingPerson = person as Person
        }
      }
    }

    // Si existe, retornarlo
    if (existingPerson) {
      return existingPerson
    }

    // Crear nuevo huésped usando el cliente del servidor
    const { data: newPerson, error: personError } = await supabase
      .from('persons')
      .insert({
        tenant_id: tenantId,
        person_type: guestTypeId,
        first_name: data.first_name,
        last_name: data.last_name,
        is_active: true,
      })
      .select()
      .single()

    if (personError || !newPerson) {
      console.error('[bookings-public] Error creating person:', personError)
      throw personError || new Error('Error al crear la persona')
    }

    // Crear contactos
    const contactInserts: any[] = []
    if (data.email) {
      contactInserts.push({
        tenant_id: tenantId,
        person_id: newPerson.id,
        contact_type: 'email',
        contact_value: data.email.toLowerCase().trim(),
        is_primary: true,
        is_active: true,
      })
    }
    if (data.phone) {
      contactInserts.push({
        tenant_id: tenantId,
        person_id: newPerson.id,
        contact_type: 'phone',
        contact_value: data.phone.trim(),
        is_primary: !data.email,
        is_active: true,
      })
    }

    if (contactInserts.length > 0) {
      const { error: contactsError } = await supabase
        .from('person_contact_infos')
        .insert(contactInserts)

      if (contactsError) {
        console.error('[bookings-public] Error creating contacts:', contactsError)
        // No lanzar error, la persona ya se creó
      }
    }

    return newPerson as Person
  } catch (error) {
    console.error('[bookings-public] Error in findOrCreateGuest:', error)
    throw error
  }
}

/**
 * Verifica la disponibilidad de una propiedad (versión pública)
 * Usa el cliente del servidor para evitar problemas de RLS
 */
async function checkAvailabilityPublic(
  propertyId: string,
  tenantId: string,
  checkIn: Date,
  checkOut: Date
): Promise<{ available: boolean; message?: string }> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      throw new Error('No se pudo conectar con la base de datos')
    }

    // Validar que checkOut > checkIn
    if (checkOut <= checkIn) {
      return {
        available: false,
        message: 'La fecha de salida debe ser posterior a la fecha de entrada',
      }
    }

    // Obtener información de la propiedad
    const { data: property } = await supabase
      .from('properties')
      .select('min_nights')
      .eq('id', propertyId)
      .maybeSingle()

    const minNights = property?.min_nights || 1

    // Validar mínimo de noches
    const nights = calculateNights(checkIn, checkOut)
    if (nights < minNights) {
      return {
        available: false,
        message: `El número mínimo de noches para esta propiedad es ${minNights}. Has seleccionado ${nights} ${nights === 1 ? 'noche' : 'noches'}.`,
      }
    }

    // Obtener reservas que se solapan
    const checkInStr = checkIn.toISOString().split('T')[0]
    const checkOutStr = checkOut.toISOString().split('T')[0]

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('check_in_date, check_out_date')
      .eq('property_id', propertyId)
      .eq('tenant_id', tenantId)
      .lt('check_in_date', checkOutStr)
      .gt('check_out_date', checkInStr)

    if (error) {
      console.error('[bookings-public] Error checking availability:', error)
      throw error
    }

    // Verificar solapamientos
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    for (const booking of bookings || []) {
      const bookingCheckIn = new Date(booking.check_in_date)
      const bookingCheckOut = new Date(booking.check_out_date)

      if (datesOverlap(checkInDate, checkOutDate, bookingCheckIn, bookingCheckOut)) {
        return {
          available: false,
          message: `Las fechas seleccionadas se solapan con una reserva existente del ${bookingCheckIn.toLocaleDateString('es-ES')} al ${bookingCheckOut.toLocaleDateString('es-ES')}`,
        }
      }
    }

    return { available: true }
  } catch (error) {
    console.error('[bookings-public] Error in checkAvailabilityPublic:', error)
    throw error
  }
}

/**
 * Crea una reserva pública (sin autenticación)
 */
export async function createPublicBooking(
  bookingData: {
    property_id: string
    check_in_date: string
    check_out_date: string
    number_of_guests: number
    total_amount: number
    guest: CreatePersonData
    notes?: string | null
  }
): Promise<Booking> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Configuración de Supabase no disponible')
    }

    // Obtener tenant_id desde property_id
    const tenantId = await getPropertyTenantId(bookingData.property_id)
    if (!tenantId) {
      throw new Error('No se pudo obtener el tenant de la propiedad')
    }

    // Validar disponibilidad
    const checkInDate = new Date(bookingData.check_in_date)
    const checkOutDate = new Date(bookingData.check_out_date)

    const availabilityResult = await checkAvailabilityPublic(
      bookingData.property_id,
      tenantId,
      checkInDate,
      checkOutDate
    )

    if (!availabilityResult.available) {
      throw new Error(availabilityResult.message || 'Las fechas seleccionadas no están disponibles')
    }

    // Obtener configuraciones usando el cliente del servidor
    const configurations = await getPublicConfigurations(bookingData.property_id, tenantId)
    const guestTypeId = configurations.guestPersonTypeId
    const pendingStatusId = configurations.pendingBookingStatusId
    const commercialTypeId = configurations.commercialBookingTypeId

    if (!guestTypeId) {
      throw new Error('No se pudo obtener el tipo de persona "guest". Por favor, verifica la configuración del sistema.')
    }

    // Crear o obtener huésped
    const guest = await findOrCreateGuest(bookingData.guest, tenantId, guestTypeId)
    if (!guest) {
      throw new Error('No se pudo crear u obtener el huésped')
    }

    // Usar el cliente del servidor para crear la reserva
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      throw new Error('No se pudo conectar con la base de datos')
    }

    // Obtener el canal propio para este tenant
    const ownChannel = await getOwnSalesChannel(tenantId)

    // Calcular comisiones e impuestos si hay canal propio
    let salesCommissionAmount = 0
    let collectionCommissionAmount = 0
    let taxAmount = 0
    let netAmount = bookingData.total_amount
    let channelId: string | null = null
    let taxPercentage: number | null = null

    if (ownChannel) {
      channelId = ownChannel.id

      // Obtener el porcentaje de impuesto si aplica
      if (ownChannel.apply_tax && ownChannel.tax_type_id) {
        const { data: taxType } = await supabase
          .from('configuration_values')
          .select('description')
          .eq('id', ownChannel.tax_type_id)
          .single()

        if (taxType?.description) {
          taxPercentage = parseFloat(taxType.description) || null
        }
      }

      // Calcular comisiones e impuestos
      const calculated = calculateBookingAmounts({
        totalAmount: bookingData.total_amount,
        salesCommissionPercentage: ownChannel.sales_commission,
        collectionCommissionPercentage: ownChannel.collection_commission,
        taxPercentage: taxPercentage,
      })

      salesCommissionAmount = calculated.salesCommissionAmount
      collectionCommissionAmount = calculated.collectionCommissionAmount
      taxAmount = calculated.taxAmount
      netAmount = calculated.netAmount
    }

    // Generar código de reserva usando RPC
    let bookingCode: string
    try {
      const { data: code } = await supabase.rpc('generate_booking_code', {
        tenant_uuid: tenantId,
      })
      bookingCode = code || `BK-${Date.now()}`
    } catch (error) {
      console.warn('[bookings-public] Could not generate booking code via RPC, using fallback')
      bookingCode = `BK-${Date.now()}`
    }

    // Si hay canal asignado, usar el booking_code como channel_booking_number
    // (es obligatorio cuando hay channel_id)
    const channelBookingNumber = channelId ? bookingCode : null

    // Crear la reserva usando el cliente del servidor
    // Nota: paid_amount se calcula dinámicamente desde movements, no es una columna en la tabla
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        tenant_id: tenantId,
        booking_code: bookingCode,
        property_id: bookingData.property_id,
        person_id: guest.id,
        channel_id: channelId,
        channel_booking_number: channelBookingNumber,
        check_in_date: bookingData.check_in_date,
        check_out_date: bookingData.check_out_date,
        number_of_guests: bookingData.number_of_guests,
        total_amount: bookingData.total_amount,
        sales_commission_amount: salesCommissionAmount,
        collection_commission_amount: collectionCommissionAmount,
        tax_amount: taxAmount,
        net_amount: netAmount,
        booking_status_id: pendingStatusId,
        booking_type_id: commercialTypeId,
        notes: bookingData.notes ?? null,
        created_by: null, // Reserva pública, sin usuario autenticado
      })
      .select()
      .single()

    if (bookingError || !booking) {
      console.error('[bookings-public] Error creating booking:', bookingError)
      throw bookingError || new Error('Error al crear la reserva')
    }

    return booking as Booking
  } catch (error) {
    console.error('[bookings-public] Error in createPublicBooking:', error)
    throw error
  }
}

/**
 * Valida el acceso de un huésped a la guía privada
 * @param propertyId ID de la propiedad
 * @param firstName Nombre del huésped
 * @param lastName Primer apellido del huésped
 */
export async function validateBookingAccess(
  propertyId: string,
  firstName: string,
  lastName: string
): Promise<{
  success: boolean;
  message?: string;
  booking?: any;
  status?: 'not_found' | 'not_active' | 'active'
}> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) throw new Error('No se pudo conectar con la base de datos')

    // 1. Buscar reservas para esta propiedad y este huésped
    // Usamos ilike para que sea case-insensitive
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        persons!inner (
          first_name,
          last_name
        )
      `)
      .eq('property_id', propertyId)
      .ilike('persons.first_name', `${firstName}%`)
      .ilike('persons.last_name', `${lastName}%`)
      .order('check_in_date', { ascending: false })

    if (error) throw error
    if (!bookings || bookings.length === 0) {
      return {
        success: false,
        status: 'not_found',
        message: 'No se ha encontrado ninguna reserva con esos datos para esta propiedad.'
      }
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // 2. Verificar si alguna reserva está dentro de la ventana activa (10 días antes a 1 día después)
    for (const booking of bookings) {
      const checkIn = new Date(booking.check_in_date)
      const checkOut = new Date(booking.check_out_date)

      const windowStart = new Date(checkIn)
      windowStart.setDate(windowStart.getDate() - 10)

      const windowEnd = new Date(checkOut)
      windowEnd.setDate(windowEnd.getDate() + 1)

      if (today >= windowStart && today <= windowEnd) {
        return {
          success: true,
          status: 'active',
          booking: booking
        }
      }
    }

    return {
      success: false,
      status: 'not_active',
      message: 'Tu reserva no está activa actualmente. El acceso a la guía se habilita 10 días antes de tu llegada y finaliza el día después de tu salida.'
    }

  } catch (error) {
    console.error('[bookings-public] Error in validateBookingAccess:', error)
    return { success: false, message: 'Ocurrió un error al validar tu acceso.' }
  }
}

