import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getBookingById } from "@/lib/api/bookings"
import { getProperties } from "@/lib/api/properties"
import { getConfigurationTypes, getConfigurationValues } from "@/lib/api/configuration"
import { BookingForm } from "@/components/bookings/BookingForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { updateBooking } from "@/lib/api/bookings"
import type { UpdateBookingData } from "@/types/bookings"

export default async function EditBookingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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

  // Obtener la reserva
  const booking = await getBookingById(id, tenantId)

  if (!booking) {
    redirect("/dashboard/bookings")
  }

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

  const handleSave = async (data: UpdateBookingData): Promise<boolean> => {
    "use server"
    const result = await updateBooking(id, data, tenantId)
    return result !== null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/bookings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Editar Reserva {booking.booking_code}
          </h1>
          <p className="text-muted-foreground">
            Modifica los datos de la reserva
          </p>
        </div>
      </div>

      <BookingForm
        booking={booking}
        properties={properties}
        bookingStatuses={bookingStatuses}
        tenantId={tenantId}
        onSave={handleSave}
      />
    </div>
  )
}

