"use client"

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { CalendarDay } from "@/lib/api/calendar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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

  const getDayColor = (day: CalendarDay | null): string => {
    if (!day) return ""
    
    if (day.isAvailable) {
      return "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50"
    }
    
    if (day.bookingType === 'closed_period') {
      return "bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
    }
    
    // Reserva comercial
    return "bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50"
  }

  const getDayTooltip = (day: CalendarDay | null): string => {
    if (!day) return ""
    
    if (day.isAvailable) {
      return "Disponible"
    }
    
    if (day.bookingType === 'closed_period') {
      return `Período cerrado${day.isCheckIn ? " (Inicio)" : ""}`
    }
    
    if (day.booking) {
      const dateStr = format(day.date, 'dd/MM/yyyy')
      return day.guestName 
        ? `Reserva de ${day.guestName}${day.isCheckIn ? " (Inicio)" : ""} - ${dateStr}`
        : `Reserva${day.isCheckIn ? " (Inicio)" : ""} - ${dateStr}`
    }
    
    return "Ocupado"
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-center">
        {format(month, "MMMM yyyy", { locale: es })}
      </h3>
      
      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
          <div
            key={index}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendario */}
      <div className="grid grid-cols-7 gap-1">
        {/* Días vacíos al inicio */}
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* Días del mes */}
        {monthDays.map((date) => {
          const dateKey = format(date, 'yyyy-MM-dd')
          const day = daysMap.get(dateKey) || null
          const dayColor = getDayColor(day)
          const isCurrentDay = isToday(date)
          const isCurrentMonth = isSameMonth(date, month)

          return (
            <TooltipProvider key={dateKey}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "aspect-square rounded-md border border-border p-1 text-sm cursor-pointer transition-colors",
                      dayColor,
                      isCurrentDay && "ring-2 ring-primary ring-offset-2",
                      !isCurrentMonth && "opacity-50"
                    )}
                    onClick={() => day && onDayClick?.(day)}
                  >
                    <div className="flex flex-col h-full">
                      <span className={cn(
                        "text-xs font-medium",
                        isCurrentDay && "text-primary font-bold"
                      )}>
                        {format(date, "d")}
                      </span>
                      {day && !day.isAvailable && day.isCheckIn && day.guestName && (
                        <span className="text-[10px] truncate mt-auto font-medium">
                          {day.guestName.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getDayTooltip(day)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
    </div>
  )
}

