"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { KPIData } from "@/types/reports"
import { formatCurrency, formatPercentage } from "@/lib/utils/reports-calculations"

interface KPICardProps {
  title: string
  value: string | number
  previousValue?: number | null
  format?: "currency" | "percentage" | "number" | "days"
  icon?: React.ReactNode
  description?: string
}

function KPICard({ title, value, previousValue, format = "number", icon, description }: KPICardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === "string") return val
    
    switch (format) {
      case "currency":
        return formatCurrency(val)
      case "percentage":
        return formatPercentage(val)
      case "days":
        return `${Math.round(val)} días`
      default:
        return val.toLocaleString("es-ES")
    }
  }

  const change = previousValue !== null && previousValue !== undefined && previousValue !== 0
    ? ((typeof value === "number" ? value : parseFloat(value.toString())) - previousValue) / previousValue * 100
    : null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {change !== null && (
          <div className="flex items-center text-xs mt-2">
            {change > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
            ) : change < 0 ? (
              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
            ) : (
              <Minus className="h-3 w-3 text-muted-foreground mr-1" />
            )}
            <span className={change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-muted-foreground"}>
              {change > 0 ? "+" : ""}
              {change.toFixed(1)}% vs anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface KPICardsProps {
  kpis: KPIData
  previousKPIs?: Partial<KPIData> | null
}

export function KPICards({ kpis, previousKPIs }: KPICardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Ingreso Bruto"
        value={kpis.totalRevenue}
        previousValue={previousKPIs?.totalRevenue}
        format="currency"
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        description="Ingresos totales del período"
      />
      <KPICard
        title="Ingreso Neto"
        value={kpis.netRevenue}
        previousValue={previousKPIs?.netRevenue}
        format="currency"
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        description="Después de comisiones e impuestos"
      />
      <KPICard
        title="Ocupación"
        value={kpis.occupancyRate}
        previousValue={previousKPIs?.occupancyRate}
        format="percentage"
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        description="Porcentaje de ocupación"
      />
      <KPICard
        title="ADR"
        value={kpis.adr}
        previousValue={previousKPIs?.adr}
        format="currency"
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        description="Average Daily Rate"
      />
      <KPICard
        title="RevPAR"
        value={kpis.revpar}
        previousValue={previousKPIs?.revpar}
        format="currency"
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        description="Revenue per Available Room"
      />
      <KPICard
        title="TRevPAR"
        value={kpis.trevpar}
        previousValue={previousKPIs?.trevpar}
        format="currency"
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        description="Total Revenue per Available Room"
      />
      <KPICard
        title="Beneficio Neto"
        value={kpis.netProfit}
        previousValue={previousKPIs?.netProfit}
        format="currency"
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        description="Ingresos - Gastos"
      />
      <KPICard
        title="Reservas"
        value={kpis.totalBookings}
        previousValue={previousKPIs?.totalBookings}
        format="number"
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        description="Total de reservas"
      />
      <KPICard
        title="Noches Reservadas"
        value={kpis.nightsBooked}
        previousValue={previousKPIs?.nightsBooked}
        format="number"
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        description="Total de noches reservadas"
      />
      <KPICard
        title="Lead Time Medio"
        value={kpis.averageLeadTime}
        previousValue={previousKPIs?.averageLeadTime}
        format="days"
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        description="Días entre booking y check-in"
      />
      <KPICard
        title="Antelación Media"
        value={kpis.averageAdvanceBooking}
        previousValue={previousKPIs?.averageAdvanceBooking}
        format="days"
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        description="Días de antelación promedio"
      />
      <KPICard
        title="Estancia Media"
        value={kpis.averageStayDuration}
        previousValue={previousKPIs?.averageStayDuration}
        format="days"
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        description="Duración promedio de estancia"
      />
    </div>
  )
}

