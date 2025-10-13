import { getDashboardStats, getRecentBookings, getPropertyOccupancy } from "@/lib/api/dashboard"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { StatCard } from "@/components/dashboard/stat-card"
import { RecentBookingsTable } from "@/components/dashboard/recent-bookings-table"
import { OccupancyChart } from "@/components/dashboard/occupancy-chart"
import { Building2, Calendar, Users, Euro, TrendingUp, AlertCircle } from "lucide-react"
import { redirect } from "next/navigation"

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

  // Fetch dashboard data
  const [stats, recentBookings, propertyOccupancy] = await Promise.all([
    getDashboardStats(tenantId),
    getRecentBookings(tenantId, 5),
    getPropertyOccupancy(tenantId, 5),
  ])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de tu negocio de alquileres vacacionales</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Propiedades Activas" value={stats.totalProperties} icon={Building2} />
        <StatCard title="Reservas Activas" value={stats.activeBookings} icon={Calendar} />
        <StatCard title="Total Huéspedes" value={stats.totalGuests} icon={Users} />
        <StatCard title="Ingresos del Mes" value={formatCurrency(stats.monthlyRevenue)} icon={Euro} />
        <StatCard title="Tasa de Ocupación" value={`${stats.occupancyRate}%`} icon={TrendingUp} />
        <StatCard title="Pagos Pendientes" value={formatCurrency(stats.pendingPayments)} icon={AlertCircle} />
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentBookingsTable bookings={recentBookings} />
        <OccupancyChart data={propertyOccupancy} />
      </div>
    </div>
  )
}
