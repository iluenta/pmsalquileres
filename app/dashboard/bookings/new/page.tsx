import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProperties } from "@/lib/api/properties"
import { getConfigurationTypes, getConfigurationValues } from "@/lib/api/configuration"
import { BookingForm } from "@/components/bookings/BookingForm"
import { createBooking } from "@/lib/api/bookings"
import type { CreateBookingData, UpdateBookingData } from "@/types/bookings"

export default async function NewBookingPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userInfo } = await supabase.rpc("get_user_info", {
    p_user_id: user.id,
  })

  if (!userInfo || userInfo.length === 0) {
    redirect("/login")
  }

  const tenantId = userInfo[0].tenant_id

  // Obtener propiedades activas
  const allProperties = await getProperties()
  const properties = allProperties.filter((p) => p.is_active)

  // Obtener estados de reserva
  const configTypes = await getConfigurationTypes(tenantId)
  const bookingStatusType = configTypes.find(
    (t) =>
      t.name === "Estado de Reserva" ||
      t.name === "Booking Status" ||
      t.name === "Estados de Reserva"
  )

  let bookingStatuses: any[] = []
  if (bookingStatusType) {
    bookingStatuses = await getConfigurationValues(bookingStatusType.id)
  }

  const handleSave = async (data: CreateBookingData | UpdateBookingData): Promise<boolean> => {
    "use server"
    try {
      // Debug: Log de los datos recibidos
      console.log("[handleSave] Datos recibidos:", {
        property_id: data.property_id,
        person_id: data.person_id,
        booking_type_id: data.booking_type_id,
        check_in_date: data.check_in_date,
        check_out_date: data.check_out_date,
      })
      
      // Asegurar que tenemos los campos requeridos para CreateBookingData
      // Normalizar booking_type_id: convertir cadena vacía a null para la validación
      const normalizedBookingTypeId = data.booking_type_id && typeof data.booking_type_id === 'string' && data.booking_type_id.trim() !== "" ? data.booking_type_id.trim() : null
      
      if (!normalizedBookingTypeId) {
        throw new Error("Faltan campos requeridos: El tipo de reserva es obligatorio.")
      }

      // Determinar si es período cerrado consultando la base de datos
      let isClosedPeriod = false
      const supabase = await getSupabaseServerClient()
      if (normalizedBookingTypeId && supabase) {
        const { data: bookingType } = await supabase
          .from('configuration_values')
          .select('value')
          .eq('id', normalizedBookingTypeId)
          .single()
        
        isClosedPeriod = bookingType?.value === 'closed_period'
      }
      
      // Validaciones comunes (siempre requeridas)
      if (!data.property_id) {
        throw new Error("Faltan campos requeridos: La propiedad es obligatoria.")
      }
      if (!data.check_in_date) {
        throw new Error("Faltan campos requeridos: La fecha de entrada es obligatoria.")
      }
      if (!data.check_out_date) {
        throw new Error("Faltan campos requeridos: La fecha de salida es obligatoria.")
      }

      // Validaciones específicas para reservas comerciales (no períodos cerrados)
      if (!isClosedPeriod) {
        if (!data.person_id) {
          throw new Error("Faltan campos requeridos: El huésped es obligatorio para reservas comerciales.")
        }
        if (!data.booking_status_id) {
          throw new Error("Faltan campos requeridos: El estado de la reserva es obligatorio para reservas comerciales.")
        }
      }
      const createData: CreateBookingData = {
        property_id: data.property_id,
        person_id: data.person_id,
        booking_type_id: normalizedBookingTypeId, // Usar el valor normalizado
        channel_id: data.channel_id,
        channel_booking_number: data.channel_booking_number,
        check_in_date: data.check_in_date,
        check_out_date: data.check_out_date,
        number_of_guests: data.number_of_guests ?? 1,
        total_amount: data.total_amount ?? 0,
        sales_commission_amount: data.sales_commission_amount,
        collection_commission_amount: data.collection_commission_amount,
        tax_amount: data.tax_amount,
        net_amount: data.net_amount,
        booking_status_id: data.booking_status_id,
        notes: data.notes,
      }
      const result = await createBooking(createData)
      return result !== null
    } catch (error: any) {
      console.error("Error in handleSave:", error)
      throw error // Propagar el error para que se muestre en el toast
    }
  }

  return (
    <BookingForm
      properties={properties}
      bookingStatuses={bookingStatuses}
      tenantId={tenantId}
      onSave={handleSave}
    />
  )
}

