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
      // Asegurar que tenemos los campos requeridos para CreateBookingData
      if (!data.property_id || !data.person_id || !data.check_in_date || !data.check_out_date) {
        throw new Error("Faltan campos requeridos para crear la reserva")
      }
      const createData: CreateBookingData = {
        property_id: data.property_id,
        person_id: data.person_id,
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

