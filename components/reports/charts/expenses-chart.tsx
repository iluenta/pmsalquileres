"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, AreaChart, Area } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ExpenseData, ExpenseByProperty, RevenueData } from "@/types/reports"
import { formatCurrency } from "@/lib/utils/reports-calculations"

interface ExpensesByCategoryChartProps {
  data: ExpenseData[]
}

export function ExpensesByCategoryChart({ data }: ExpensesByCategoryChartProps) {
  const chartData = data.slice(0, 10).map((item) => ({
    category: item.category,
    amount: item.amount,
    count: item.count,
    percentage: item.percentage,
  }))

  const chartConfig = {
    amount: {
      label: "Importe",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Categoría</CardTitle>
        <CardDescription>Top 10 categorías de gastos</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="amount" fill="hsl(var(--chart-1))" name="Importe" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

interface ExpensesByPropertyChartProps {
  data: ExpenseByProperty[]
}

export function ExpensesByPropertyChart({ data }: ExpensesByPropertyChartProps) {
  // Agrupar categorías únicas
  const allCategories = new Set<string>()
  data.forEach((item) => {
    item.categories.forEach((cat) => allCategories.add(cat.category))
  })

  const categories = Array.from(allCategories).slice(0, 5) // Top 5 categorías

  const chartData = data.slice(0, 10).map((item) => {
    const result: Record<string, string | number> = {
      property: item.propertyName,
    }
    categories.forEach((cat) => {
      const categoryData = item.categories.find((c) => c.category === cat)
      result[cat] = categoryData?.amount || 0
    })
    return result
  })

  const chartConfig = categories.reduce((acc, cat, index) => {
    acc[cat] = {
      label: cat,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    }
    return acc
  }, {} as Record<string, { label: string; color: string }>)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Propiedad</CardTitle>
        <CardDescription>Desglose por categoría (Top 5)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="property" angle={-45} textAnchor="end" height={100} />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            {categories.map((cat, index) => (
              <Bar
                key={cat}
                dataKey={cat}
                stackId="a"
                fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                name={cat}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

interface RevenueVsExpensesChartProps {
  revenueData: RevenueData[]
  totalExpenses: number
}

export function RevenueVsExpensesChart({ revenueData, totalExpenses }: RevenueVsExpensesChartProps) {
  // Calcular gastos mensuales aproximados (distribución uniforme)
  const monthlyExpenses = totalExpenses / Math.max(1, revenueData.length)

  const chartData = revenueData.map((item) => ({
    month: item.month,
    revenue: item.revenue,
    netRevenue: item.netRevenue,
    expenses: monthlyExpenses,
  }))

  const chartConfig = {
    revenue: {
      label: "Ingresos",
      color: "hsl(var(--chart-1))",
    },
    netRevenue: {
      label: "Ingresos Netos",
      color: "hsl(var(--chart-2))",
    },
    expenses: {
      label: "Gastos",
      color: "hsl(var(--chart-3))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos vs Gastos</CardTitle>
        <CardDescription>Relación entre ingresos y gastos mensuales</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stackId="1"
              stroke="hsl(var(--chart-1))"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.6}
              name="Ingresos"
            />
            <Area
              type="monotone"
              dataKey="netRevenue"
              stackId="2"
              stroke="hsl(var(--chart-2))"
              fill="hsl(var(--chart-2))"
              fillOpacity={0.6}
              name="Ingresos Netos"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stackId="3"
              stroke="hsl(var(--chart-3))"
              fill="hsl(var(--chart-3))"
              fillOpacity={0.6}
              name="Gastos"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

