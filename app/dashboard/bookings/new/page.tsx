import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProperties } from "@/lib/api/properties"
import { getConfigurationTypes, getConfigurationValues } from "@/lib/api/configuration"
import { BookingForm } from "@/components/bookings/BookingForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createBooking } from "@/lib/api/bookings"
import type { CreateBookingData } from "@/types/bookings"

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

  const handleSave = async (data: CreateBookingData): Promise<boolean> => {
    "use server"
    const result = await createBooking(data)
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
          <h1 className="text-3xl font-bold tracking-tight">Nueva Reserva</h1>
          <p className="text-muted-foreground">
            Crea una nueva reserva para una propiedad
          </p>
        </div>
      </div>

      <BookingForm
        properties={properties}
        bookingStatuses={bookingStatuses}
        tenantId={tenantId}
        onSave={handleSave}
      />
    </div>
  )
}

