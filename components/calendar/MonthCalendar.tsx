"use client"

import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import type { CalendarDay } from "@/lib/api/calendar"

interface MonthCalendarProps {
  month: Date
  days: CalendarDay[]
  onDayClick?: (day: CalendarDay) => void
}

export function MonthCalendar({ month, days, onDayClick }: MonthCalendarProps) {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Obtener el primer día de la semana del mes (0 = domingo, 1 = lunes, etc.)
  const firstDayOfWeek = monthStart.getDay()
  // Ajustar para que la semana empiece en lunes (0 = lunes)
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  // Crear array de días vacíos al inicio
  const emptyDays = Array(adjustedFirstDay).fill(null)

  // Crear mapa de días para acceso rápido
  const daysMap = new Map<string, CalendarDay>()
  days.forEach(day => {
    const dateKey = format(day.date, 'yyyy-MM-dd')
    daysMap.set(dateKey, day)
  })

  const getStatusColor = (day: CalendarDay | null): string => {
    if (!day) {
      return "bg-emerald-50 dark:bg-emerald-950 text-foreground hover:bg-emerald-100 dark:hover:bg-emerald-900"
    }
    
    if (day.isAvailable) {
      return "bg-emerald-50 dark:bg-emerald-950 text-foreground hover:bg-emerald-100 dark:hover:bg-emerald-900"
    }
    
    if (day.bookingType === 'closed_period') {
      return "bg-amber-500 dark:bg-amber-600 text-white dark:text-white"
    }
    
    // Reserva comercial
    return "bg-rose-500 dark:bg-rose-600 text-white dark:text-white"
  }

  const monthName = month.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <Card className="overflow-hidden border-border">
      <div className="bg-gradient-to-r from-muted/50 to-muted/30 dark:from-muted/30 dark:to-muted/20 p-4">
        <h3 className="text-center font-semibold text-foreground text-pretty capitalize">
          {monthName}
        </h3>
      </div>

      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Days */}
          {monthDays.map((date) => {
            const dateKey = format(date, 'yyyy-MM-dd')
            const day = daysMap.get(dateKey) || null
            const isReserved = day && !day.isAvailable
            const statusColor = getStatusColor(day)

            return (
              <div
                key={dateKey}
                className={cn(
                  "aspect-square rounded-md border border-border flex flex-col items-center justify-center p-1 text-xs transition-colors cursor-pointer",
                  statusColor
                )}
                title={
                  isReserved && day.booking
                    ? `${day.guestName || 'Reserva'} (${format(day.date, 'dd/MM/yyyy')})`
                    : day?.bookingType === 'closed_period'
                    ? 'Período Cerrado'
                    : 'Disponible'
                }
                onClick={() => day && onDayClick?.(day)}
              >
                <span className="font-semibold">{format(date, "d")}</span>
                {isReserved && day.guestName && (
                  <span className="text-xs font-medium leading-tight text-center line-clamp-2">
                    {day.guestName}
                  </span>
                )}
                {day?.bookingType === 'closed_period' && (
                  <span className="text-xs font-medium leading-tight text-center line-clamp-2">
                    Período Cerrado
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

