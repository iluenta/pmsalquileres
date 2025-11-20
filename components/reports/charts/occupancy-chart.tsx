"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { OccupancyData, MonthlyComparison } from "@/types/reports"
import { formatPercentage } from "@/lib/utils/reports-calculations"

interface OccupancyChartProps {
  data: OccupancyData[]
  comparisonData?: MonthlyComparison[]
  showComparison?: boolean
}

export function OccupancyByPropertyChart({ data }: OccupancyChartProps) {
  const chartData = data.slice(0, 10).map((item) => ({
    property: item.propertyName,
    occupancy: item.occupancyRate,
    bookedNights: item.bookedNights,
    availableNights: item.availableNights,
  }))

  const chartConfig = {
    occupancy: {
      label: "Ocupación",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ocupación por Propiedad</CardTitle>
        <CardDescription>Top 10 propiedades por tasa de ocupación</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="property" angle={-45} textAnchor="end" height={100} />
            <YAxis tickFormatter={(value) => `${value}%`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="occupancy" fill="hsl(var(--chart-1))" name="Ocupación %" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function OccupancyTrendChart({ data, comparisonData, showComparison = false }: OccupancyChartProps) {
  // Agrupar datos por mes si es necesario, o usar datos mensuales directamente
  const chartData = comparisonData || []

  const chartConfig = {
    occupancy: {
      label: "Ocupación",
      color: "hsl(var(--chart-1))",
    },
    previousOccupancy: {
      label: "Año Anterior",
      color: "hsl(var(--muted))",
    },
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolución de Ocupación</CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const formattedData = chartData.map((item) => ({
    month: item.month,
    occupancy: item.currentValue,
    previousOccupancy: showComparison ? item.previousValue : undefined,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución de Ocupación</CardTitle>
        <CardDescription>Comparativa de ocupación mensual</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `${value}%`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="occupancy"
              stroke="hsl(var(--chart-1))"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.6}
              name="Ocupación %"
            />
            {showComparison && (
              <Area
                type="monotone"
                dataKey="previousOccupancy"
                stroke="hsl(var(--muted))"
                fill="hsl(var(--muted))"
                fillOpacity={0.3}
                strokeDasharray="5 5"
                name="Año Anterior"
              />
            )}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

interface NightsComparisonChartProps {
  data: OccupancyData[]
}

export function NightsComparisonChart({ data }: NightsComparisonChartProps) {
  const chartData = data.slice(0, 10).map((item) => ({
    property: item.propertyName,
    booked: item.bookedNights,
    available: item.availableNights,
  }))

  const chartConfig = {
    booked: {
      label: "Noches Reservadas",
      color: "hsl(var(--chart-1))",
    },
    available: {
      label: "Noches Disponibles",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Noches Disponibles vs Reservadas</CardTitle>
        <CardDescription>Comparativa por propiedad</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="property" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="booked" fill="hsl(var(--chart-1))" name="Noches Reservadas" />
            <Bar dataKey="available" fill="hsl(var(--chart-2))" name="Noches Disponibles" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

