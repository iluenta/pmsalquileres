"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { MonthCalendar } from "./MonthCalendar"
import type { CalendarDay } from "@/lib/api/calendar"

interface CalendarViewProps {
  propertyId: string
  currentMonth: Date
  onMonthChange: (date: Date) => void
  days?: CalendarDay[]
  onDayClick?: (day: CalendarDay) => void
  loading?: boolean
}

export function CalendarView({ propertyId, currentMonth, onMonthChange, days = [], onDayClick, loading }: CalendarViewProps) {
  // Asegurar que currentMonth siempre tenga un valor válido
  const safeCurrentMonth = currentMonth || new Date()
  
  // Si currentMonth es un string (serializado), convertirlo a Date
  const monthDate = safeCurrentMonth instanceof Date 
    ? safeCurrentMonth 
    : new Date(safeCurrentMonth)
  
  // Asegurar que days siempre sea un array
  const safeDays = Array.isArray(days) ? days : []

  const handlePrevMonth = () => {
    onMonthChange(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    onMonthChange(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1))
  }

  const getNextTwoMonths = () => {
    return [
      monthDate,
      new Date(monthDate.getFullYear(), monthDate.getMonth() + 1),
      new Date(monthDate.getFullYear(), monthDate.getMonth() + 2),
    ]
  }

  // Filtrar días para cada mes
  const filterDaysForMonth = (month: Date) => {
    if (!safeDays || !Array.isArray(safeDays)) {
      return []
    }
    return safeDays.filter(day => {
      if (!day || !day.date) return false
      const dayDate = day.date instanceof Date ? day.date : new Date(day.date)
      const dayMonth = dayDate.getMonth()
      const dayYear = dayDate.getFullYear()
      return dayMonth === month.getMonth() && dayYear === month.getFullYear()
    })
  }

  const monthDisplay = monthDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevMonth}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Mes Anterior
        </Button>
        <h3 className="text-lg font-semibold text-foreground">
          {monthDisplay}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextMonth}
          className="gap-2"
        >
          Mes Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Three Month Calendar Grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Cargando disponibilidad...</span>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {getNextTwoMonths().map((month, index) => (
            <MonthCalendar 
              key={index} 
              month={month} 
              days={filterDaysForMonth(month)}
              onDayClick={onDayClick}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      <Card className="p-4 bg-card border-border">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-emerald-500 dark:bg-emerald-600"></div>
            <span className="text-sm text-foreground">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-rose-500 dark:bg-rose-600"></div>
            <span className="text-sm text-foreground">Reserva</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-amber-500 dark:bg-amber-600"></div>
            <span className="text-sm text-foreground">Período Cerrado</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
