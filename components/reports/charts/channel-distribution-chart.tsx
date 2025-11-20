"use client"

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ChannelData } from "@/types/reports"
import { formatCurrency } from "@/lib/utils/reports-calculations"

interface ChannelDistributionChartProps {
  data: ChannelData[]
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--muted))",
]

export function ChannelDistributionPieChart({ data }: ChannelDistributionChartProps) {
  const chartData = data.map((item) => ({
    name: item.channelName,
    value: item.revenue,
    percentage: item.percentage,
  }))

  const chartConfig = chartData.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: COLORS[index % COLORS.length],
    }
    return acc
  }, {} as Record<string, { label: string; color: string }>)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución por Canales</CardTitle>
        <CardDescription>Porcentaje de ingresos por canal de venta</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function ChannelRevenueBarChart({ data }: ChannelDistributionChartProps) {
  const chartData = data
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map((item) => ({
      channel: item.channelName,
      revenue: item.revenue,
      bookings: item.bookings,
      nights: item.nights,
    }))

  const chartConfig = {
    revenue: {
      label: "Ingresos",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos por Canal</CardTitle>
        <CardDescription>Top 10 canales por ingresos</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="channel" angle={-45} textAnchor="end" height={100} />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="revenue" fill="hsl(var(--chart-1))" name="Ingresos" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

