"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { MovementWithDetails } from "@/types/movements"

interface MovementsSummaryProps {
  movements: MovementWithDetails[]
  type: "income" | "expense"
}

export function MovementsSummary({ movements, type }: MovementsSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const { total, count } = useMemo(() => {
    const sum = movements.reduce((acc, movement) => acc + Number(movement.amount || 0), 0)
    return {
      total: sum,
      count: movements.length,
    }
  }, [movements])

  const isIncome = type === "income"
  const Icon = isIncome ? TrendingUp : TrendingDown
  const bgColor = isIncome 
    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900" 
    : "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900"
  const textColor = isIncome 
    ? "text-green-600 dark:text-green-400" 
    : "text-orange-600 dark:text-orange-400"
  const iconColor = isIncome 
    ? "text-green-600 dark:text-green-400" 
    : "text-orange-600 dark:text-orange-400"

  return (
    <Card className={`${bgColor} h-full flex flex-col`}>
      <CardContent className="py-3 flex-1 flex items-center">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className={`p-2 rounded-lg ${isIncome ? "bg-green-100 dark:bg-green-900/30" : "bg-orange-100 dark:bg-orange-900/30"}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total {isIncome ? "Ingresos" : "Gastos"}
              </p>
              <p className={`text-2xl font-bold ${textColor}`}>
                {isIncome ? "+" : "-"}
                {formatCurrency(total)}
              </p>
            </div>
          </div>
          <div className="text-right border-l pl-4">
            <p className="text-sm font-medium text-muted-foreground">
              Movimientos
            </p>
            <p className="text-lg font-semibold">
              {count}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
