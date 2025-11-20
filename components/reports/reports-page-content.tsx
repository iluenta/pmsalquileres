"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportsFiltersComponent } from "./reports-filters"
import { KPICards } from "./kpi-cards"
import { RevenueChart, ADRRevPARChart } from "./charts/revenue-chart"
import { OccupancyByPropertyChart, OccupancyTrendChart, NightsComparisonChart } from "./charts/occupancy-chart"
import { ChannelDistributionPieChart, ChannelRevenueBarChart } from "./charts/channel-distribution-chart"
import { ExpensesByCategoryChart, ExpensesByPropertyChart, RevenueVsExpensesChart } from "./charts/expenses-chart"
import { OccupancyHeatmap } from "./charts/occupancy-heatmap"
import { BookingsTable } from "./bookings-table"
import { ExpensesTable } from "./expenses-table"
import { ProfitabilityTable } from "./profitability-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSeason } from "@/lib/contexts/season-context"
import { Loader2 } from "lucide-react"
import type { ReportsFilters, ReportsData, KPIData } from "@/types/reports"
import type { Property } from "@/lib/api/properties"
import type { BookingWithDetails } from "@/types/bookings"

interface ReportsPageContentProps {
  tenantId: string
  initialYear: number
  properties: Property[]
  channels: Array<{ id: string; name: string }>
  availableYears: number[]
}

