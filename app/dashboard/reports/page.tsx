import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProperties } from "@/lib/api/properties"
import { getSalesChannels } from "@/lib/api/sales-channels"
import { ReportsPageContent } from "@/components/reports/reports-page-content"
import { cookies } from "next/headers"

export default async function ReportsPage() {
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

  // Obtener año seleccionado desde cookies
  const cookieStore = await cookies()
  const selectedYearCookie = cookieStore.get("selected-season-year")
  const selectedYear = selectedYearCookie?.value && selectedYearCookie.value !== "all"
    ? parseInt(selectedYearCookie.value, 10)
    : new Date().getFullYear()

  // Obtener propiedades y canales para los filtros
  const [allProperties, allChannels] = await Promise.all([
    getProperties(),
    getSalesChannels(tenantId),
  ])

  const properties = allProperties.filter((p) => p.is_active)
  const channels = allChannels
    .filter((c) => c.is_active)
    .map((c) => ({
      id: c.id,
      name: c.person?.full_name || "Canal desconocido",
    }))

  // Obtener años disponibles (de bookings)
  const { data: bookingsYears } = await supabase
    .from("bookings")
    .select("check_in_date")
    .eq("tenant_id", tenantId)

  const yearsSet = new Set<number>()
  bookingsYears?.forEach((booking: any) => {
    if (booking.check_in_date) {
      const year = new Date(booking.check_in_date).getFullYear()
      yearsSet.add(year)
    }
  })

  const availableYears = Array.from(yearsSet).sort((a, b) => b - a)

  // Si no hay años, usar año actual ± 2
  if (availableYears.length === 0) {
    const currentYear = new Date().getFullYear()
    for (let i = -2; i <= 2; i++) {
      availableYears.push(currentYear + i)
    }
  }

  return (
    <ReportsPageContent
      tenantId={tenantId}
      initialYear={selectedYear}
      properties={properties}
      channels={channels}
      availableYears={availableYears}
    />
  )
}
