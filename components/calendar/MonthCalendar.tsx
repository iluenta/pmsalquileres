"use client"

import { format, startOfMonth, endOfMonth, eachDayOfInterval, addDays, subDays } from "date-fns"
import { cn } from "@/lib/utils"
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

  const firstDayOfWeek = monthStart.getDay()
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
  const emptyDays = Array(adjustedFirstDay).fill(null)

  const daysMap = new Map<string, CalendarDay>()
  days.forEach(day => {
    const d = day.date instanceof Date ? day.date : new Date(day.date)
    const dateKey = format(d, 'yyyy-MM-dd')
    daysMap.set(dateKey, day)
  })

  // Lógica para determinar el estilo de "Cinta" profesional continua
  const getBookingStyles = (day: CalendarDay, date: Date) => {
    if (day.isAvailable || (!day.booking && day.bookingType !== 'closed_period')) return ""

    const bookingId = day.booking?.id || 'closed'
    const prevDateKey = format(subDays(date, 1), 'yyyy-MM-dd')
    const nextDateKey = format(addDays(date, 1), 'yyyy-MM-dd')

    const isContinuationFromPrev = daysMap.get(prevDateKey)?.booking?.id === bookingId || (day.bookingType === 'closed_period' && daysMap.get(prevDateKey)?.bookingType === 'closed_period')
    const isContinuationToNext = daysMap.get(nextDateKey)?.booking?.id === bookingId || (day.bookingType === 'closed_period' && daysMap.get(nextDateKey)?.bookingType === 'closed_period')

    const isStart = !isContinuationFromPrev
    const isEnd = !isContinuationToNext

    return cn(
      "absolute inset-x-0 h-10 flex items-center z-20 transition-all top-1/2 -translate-y-1/2 shadow-none",
      day.bookingType === 'closed_period'
        ? "bg-slate-100 text-slate-400 after:absolute after:inset-0 after:opacity-5 after:[background-image:linear-gradient(45deg,#000_25%,transparent_25%,transparent_50%,#000_50%,#000_75%,transparent_75%,transparent)] after:[background-size:4px_4px]"
        : "bg-indigo-600 text-white font-bold",
      isStart ? "rounded-l ml-1.5" : "-ml-px",
      isEnd ? "rounded-r mr-1.5" : "-mr-px"
    )
  }

  const monthName = month.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()

  return (
    <div className="w-full bg-white animate-in fade-in duration-300">
      <div className="py-4 px-1">
        <h3 className="text-[14px] font-black text-slate-900 tracking-tighter">
          {monthName}
        </h3>
      </div>

      <div className="grid grid-cols-7 border-t border-l border-slate-200">
        {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map((day) => (
          <div
            key={day}
            className="text-center text-[10px] font-black text-slate-400 py-3 border-r border-b border-slate-200 bg-white"
          >
            {day}
          </div>
        ))}

        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-[4/3] border-r border-b border-slate-200 bg-slate-50/10" />
        ))}

        {monthDays.map((date) => {
          const dateKey = format(date, 'yyyy-MM-dd')
          const day = daysMap.get(dateKey) || null
          const isReserved = day && !day.isAvailable
          const isWeekend = date.getDay() === 0 || date.getDay() === 6

          const prevDateKey = format(subDays(date, 1), 'yyyy-MM-dd')
          const isFirstDayOfSegment = isReserved && (
            !daysMap.get(prevDateKey)?.booking ||
            daysMap.get(prevDateKey)?.booking?.id !== day.booking?.id ||
            date.getDay() === 1
          )

          // Datos técnicos (Precios y Restricciones)
          const price = "145€"
          const minStay = "Min 3"
          const hasRestriction = true // Simulado

          return (
            <div
              key={dateKey}
              className={cn(
                "relative aspect-[4/3] transition-colors border-r border-b border-slate-200 cursor-pointer overflow-hidden",
                isWeekend ? "bg-slate-50/50" : "bg-white",
                "hover:bg-slate-50"
              )}
              onClick={() => day && onDayClick?.(day)}
            >
              {/* Hierarquía Triángulo: Día (Top-Left), Precio (Center), Mínimo (Bottom-Right) */}
              <div className="flex flex-col h-full p-2.5 justify-between relative z-10 w-full">
                <span className="text-[10px] font-bold text-slate-400 leading-none">
                  {format(date, "d")}
                </span>

                {!isReserved && (
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-sm font-black text-slate-900 leading-none tracking-tight">
                      {price}
                    </span>
                  </div>
                )}

                {!isReserved && hasRestriction && (
                  <div className="flex justify-end w-full">
                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-tighter">
                      {minStay}
                    </span>
                  </div>
                )}
              </div>

              {/* Cintas de Reserva Continuas (On top of grid) */}
              {isReserved && (
                <div className={getBookingStyles(day!, date)}>
                  {isFirstDayOfSegment && day.guestName && day.bookingType !== 'closed_period' && (
                    <span className="absolute left-3 w-max max-w-full text-[10px] font-black uppercase text-white tracking-widest px-1 truncate z-30">
                      {day.guestName}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
