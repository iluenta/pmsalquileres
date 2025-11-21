"use client"

import { useEffect, useState } from "react"
import { useSeason } from "@/lib/contexts/season-context"
import { StatCard } from "@/components/dashboard/stat-card"
import { RecentBookingsTable } from "@/components/dashboard/recent-bookings-table"
import { OccupancyChart } from "@/components/dashboard/occupancy-chart"
import { Building2, Calendar, Users, Euro, TrendingUp, AlertCircle } from "lucide-react"
import { DashboardStats, RecentBooking, PropertyOccupancy } from "@/lib/api/dashboard"

interface DashboardContentProps {
  initialStats: DashboardStats
  initialRecentBookings: RecentBooking[]
  initialPropertyOccupancy: PropertyOccupancy[]
  tenantId: string
}

export function DashboardContent({
  initialStats,
  initialRecentBookings,
  initialPropertyOccupancy,
  tenantId,
}: DashboardContentProps) {
  const { selectedYear } = useSeason()
  const [stats, setStats] = useState(initialStats)
  const [recentBookings, setRecentBookings] = useState(initialRecentBookings)
  const [propertyOccupancy, setPropertyOccupancy] = useState(initialPropertyOccupancy)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const yearParam = selectedYear ? `year=${selectedYear}` : "year=all"
        const response = await fetch(`/api/dashboard/stats?${yearParam}`)
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
          setRecentBookings(data.recentBookings)
          setPropertyOccupancy(data.propertyOccupancy)
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedYear, tenantId])

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

