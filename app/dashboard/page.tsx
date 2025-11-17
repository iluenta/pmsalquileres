import { getDashboardStats, getRecentBookings, getPropertyOccupancy } from "@/lib/api/dashboard"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { cookies } from "next/headers"

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user info with tenant
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

  // Fetch dashboard data inicial
  const [stats, recentBookings, propertyOccupancy] = await Promise.all([
    getDashboardStats(tenantId, selectedYear),
    getRecentBookings(tenantId, 5, selectedYear),
    getPropertyOccupancy(tenantId, 5, selectedYear),
  ])

  return (
    <DashboardContent
      initialStats={stats}
      initialRecentBookings={recentBookings}
      initialPropertyOccupancy={propertyOccupancy}
      tenantId={tenantId}
    />
  )
}
