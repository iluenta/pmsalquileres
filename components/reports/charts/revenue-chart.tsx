"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { RevenueData, MonthlyComparison } from "@/types/reports"
import { formatCurrency } from "@/lib/utils/reports-calculations"

interface RevenueChartProps {
  data: RevenueData[]
  comparisonData?: MonthlyComparison[]
  showComparison?: boolean
}

export function RevenueChart({ data, comparisonData, showComparison = false }: RevenueChartProps) {
  type ChartDataPoint = {
    month: string
    revenue: number
    netRevenue: number
    adr: number
    revpar: number
    trevpar: number
    previousRevenue?: number
  }

  const chartData: ChartDataPoint[] = data.map((item) => ({
    month: item.month,
    revenue: item.revenue,
    netRevenue: item.netRevenue,
    adr: item.adr,
    revpar: item.revpar,
    trevpar: item.trevpar,
  }))

  // Si hay comparativa, añadir datos del año anterior
  if (showComparison && comparisonData) {
    comparisonData.forEach((comp, index) => {
      if (chartData[index]) {
        chartData[index] = {
          ...chartData[index],
          previousRevenue: comp.previousValue || undefined,
        }
      }
    })
  }

  const chartConfig = {
    revenue: {
      label: "Ingreso Bruto",
      color: "hsl(var(--chart-1))",
    },
    netRevenue: {
      label: "Ingreso Neto",
      color: "hsl(var(--chart-2))",
    },
    previousRevenue: {
      label: "Año Anterior",
      color: "hsl(var(--muted))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos Mensuales</CardTitle>
        <CardDescription>Evolución de ingresos brutos y netos por mes</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              name="Ingreso Bruto"
            />
            <Line
              type="monotone"
              dataKey="netRevenue"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              name="Ingreso Neto"
            />
            {showComparison && (
              <Line
                type="monotone"
                dataKey="previousRevenue"
                stroke="hsl(var(--muted))"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Año Anterior"
              />
            )}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

interface ADRRevPARChartProps {
  data: RevenueData[]
}

export function ADRRevPARChart({ data }: ADRRevPARChartProps) {
  const chartData = data.map((item) => ({
    month: item.month,
    adr: item.adr,
    revpar: item.revpar,
    trevpar: item.trevpar,
  }))

  const chartConfig = {
    adr: {
      label: "ADR",
      color: "hsl(var(--chart-1))",
    },
    revpar: {
      label: "RevPAR",
      color: "hsl(var(--chart-2))",
    },
    trevpar: {
      label: "TRevPAR",
      color: "hsl(var(--chart-3))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ADR, RevPAR y TRevPAR</CardTitle>
        <CardDescription>Métricas clave de rendimiento por mes</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="adr"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              name="ADR"
            />
            <Line
              type="monotone"
              dataKey="revpar"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              name="RevPAR"
            />
            <Line
              type="monotone"
              dataKey="trevpar"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              name="TRevPAR"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

