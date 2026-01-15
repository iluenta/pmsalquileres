/**
 * API para funcionalidades del calendario y verificación de disponibilidad
 */

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { datesOverlap, calculateNights } from "@/lib/utils/calendar"
import type { BookingWithDetails } from "@/types/bookings"

export interface AvailabilityConflict {
  booking: BookingWithDetails
  conflictType: 'commercial' | 'closed_period'
  message: string
}

export interface AvailabilityCheckResult {
  available: boolean
  conflicts: AvailabilityConflict[]
}

export interface CalendarDay {
  date: Date
  isAvailable: boolean
  booking: BookingWithDetails | null
  bookingType: 'commercial' | 'closed_period' | null
  isCheckIn: boolean
  isCheckOut: boolean
  guestName?: string
}

export interface AvailablePeriod {
  checkIn: Date
  checkOut: Date
  nights: number
}

/**
 * Obtiene la disponibilidad del calendario para una propiedad en un rango de fechas
 * @param propertyId ID de la propiedad
 * @param tenantId ID del tenant
 * @param startDate Fecha de inicio del rango
 * @param endDate Fecha de fin del rango
 * @returns Array de días con su disponibilidad
 */
export async function getCalendarAvailability(
  propertyId: string,
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<CalendarDay[]> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      throw new Error("No se pudo conectar con la base de datos")
    }

    // Obtener todas las reservas en el rango
    const startStr = formatDateForAPI(startDate)
    const endStr = formatDateForAPI(endDate)

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('property_id', propertyId)
      .eq('tenant_id', tenantId)
      .or(`check_in_date.lte.${endStr},check_out_date.gte.${startStr}`)

    if (error) {
      console.error('Error fetching calendar availability:', error)
      throw error
    }

    // Obtener estados de reserva para filtrar canceladas
    const bookingStatusIds = [...new Set((bookings || []).map((b: any) => b.booking_status_id).filter(Boolean))]
    const bookingStatusesMap = new Map<string, { value: string }>()

    if (bookingStatusIds.length > 0) {
      const { data: statuses } = await supabase
        .from('configuration_values')
        .select('id, value')
        .in('id', bookingStatusIds)

        ; (statuses || []).forEach((status: any) => {
          bookingStatusesMap.set(status.id, { value: status.value })
        })
    }

    // Obtener tipos de reserva
    const bookingTypeIds = [...new Set((bookings || []).map((b: any) => b.booking_type_id).filter(Boolean))]
    const bookingTypesMap = new Map<string, { value: string; label: string }>()

    if (bookingTypeIds.length > 0) {
      const { data: types } = await supabase
        .from('configuration_values')
        .select('id, value, label')
        .in('id', bookingTypeIds)

        ; (types || []).forEach((type: any) => {
          bookingTypesMap.set(type.id, { value: type.value, label: type.label })
        })
    }

    // Filtrar reservas canceladas (no deben aparecer como ocupadas)
    const activeBookings = (bookings || []).filter((booking: any) => {
      if (!booking.booking_status_id) {
        // Si no tiene estado, asumimos que está activa
        return true
      }
      const status = bookingStatusesMap.get(booking.booking_status_id)
      // Excluir reservas canceladas
      return status?.value !== 'cancelled'
    })

    // Obtener personas para reservas comerciales
    const personIds = [...new Set((bookings || []).map((b: any) => b.person_id).filter(Boolean))]
    const personsMap = new Map<string, { first_name: string; last_name: string }>()

    if (personIds.length > 0) {
      const { data: persons } = await supabase
        .from('persons')
        .select('id, first_name, last_name')
        .in('id', personIds)

        ; (persons || []).forEach((person: any) => {
          personsMap.set(person.id, { first_name: person.first_name, last_name: person.last_name })
        })
    }

    // Función auxiliar para obtener la clave de fecha en formato YYYY-MM-DD sin problemas de zona horaria
    const getDateKey = (date: Date): string => {
      return formatDateForAPI(date)
    }

    // Crear mapa de reservas por fecha
    const bookingsByDate = new Map<string, any[]>()

      ; (activeBookings || []).forEach((booking: any) => {
        // Obtener solo la parte de fecha (YYYY-MM-DD) de las cadenas
        const checkInStr = booking.check_in_date.split('T')[0]
        const checkOutStr = booking.check_out_date.split('T')[0]

        // Crear fechas en zona horaria local a medianoche
        const [checkInYear, checkInMonth, checkInDay] = checkInStr.split('-').map(Number)
        const [checkOutYear, checkOutMonth, checkOutDay] = checkOutStr.split('-').map(Number)

        const checkIn = new Date(checkInYear, checkInMonth - 1, checkInDay, 0, 0, 0, 0)
        const checkOut = new Date(checkOutYear, checkOutMonth - 1, checkOutDay, 0, 0, 0, 0)

        const bookingType = booking.booking_type_id
          ? bookingTypesMap.get(booking.booking_type_id)
          : null

        // Marcar días ocupados desde checkIn (inclusive) hasta checkOut (exclusivo)
        // Si checkIn es 8 de marzo y checkOut es 18 de marzo, los días ocupados son 8-17
        const current = new Date(checkIn)

        while (current < checkOut) {
          const dateKey = getDateKey(current)
          if (!bookingsByDate.has(dateKey)) {
            bookingsByDate.set(dateKey, [])
          }

          // Verificar si es el día de check-in comparando solo la fecha
          const isCheckInDay = dateKey === checkInStr

          bookingsByDate.get(dateKey)!.push({
            ...booking,
            bookingType: bookingType?.value || null,
            isCheckIn: isCheckInDay,
            isCheckOut: false, // checkOut es exclusivo, nunca se marca como check-out
          })
          current.setDate(current.getDate() + 1)
        }
      })

    // Generar array de días
    const days: CalendarDay[] = []
    const current = new Date(startDate)
    current.setHours(0, 0, 0, 0)

    const endDateNormalized = new Date(endDate)
    endDateNormalized.setHours(23, 59, 59, 999) // Incluir el último día

    while (current <= endDateNormalized) {
      const dateKey = getDateKey(current)
      const dayBookings = bookingsByDate.get(dateKey) || []

      if (dayBookings.length === 0) {
        days.push({
          date: new Date(current),
          isAvailable: true,
          booking: null,
          bookingType: null,
          isCheckIn: false,
          isCheckOut: false,
        })
      } else {
        // Tomar la primera reserva del día
        const firstBooking = dayBookings[0]
        const bookingTypeValue = firstBooking.bookingType as 'commercial' | 'closed_period' | null
        const person = firstBooking.person_id ? personsMap.get(firstBooking.person_id) : null
        const guestName = person ? `${person.first_name} ${person.last_name}` : undefined

        days.push({
          date: new Date(current),
          isAvailable: false,
          booking: firstBooking as BookingWithDetails,
          bookingType: bookingTypeValue,
          isCheckIn: firstBooking.isCheckIn,
          isCheckOut: false,
          guestName,
        })
      }

      current.setDate(current.getDate() + 1)
      current.setHours(0, 0, 0, 0)
    }

    return days
  } catch (error) {
    console.error('Error in getCalendarAvailability:', error)
    throw error
  }
}

