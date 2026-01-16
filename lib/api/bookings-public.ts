"use server"

import { createClient } from '@supabase/supabase-js'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { CONFIG_CODES } from '@/lib/constants/config'
import type { CreatePersonData, Booking, Person } from '@/types/bookings'
import { getPropertyTenantId } from './properties-public'
import { getOwnSalesChannel } from "./sales-channels"
import { calculateStayPrice } from "../utils/pricing-engine"
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

    // Obtener todas las configuraciones necesarias en paralelo usando códigos
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
        .eq('code', CONFIG_CODES.PERSON_TYPE)
        .maybeSingle()
        .then(async (result: { data: { id: string } | null; error: any }) => {
          let typeId: string | null = result.data?.id || null

          if (!typeId) {
            // Fallback legacy
            const { data: legacy } = await supabase
              .from('configuration_types')
              .select('id')
              .eq('tenant_id', tenantId)
              .or('name.eq.person_type,name.eq.Tipo de Persona,name.eq.Tipos de Persona')
              .maybeSingle()
            if (!legacy) return null
            typeId = legacy.id
          }

          const guestValue = await supabase
            .from('configuration_values')
            .select('id')
            .eq('configuration_type_id', typeId)
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
        .eq('code', CONFIG_CODES.BOOKING_STATUS)
        .maybeSingle()
        .then(async (result: { data: { id: string } | null; error: any }) => {
          let typeId: string | null = result.data?.id || null

          if (!typeId) {
            const { data: legacy } = await supabase
              .from('configuration_types')
              .select('id')
              .eq('tenant_id', tenantId)
              .or('name.eq.Estado de Reserva,name.eq.Booking Status,name.eq.Estados de Reserva')
              .maybeSingle()
            if (!legacy) return null
            typeId = legacy.id
          }

          const pendingValue = await supabase
            .from('configuration_values')
            .select('id')
            .eq('configuration_type_id', typeId)
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
        .eq('code', CONFIG_CODES.BOOKING_TYPE)
        .maybeSingle()
        .then(async (result: { data: { id: string } | null; error: any }) => {
          let typeId: string | null = result.data?.id || null

          if (!typeId) {
            const { data: legacy } = await supabase
              .from('configuration_types')
              .select('id')
              .eq('tenant_id', tenantId)
              .or('name.eq.Tipo de Reserva,name.eq.Booking Type,name.eq.Tipos de Reserva')
              .maybeSingle()
            if (!legacy) return null
            typeId = legacy.id
          }

          const commercialValue = await supabase
            .from('configuration_values')
            .select('id')
            .eq('configuration_type_id', typeId)
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
 * Obtiene información de contacto de la propiedad (host o support)
 */
async function getPropertyContactInfo(propertyId: string): Promise<string> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return 'administración'

    // Obtener el ID de la guía asociada a la propiedad
    const { data: guide } = await supabase
      .from('property_guides')
      .select('id')
      .eq('property_id', propertyId)
      .eq('is_active', true)
      .maybeSingle()

    if (!guide) return 'administración'

    // Obtener info de contacto de la guía
    const { data: contact } = await supabase
      .from('guide_contact_info')
      .select('host_names, phone, support_person_name, support_person_phone')
      .eq('guide_id', guide.id)
      .maybeSingle()

    if (!contact) return 'administración'

    const name = contact.support_person_name || contact.host_names || 'administración'
    const phone = contact.support_person_phone || contact.phone

    if (phone) {
      return `${name} (${phone})`
    }
    return name
  } catch (error) {
    console.error('[bookings-public] Error fetching contact info:', error)
    return 'administración'
  }
}

/**
 * Busca o crea un huésped basándose en sus datos principales.
 * Implementa una lógica estricta para evitar duplicados o asignaciones incorrectas.
 * Usa el cliente del servidor para evitar problemas de RLS
 */
async function findOrCreateGuest(
  data: CreatePersonData,
  tenantId: string,
  guestTypeId: string,
  contactInfo: string // New param
): Promise<Person | null> {
  try {
    if (!guestTypeId) {
      throw new Error('No se proporcionó el tipo de persona "guest"')
    }

    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      throw new Error('No se pudo conectar con la base de datos')
    }

    // Normalización de datos
    const inputEmail = data.email?.toLowerCase().trim() || null
    const inputPhone = data.phone?.trim() || null
    const inputFirstName = data.first_name?.trim() || ""
    const inputLastName = data.last_name?.trim() || ""

    // 1. Buscar matches por todos los criterios posibles
    const matchResults = await Promise.all([
      // Match por Email
      inputEmail ? supabase
        .from('person_contact_infos')
        .select('person_id')
        .eq('contact_type', 'email')
        .eq('contact_value', inputEmail)
        .eq('is_active', true)
        .eq('tenant_id', tenantId) : Promise.resolve({ data: [] }),

      // Match por Teléfono
      inputPhone ? supabase
        .from('person_contact_infos')
        .select('person_id')
        .eq('contact_type', 'phone')
        .eq('contact_value', inputPhone)
        .eq('is_active', true)
        .eq('tenant_id', tenantId) : Promise.resolve({ data: [] }),

      // Match por Nombre y Apellidos
      supabase
        .from('persons')
        .select('id')
        .eq('first_name', inputFirstName)
        .eq('last_name', inputLastName)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
    ])

    // Recolectar todos los IDs únicos encontrados
    const matchedPersonIds = new Set<string>()
    matchResults.forEach(res => {
      if ('data' in res && res.data) {
        if (Array.isArray(res.data)) {
          res.data.forEach((p: any) => matchedPersonIds.add(p.person_id || p.id))
        } else if (res.data) {
          matchedPersonIds.add((res.data as any).person_id || (res.data as any).id)
        }
      }
    })

    // Caso A: Múltiples personas coinciden con diferentes campos -> Conflicto crítico
    if (matchedPersonIds.size > 1) {
      throw new Error(`Existe una ambigüedad con los datos proporcionados. Por favor, contacte con administración ${contactInfo ? `en ${contactInfo} ` : ''}para resolver el conflicto.`)
    }

    // Caso B: Una persona coincide con al menos uno de los tres criterios
    if (matchedPersonIds.size === 1) {
      const personId = Array.from(matchedPersonIds)[0]

      // Obtener datos completos de la persona y sus contactos para validación estricta
      const { data: person } = await supabase
        .from('persons')
        .select('*, person_contact_infos(*)')
        .eq('id', personId)
        .single()

      if (person) {
        const dbFirstName = person.first_name?.trim() || ""
        const dbLastName = person.last_name?.trim() || ""
        const dbContacts = person.person_contact_infos || []

        const dbEmail = dbContacts.find((c: any) => c.contact_type === 'email' && c.is_active)?.contact_value?.toLowerCase().trim() || null
        const dbPhone = dbContacts.find((c: any) => c.contact_type === 'phone' && c.is_active)?.contact_value?.trim() || null

        // VALIDACIÓN ESTRICTA (REGLA DEL USUARIO)
        const nameMatches = inputFirstName === dbFirstName && inputLastName === dbLastName
        const emailMatches = !inputEmail || !dbEmail || inputEmail === dbEmail
        const phoneMatches = !inputPhone || !dbPhone || inputPhone === dbPhone

        // Si el nombre coincide pero el email o teléfono no (y existen en DB)
        if (nameMatches && (!emailMatches || !phoneMatches)) {
          throw new Error(`Ya existe una persona con ese nombre pero con otros datos de contacto. Por favor contacte con ${contactInfo || 'administración'} para verificar sus datos.`)
        }

        // Si el email coincide pero el nombre o teléfono no
        if (inputEmail && inputEmail === dbEmail) {
          if (!nameMatches) {
            throw new Error(`Este email ya está registrado a nombre de otra persona. Contacte con ${contactInfo || 'nosotros'} si cree que esto es un error.`)
          }
          if (inputPhone && dbPhone && inputPhone !== dbPhone) {
            throw new Error(`Este email ya está registrado con un número de teléfono diferente. Contacte con ${contactInfo || 'nosotros'} para actualizar sus datos.`)
          }
        }

        // Si el teléfono coincide pero el nombre o email no
        if (inputPhone && inputPhone === dbPhone) {
          if (!nameMatches) {
            throw new Error(`Este número de teléfono ya está registrado a nombre de otra persona. Contacte con ${contactInfo || 'nosotros'} para resolverlo.`)
          }
          if (inputEmail && dbEmail && inputEmail !== dbEmail) {
            throw new Error(`Este número de teléfono ya está registrado con un email diferente. Contacte con ${contactInfo || 'nosotros'} para verificar su identidad.`)
          }
        }

        // Si llegamos aquí y hubo algún match, significa que todos los campos presentes son compatibles
        return person as Person
      }
    }

    // Caso C: Ninguna persona coincide -> Crear nuevo huésped
    const { data: newPerson, error: personError } = await supabase
      .from('persons')
      .insert({
        tenant_id: tenantId,
        person_type: guestTypeId,
        first_name: inputFirstName,
        last_name: inputLastName,
        is_active: true,
      })
      .select()
      .single()

    if (personError || !newPerson) {
      console.error('[bookings-public] Error creating person:', personError)
      throw personError || new Error('Error al crear la persona')
    }

    // Crear contactos del nuevo huésped
    const contactInserts: any[] = []
    if (inputEmail) {
      contactInserts.push({
        tenant_id: tenantId,
        person_id: newPerson.id,
        contact_type: 'email',
        contact_value: inputEmail,
        is_primary: true,
        is_active: true,
      })
    }
    if (inputPhone) {
      contactInserts.push({
        tenant_id: tenantId,
        person_id: newPerson.id,
        contact_type: 'phone',
        contact_value: inputPhone,
        is_primary: !inputEmail,
        is_active: true,
      })
    }

    if (contactInserts.length > 0) {
      const { error: contactsError } = await supabase
        .from('person_contact_infos')
        .insert(contactInserts)

      if (contactsError) {
        console.error('[bookings-public] Error creating contacts:', contactsError)
      }
    }

    return newPerson as Person
  } catch (error) {
    if (error instanceof Error && (
      error.message.includes('ya está registrado') ||
      error.message.includes('Ya existe una persona') ||
      error.message.includes('ambigüedad')
    )) {
      // Es un error de validación esperado
      throw error
    }
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
    const checkInStr = formatDateForAPI(checkIn)
    const checkOutStr = formatDateForAPI(checkOut)

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('check_in_date, check_out_date, booking_status_id')
      .eq('property_id', propertyId)
      .eq('tenant_id', tenantId)
      .lt('check_in_date', checkOutStr)
      .gt('check_out_date', checkInStr)

    if (error) {
      console.error('[bookings-public] Error checking availability:', error)
      throw error
    }

    // Obtener los estados para filtrar canceladas
    const statusIds = [...new Set((bookings || []).map((b: any) => b.booking_status_id).filter(Boolean))]
    const statusMap = new Map()

    if (statusIds.length > 0) {
      const { data: statuses } = await supabase
        .from('configuration_values')
        .select('id, value')
        .in('id', statusIds)

      statuses?.forEach((s: any) => statusMap.set(s.id, s.value))
    }

    // Filtrar reservas que realmente se solapan y no están canceladas
    const conflicts: any[] = []
    const normalizedCheckIn = parseLocalDate(checkInStr)
    const normalizedCheckOut = parseLocalDate(checkOutStr)

    for (const booking of bookings || []) {
      // Ignorar si está cancelada
      if (booking.booking_status_id && statusMap.get(booking.booking_status_id) === 'cancelled') {
        continue
      }
      const bookingCheckIn = parseLocalDate(booking.check_in_date.split('T')[0])
      const bookingCheckOut = parseLocalDate(booking.check_out_date.split('T')[0])

      if (datesOverlap(normalizedCheckIn, normalizedCheckOut, bookingCheckIn, bookingCheckOut)) {
        return {
          available: false,
          message: `Las fechas seleccionadas se solapan con una reserva existente del ${bookingCheckIn.toLocaleDateString('es-ES')} al ${bookingCheckOut.toLocaleDateString('es-ES')}`,
        }
      }
    }

    return { available: true }
  } catch (error: any) {
    const errorMsg = (error.message || '').toLowerCase()
    const isValidationError =
      errorMsg.includes('solapan') ||
      errorMsg.includes('disponibilidad') ||
      errorMsg.includes('posterior') ||
      errorMsg.includes('mínimo')

    if (!isValidationError) {
      console.error('[bookings-public] Error in checkAvailabilityPublic:', error)
    }
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

    // 1.5. Validate Price using Pricing Engine
    // Fetch pricing periods for the property
    const supabase = await getSupabaseServerClient() // Re-initialize supabase client here if not already done
    if (!supabase) {
      throw new Error('No se pudo conectar con la base de datos')
    }

    const { data: pricingPeriods, error: pricingError } = await supabase
      .from("property_pricing")
      .select("*")
      .eq("property_id", bookingData.property_id)

    if (pricingError) {
      console.error("Error fetching pricing for validation:", pricingError)
    }

    // Obtener datos de la propiedad para base_price y max_guests
    const { data: propertyData } = await supabase
      .from("properties")
      .select("base_price_per_night, max_guests")
      .eq("id", bookingData.property_id)
      .single()

    // Validar usando el pricing engine
    const result = calculateStayPrice({
      checkIn: checkInDate,
      checkOut: checkOutDate,
      numberOfGuests: bookingData.number_of_guests,
      baseGuests: propertyData?.max_guests || 4,
      basePrice: propertyData?.base_price_per_night || 0,
      pricingPeriods: pricingPeriods || []
    })

    if (!result.isValid) {
      throw new Error(result.errorMessage || "Estancia no válida")
    }

    // Si el precio enviado difiere significativamente, usar el calculado por seguridad
    const diff = Math.abs(result.totalPrice - bookingData.total_amount)
    if (diff > 0.1) {
      console.warn(`[Security] Price mismatch detected: Client sent ${bookingData.total_amount}, calculated ${result.totalPrice}. Overriding for security.`)
      bookingData.total_amount = result.totalPrice
    }

    // Obtener configuraciones usando el cliente del servidor
    const configurations = await getPublicConfigurations(bookingData.property_id, tenantId)
    const guestTypeId = configurations.guestPersonTypeId
    const pendingStatusId = configurations.pendingBookingStatusId
    const commercialTypeId = configurations.commercialBookingTypeId

    if (!guestTypeId) {
      throw new Error('No se pudo obtener el tipo de persona "guest". Por favor, verifica la configuración del sistema.')
    }

    // Obtener información de contacto de la propiedad para mensajes de error
    const contactInfo = await getPropertyContactInfo(bookingData.property_id)

    // Crear o obtener huésped
    const guest = await findOrCreateGuest(bookingData.guest, tenantId, guestTypeId, contactInfo)
    if (!guest) {
      throw new Error('No se pudo crear u obtener el huésped')
    }

    // Usar el cliente del servidor para crear la reserva
    // const supabase = await getSupabaseServerClient() // This line was moved up
    // if (!supabase) {
    //   throw new Error('No se pudo conectar con la base de datos')
    // }

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
  } catch (error: any) {
    const errorMsg = (error.message || '').toLowerCase()
    const isValidationError =
      errorMsg.includes('solapan') ||
      errorMsg.includes('disponibilidad') ||
      errorMsg.includes('posterior') ||
      errorMsg.includes('mínimo') ||
      errorMsg.includes('estancia no válida') || // Added for pricing engine validation
      errorMsg.includes('ya está registrado') || // Added for guest identification
      errorMsg.includes('ya existe una persona') || // Added for guest identification
      errorMsg.includes('ambigüedad') // Added for guest identification

    if (!isValidationError) {
      console.error('[bookings-public] Error in createPublicBooking:', error)
    }
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

/**
 * Helpers local-safe para fechas
 */
function formatDateForAPI(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