export function ReportsPageContent({
  tenantId,
  initialYear,
  properties,
  channels,
  availableYears,
}: ReportsPageContentProps) {
  const { selectedYear } = useSeason()
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ReportsFilters>({
    year: initialYear || selectedYear || new Date().getFullYear(),
    dateFrom: initialYear ? `${initialYear}-01-01` : undefined,
    dateTo: initialYear ? `${initialYear}-12-31` : undefined,
    propertyId: undefined,
    channelId: undefined,
    compareEnabled: false,
    compareYear: undefined,
  })
  const [reportsData, setReportsData] = useState<ReportsData | null>(null)
  const [previousKPIs, setPreviousKPIs] = useState<Partial<KPIData> | null>(null)
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])

  // Cargar datos cuando cambian los filtros
  useEffect(() => {
    loadReportsData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, tenantId])

  const loadReportsData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (filters.year) {
        params.append("year", filters.year.toString())
      }
      if (filters.dateFrom) {
        params.append("dateFrom", filters.dateFrom)
      }
      if (filters.dateTo) {
        params.append("dateTo", filters.dateTo)
      }
      if (filters.propertyId) {
        params.append("propertyId", filters.propertyId)
      }
      if (filters.channelId) {
        params.append("channelId", filters.channelId)
      }
      if (filters.compareEnabled) {
        params.append("compareEnabled", "true")
        if (filters.compareYear) {
          params.append("compareYear", filters.compareYear.toString())
        }
      }

      const response = await fetch(`/api/reports?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setReportsData(data)
        
        // Si hay comparativa, calcular KPIs del año anterior
        if (filters.compareEnabled && filters.compareYear) {
          const prevParams = new URLSearchParams()
          prevParams.append("year", filters.compareYear.toString())
          if (filters.propertyId) {
            prevParams.append("propertyId", filters.propertyId)
          }
          if (filters.channelId) {
            prevParams.append("channelId", filters.channelId)
          }
          
          const prevResponse = await fetch(`/api/reports?${prevParams.toString()}`)
          if (prevResponse.ok) {
            const prevData = await prevResponse.json()
            setPreviousKPIs(prevData.kpis)
          }
        } else {
          setPreviousKPIs(null)
        }
      }

      // Cargar bookings para el heatmap
      const bookingsParams = new URLSearchParams()
      if (filters.year) {
        bookingsParams.append("year", filters.year.toString())
      }
      const bookingsResponse = await fetch(`/api/bookings?${bookingsParams.toString()}`)
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        setBookings(bookingsData)
      }
    } catch (error) {
      console.error("Error loading reports data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !reportsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!reportsData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se pudieron cargar los datos de reportes</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground">Análisis completo del rendimiento de tu negocio</p>
      </div>

      <ReportsFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        properties={properties}
        channels={channels}
        availableYears={availableYears}
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="revenue">Ingresos y Rentabilidad</TabsTrigger>
          <TabsTrigger value="bookings">Reservas</TabsTrigger>
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
          <TabsTrigger value="occupancy">Ocupación y Calendario</TabsTrigger>
        </TabsList>

        {/* Vista General */}
        <TabsContent value="overview" className="space-y-6">
          <KPICards kpis={reportsData.kpis} previousKPIs={previousKPIs} />
          
          <div className="grid gap-6 lg:grid-cols-2">
            <RevenueChart
              data={reportsData.revenue}
              comparisonData={filters.compareEnabled ? reportsData.monthlyComparison.revenue : undefined}
              showComparison={filters.compareEnabled || false}
            />
            <OccupancyByPropertyChart data={reportsData.occupancy.slice(0, 10)} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChannelDistributionPieChart data={reportsData.channels} />
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Propiedades por Rentabilidad</CardTitle>
                <CardDescription>Propiedades con mayor beneficio neto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <ProfitabilityTable data={reportsData.profitability.slice(0, 5)} showCard={false} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Ingresos y Rentabilidad */}
        <TabsContent value="revenue" className="space-y-6">
          <KPICards kpis={reportsData.kpis} previousKPIs={previousKPIs} />
          
          <RevenueChart
            data={reportsData.revenue}
            comparisonData={filters.compareEnabled ? reportsData.monthlyComparison.revenue : undefined}
            showComparison={filters.compareEnabled || false}
          />
          
          <ADRRevPARChart data={reportsData.revenue} />
          
          <div className="grid gap-6 lg:grid-cols-2">
            <ProfitabilityTable data={reportsData.profitability} />
            <RevenueVsExpensesChart
              revenueData={reportsData.revenue}
              totalExpenses={reportsData.expenses.reduce((sum, e) => sum + e.amount, 0)}
            />
          </div>
        </TabsContent>

        {/* Reservas */}
        <TabsContent value="bookings" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Antelación Media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(reportsData.kpis.averageAdvanceBooking)} días
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Estancia Media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(reportsData.kpis.averageStayDuration)} días
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Lead Time Medio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(reportsData.kpis.averageLeadTime)} días
                </div>
              </CardContent>
            </Card>
          </div>

          <ChannelRevenueBarChart data={reportsData.channels} />
          
          <BookingsTable data={reportsData.bookings} />
        </TabsContent>

        {/* Gastos */}
        <TabsContent value="expenses" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ExpensesByCategoryChart data={reportsData.expenses} />
            <ExpensesByPropertyChart data={reportsData.expensesByProperty} />
          </div>

          <RevenueVsExpensesChart
            revenueData={reportsData.revenue}
            totalExpenses={reportsData.expenses.reduce((sum, e) => sum + e.amount, 0)}
          />

          <ExpensesTable
            expenses={reportsData.expenses}
            expensesByProperty={reportsData.expensesByProperty}
          />
        </TabsContent>

        {/* Ocupación y Calendario */}
        <TabsContent value="occupancy" className="space-y-6">
          <OccupancyByPropertyChart data={reportsData.occupancy} />
          
          <NightsComparisonChart data={reportsData.occupancy} />
          
          <OccupancyTrendChart
            data={reportsData.occupancy}
            comparisonData={filters.compareEnabled ? reportsData.monthlyComparison.occupancy : undefined}
            showComparison={filters.compareEnabled || false}
          />
          
          <OccupancyHeatmap
            bookings={bookings}
            year={filters.year || new Date().getFullYear()}
            propertyId={filters.propertyId || undefined}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