/**
 * Helper local-safe para formatear fechas a YYYY-MM-DD para el API/DB
 */
function formatDateForAPI(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Crea una fecha a medianoche local a partir de un string YYYY-MM-DD
 */
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

/**
 * Verifica la disponibilidad de una propiedad para un rango de fechas
 * @param propertyId ID de la propiedad
 * @param tenantId ID del tenant
 * @param checkIn Fecha de entrada
 * @param checkOut Fecha de salida
 * @param excludeBookingId ID de reserva a excluir (útil al editar)
 * @returns Resultado de la verificación de disponibilidad
 */
export async function checkAvailability(
  propertyId: string,
  tenantId: string,
  checkIn: Date,
  checkOut: Date,
  excludeBookingId?: string,
  bookingType?: 'commercial' | 'closed_period'
): Promise<AvailabilityCheckResult> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      throw new Error("No se pudo conectar con la base de datos")
    }

    // Validar que checkOut > checkIn
    if (checkOut <= checkIn) {
      return {
        available: false,
        conflicts: [{
          booking: {} as BookingWithDetails,
          conflictType: 'commercial',
          message: "La fecha de salida debe ser posterior a la fecha de entrada"
        }]
      }
    }

    // Obtener información de la propiedad para validar mínimo de noches
    const { data: property } = await supabase
      .from('properties')
      .select('min_nights')
      .eq('id', propertyId)
      .single()

    const minNights = property?.min_nights || 1

    // Validar mínimo de noches SOLO para reservas comerciales (no para períodos cerrados)
    if (bookingType === 'commercial') {
      const nights = calculateNights(checkIn, checkOut)
      if (nights < minNights) {
        return {
          available: false,
          conflicts: [{
            booking: {} as BookingWithDetails,
            conflictType: 'commercial',
            message: `El número mínimo de noches para esta propiedad es ${minNights}. Has seleccionado ${nights} ${nights === 1 ? 'noche' : 'noches'}.`
          }]
        }
      }
    }

    // Obtener todas las reservas que se solapan con el rango solicitado
    // Un solapamiento ocurre cuando: check_in_date < checkOut AND check_out_date > checkIn
    const checkInStr = formatDateForAPI(checkIn)
    const checkOutStr = formatDateForAPI(checkOut)

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('property_id', propertyId)
      .eq('tenant_id', tenantId)
      .lt('check_in_date', checkOutStr)
      .gt('check_out_date', checkInStr)

    if (error) {
      console.error('Error checking availability:', error)
      throw error
    }

    // Obtener estados de reserva para filtrar canceladas
    const bookingStatusIds = [...new Set((bookings || []).map((b: any) => b.booking_status_id).filter(Boolean))]
    const bookingStatusesMap = new Map<string, { value: string }>()

    if (bookingStatusIds.length > 0) {
      const { data: statuses } = await supabase
        .from('configuration_values')
        .select('id, value')
        .in('id', bookingStatusIds)

        ; (statuses || []).forEach((status: any) => {
          bookingStatusesMap.set(status.id, { value: status.value })
        })
    }

    // Filtrar reservas canceladas (no deben bloquear disponibilidad)
    const activeBookings = (bookings || []).filter((booking: any) => {
      if (!booking.booking_status_id) {
        // Si no tiene estado, asumimos que está activa
        return true
      }
      const status = bookingStatusesMap.get(booking.booking_status_id)
      // Excluir reservas canceladas
      return status?.value !== 'cancelled'
    })

    // Filtrar reservas que realmente se solapan
    const conflicts: AvailabilityConflict[] = []

    // Normalizar fechas de entrada a medianoche local para asegurar consistencia
    const normalizedCheckIn = parseLocalDate(formatDateForAPI(checkIn))
    const normalizedCheckOut = parseLocalDate(formatDateForAPI(checkOut))

    for (const booking of activeBookings) {
      // Excluir la reserva actual si se está editando
      if (excludeBookingId && booking.id === excludeBookingId) {
        continue
      }

      // Normalizar fechas de la reserva de la DB a medianoche local
      const bookingCheckIn = parseLocalDate(booking.check_in_date.split('T')[0])
      const bookingCheckOut = parseLocalDate(booking.check_out_date.split('T')[0])

      // Verificar solapamiento
      if (datesOverlap(normalizedCheckIn, normalizedCheckOut, bookingCheckIn, bookingCheckOut)) {
        // Obtener tipo de reserva para determinar el mensaje
        let conflictType: 'commercial' | 'closed_period' = 'commercial'
        let message = ""

        if (booking.booking_type_id) {
          // Obtener el tipo de reserva
          const { data: bookingType } = await supabase
            .from('configuration_values')
            .select('value, label')
            .eq('id', booking.booking_type_id)
            .single()

          if (bookingType?.value === 'closed_period') {
            conflictType = 'closed_period'
            message = `Período cerrado del ${bookingCheckIn.toLocaleDateString('es-ES')} al ${bookingCheckOut.toLocaleDateString('es-ES')}`
          } else {
            // Obtener información del huésped si es reserva comercial
            if (booking.person_id) {
              const { data: person } = await supabase
                .from('persons')
                .select('first_name, last_name')
                .eq('id', booking.person_id)
                .single()

              const guestName = person
                ? `${person.first_name} ${person.last_name}`
                : "Huésped desconocido"

              message = `Reserva existente de ${guestName} del ${bookingCheckIn.toLocaleDateString('es-ES')} al ${bookingCheckOut.toLocaleDateString('es-ES')}`
            } else {
              message = `Reserva existente del ${bookingCheckIn.toLocaleDateString('es-ES')} al ${bookingCheckOut.toLocaleDateString('es-ES')}`
            }
          }
        } else {
          // Si no tiene tipo, asumimos que es comercial (reservas antiguas)
          if (booking.person_id) {
            const { data: person } = await supabase
              .from('persons')
              .select('first_name, last_name')
              .eq('id', booking.person_id)
              .single()

            const guestName = person
              ? `${person.first_name} ${person.last_name}`
              : "Huésped desconocido"

            message = `Reserva existente de ${guestName} del ${bookingCheckIn.toLocaleDateString('es-ES')} al ${bookingCheckOut.toLocaleDateString('es-ES')}`
          } else {
            message = `Reserva existente del ${bookingCheckIn.toLocaleDateString('es-ES')} al ${bookingCheckOut.toLocaleDateString('es-ES')}`
          }
        }

        conflicts.push({
          booking: booking as BookingWithDetails,
          conflictType,
          message
        })
      }
    }

    return {
      available: conflicts.length === 0,
      conflicts
    }
  } catch (error) {
    console.error('Error in checkAvailability:', error)
    throw error
  }
}

