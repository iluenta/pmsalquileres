import { getBookings } from "@/lib/api/bookings"
import { getProperties } from "@/lib/api/properties"
import { getConfigurationTypes, getConfigurationValues } from "@/lib/api/configuration"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { BookingsTableWrapper } from "@/components/bookings/BookingsTableWrapper"
import { cookies } from "next/headers"

export default async function BookingsPage() {
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

  // Obtener año seleccionado desde cookies (si existe)
  const cookieStore = await cookies()
  const selectedYearCookie = cookieStore.get("selected-season-year")
  const selectedYear = selectedYearCookie?.value && selectedYearCookie.value !== "all"
    ? parseInt(selectedYearCookie.value, 10)
    : null // null significa "Todos"

  // Obtener datos en paralelo
  const [bookings, properties, configurationTypes] = await Promise.all([
    getBookings(tenantId, selectedYear),
    getProperties(tenantId),
    getConfigurationTypes(tenantId),
  ])

  // Buscar el tipo de configuración "Estado de Reserva"
  const bookingStatusType = configurationTypes.find(
    (type) =>
      type.name === "Estado de Reserva" ||
      type.name === "Booking Status" ||
      type.name === "Estados de Reserva"
  )

  // Buscar el tipo de configuración "Tipo de Reserva"
  const bookingTypeConfig = configurationTypes.find(
    (type) =>
      type.name === "Tipo de Reserva" ||
      type.name === "Booking Type"
  )

  // Obtener los valores de estado de reserva
  let bookingStatuses: any[] = []
  if (bookingStatusType) {
    bookingStatuses = await getConfigurationValues(bookingStatusType.id)
  }

  // Obtener los valores de tipo de reserva
  let bookingTypes: any[] = []
  if (bookingTypeConfig) {
    bookingTypes = await getConfigurationValues(bookingTypeConfig.id)
  }

  return (
    <div className="p-6 h-full overflow-y-auto space-y-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between py-2">
        <div className="flex-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Reservas</h1>
          <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mt-2">
            Gestiona las reservas de tus propiedades
          </p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-12 px-8 font-black uppercase text-[11px] tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-95">
          <Link href="/dashboard/bookings/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Reserva
          </Link>
        </Button>
      </div>

      <BookingsTableWrapper
        initialBookings={bookings}
        properties={properties}
        bookingStatuses={bookingStatuses}
        bookingTypes={bookingTypes}
      />
    </div>
  )
}