/**
 * Verifica la disponibilidad antes de crear o actualizar una reserva
 * Esta función es un wrapper que puede ser usado desde el formulario de reservas
 * @param propertyId ID de la propiedad
 * @param tenantId ID del tenant
 * @param checkIn Fecha de entrada
 * @param checkOut Fecha de salida
 * @param bookingId ID de reserva si se está editando (opcional)
 * @returns Resultado de la verificación
 */
export async function validateBookingAvailability(
  propertyId: string,
  tenantId: string,
  checkIn: string | Date,
  checkOut: string | Date,
  bookingId?: string,
  bookingType?: 'commercial' | 'closed_period'
): Promise<{ valid: boolean; message?: string; conflicts?: AvailabilityConflict[] }> {
  try {
    const checkInDate = checkIn instanceof Date ? checkIn : new Date(checkIn)
    const checkOutDate = checkOut instanceof Date ? checkOut : new Date(checkOut)

    const result = await checkAvailability(
      propertyId,
      tenantId,
      checkInDate,
      checkOutDate,
      bookingId,
      bookingType
    )

    if (!result.available) {
      const conflictMessages = result.conflicts.map(c => c.message).join('; ')
      return {
        valid: false,
        message: `Conflicto de disponibilidad: ${conflictMessages}`,
        conflicts: result.conflicts
      }
    }

    return { valid: true }
  } catch (error: any) {
    console.error('Error validating booking availability:', error)
    return {
      valid: false,
      message: error?.message || "Error al verificar la disponibilidad"
    }
  }
}

/**
 * Obtiene los próximos 4 periodos disponibles para una propiedad
 * Considera reservas comerciales, períodos cerrados y el mínimo de noches
 * @param propertyId ID de la propiedad
 * @param tenantId ID del tenant
 * @param maxDaysToSearch Número máximo de días a buscar hacia adelante (por defecto 365)
 * @returns Array con los próximos 4 periodos disponibles
 */
export async function getNextAvailablePeriods(
  propertyId: string,
  tenantId: string,
  maxDaysToSearch: number = 365
): Promise<AvailablePeriod[]> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      throw new Error("No se pudo conectar con la base de datos")
    }

    // Obtener información de la propiedad
    const { data: property } = await supabase
      .from('properties')
      .select('min_nights')
      .eq('id', propertyId)
      .single()

    const minNights = property?.min_nights || 1

    // Obtener todas las reservas y períodos cerrados desde hoy
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + maxDaysToSearch)

    const todayStr = formatDateForAPI(today)
    const endDateStr = formatDateForAPI(endDate)

    // Obtener todas las reservas que se solapan con el rango de búsqueda
    // Una reserva se solapa si: check_in_date <= endDate AND check_out_date >= today
    // Usamos dos consultas separadas y las combinamos para asegurar que capturamos todo
    const { data: bookings1, error: error1 } = await supabase
      .from('bookings')
      .select('*')
      .eq('property_id', propertyId)
      .eq('tenant_id', tenantId)
      .gte('check_out_date', todayStr) // Reservas que terminan hoy o después
      .order('check_in_date', { ascending: true })

    const { data: bookings2, error: error2 } = await supabase
      .from('bookings')
      .select('*')
      .eq('property_id', propertyId)
      .eq('tenant_id', tenantId)
      .lte('check_in_date', endDateStr) // Reservas que empiezan antes del límite
      .order('check_in_date', { ascending: true })

    if (error1 || error2) {
      console.error('Error fetching bookings for available periods:', error1 || error2)
      throw error1 || error2
    }

    // Combinar y deduplicar reservas
    const allBookings = [...(bookings1 || []), ...(bookings2 || [])]
    const uniqueBookings = Array.from(
      new Map(allBookings.map((b: any) => [b.id, b])).values()
    )

    // Filtrar solo las que realmente se solapan con el rango
    const bookings = uniqueBookings.filter((booking: any) => {
      const bookingStart = parseLocalDate(booking.check_in_date.split('T')[0])
      const bookingEnd = parseLocalDate(booking.check_out_date.split('T')[0])
      return bookingStart <= endDate && bookingEnd >= today
    })

    // Crear array de bloques ocupados (reservas comerciales y períodos cerrados)
    // Normalizar fechas para evitar problemas de hora
    const occupiedBlocks: Array<{ start: Date; end: Date }> = []

      ; (bookings || []).forEach((booking: any) => {
        const start = parseLocalDate(booking.check_in_date.split('T')[0])
        const end = parseLocalDate(booking.check_out_date.split('T')[0])

        // Solo incluir bloques que se solapan con el rango de búsqueda
        if (end >= today && start <= endDate) {
          occupiedBlocks.push({ start, end })
        }
      })

    // Ordenar bloques por fecha de inicio
    occupiedBlocks.sort((a, b) => a.start.getTime() - b.start.getTime())

    // Fusionar bloques solapados para evitar duplicados
    const mergedBlocks: Array<{ start: Date; end: Date }> = []
    for (const block of occupiedBlocks) {
      if (mergedBlocks.length === 0) {
        mergedBlocks.push({ start: new Date(block.start), end: new Date(block.end) })
      } else {
        const lastBlock = mergedBlocks[mergedBlocks.length - 1]
        // Si el bloque actual se solapa o es adyacente al último, fusionarlos
        if (block.start <= lastBlock.end) {
          lastBlock.end = new Date(Math.max(lastBlock.end.getTime(), block.end.getTime()))
        } else {
          mergedBlocks.push({ start: new Date(block.start), end: new Date(block.end) })
        }
      }
    }

    // Buscar los próximos 4 periodos disponibles
    const availablePeriods: AvailablePeriod[] = []
    let currentDate = new Date(today)
    let periodsFound = 0

    while (periodsFound < 4 && currentDate < endDate) {
      // Buscar el siguiente bloque ocupado que se solape o esté después de currentDate
      const nextBlock = mergedBlocks.find(block => {
        // Un bloque se solapa si: block.start < currentDate + minNights AND block.end > currentDate
        const proposedEnd = new Date(currentDate)
        proposedEnd.setDate(proposedEnd.getDate() + minNights)
        return block.start < proposedEnd && block.end > currentDate
      })

      if (!nextBlock) {
        // No hay bloques que se solapen, verificar si hay espacio hasta el siguiente bloque o el final
        const nextBlockAfter = mergedBlocks.find(block => block.start >= currentDate)

        let availableEnd: Date
        if (nextBlockAfter) {
          availableEnd = new Date(nextBlockAfter.start)
        } else {
          availableEnd = new Date(endDate)
        }

        const proposedEnd = new Date(currentDate)
        proposedEnd.setDate(proposedEnd.getDate() + minNights)

        if (proposedEnd <= availableEnd) {
          // Hay espacio suficiente
          availablePeriods.push({
            checkIn: new Date(currentDate),
            checkOut: proposedEnd,
            nights: minNights
          })
          periodsFound++

          // Mover al día siguiente al periodo encontrado para buscar el siguiente
          currentDate = new Date(proposedEnd)
        } else {
          // No hay espacio suficiente, mover al siguiente bloque
          if (nextBlockAfter) {
            currentDate = new Date(nextBlockAfter.end)
          } else {
            break
          }
        }
      } else {
        // Hay un bloque que se solapa, mover al final de ese bloque
        currentDate = new Date(nextBlock.end)
      }
    }

    return availablePeriods
  } catch (error) {
    console.error('Error in getNextAvailablePeriods:', error)
    throw error
  }
}
