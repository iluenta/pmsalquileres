"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2, MousePointer2 } from "lucide-react"
import { MonthCalendar } from "./MonthCalendar"
import type { CalendarDay } from "@/lib/api/calendar"
import { addMonths, startOfMonth } from "date-fns"

interface CalendarViewProps {
  propertyId: string
  currentMonth: Date
  onMonthChange: (date: Date) => void
  days?: CalendarDay[]
  onDayClick?: (day: CalendarDay) => void
  loading?: boolean
}

export function CalendarView({ propertyId, currentMonth, onMonthChange, days = [], onDayClick, loading }: CalendarViewProps) {
  const safeCurrentMonth = currentMonth || new Date()
  const monthDate = safeCurrentMonth instanceof Date ? safeCurrentMonth : new Date(safeCurrentMonth)
  const safeDays = Array.isArray(days) ? days : []

  const handlePrevMonth = () => {
    onMonthChange(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    onMonthChange(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1))
  }

  const handleToday = () => {
    onMonthChange(startOfMonth(new Date()))
  }

  const getVisibleMonths = () => {
    return [
      monthDate,
      addMonths(monthDate, 1),
      addMonths(monthDate, 2),
    ]
  }

  const filterDaysForMonth = (month: Date) => {
    if (!safeDays) return []
    return safeDays.filter(day => {
      if (!day || !day.date) return false
      const dayDate = day.date instanceof Date ? day.date : new Date(day.date)
      return dayDate.getMonth() === month.getMonth() && dayDate.getFullYear() === month.getFullYear()
    })
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full px-2">
      {/* Pristine Navigation Controls */}
      <div className="flex items-center justify-between w-full bg-white border border-slate-200 p-2 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-slate-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              className="h-9 w-9 border-r border-slate-200 rounded-none hover:bg-white transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-6 text-[11px] font-black uppercase tracking-widest text-slate-700 min-w-[240px] text-center bg-white h-9 flex items-center justify-center">
              {monthDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })} — {addMonths(monthDate, 2).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="h-9 w-9 border-l border-slate-200 rounded-none hover:bg-white transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="rounded-md font-bold text-[10px] uppercase tracking-wider border-slate-200 text-slate-600 hover:bg-slate-50 transition-all h-9 px-6 bg-white"
          >
            HOY
          </Button>
        </div>

        <div className="hidden xl:flex items-center gap-8 px-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-4 bg-indigo-600 rounded-sm" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Reservado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-4 bg-slate-100 border border-slate-200 relative overflow-hidden rounded-sm">
              <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(45deg, #cbd5e1 25%, transparent 25%, transparent 50%, #cbd5e1 50%, #cbd5e1 75%, transparent 75%, transparent)', backgroundSize: '3px 3px', opacity: 0.2 }} />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Bloqueado</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider">Min 3</span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Restricción de Estancia</span>
          </div>
        </div>
      </div>

      {/* Tighter Full-Width Grid */}
      {loading ? (
        <div className="min-h-[500px] flex flex-col items-center justify-center gap-4 bg-white border border-slate-200 rounded-xl w-full">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Procesando Tarifas y Rendimiento...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 w-full">
          {getVisibleMonths().map((month, index) => (
            <div key={index} className="w-full">
              <MonthCalendar
                month={month}
                days={filterDaysForMonth(month)}
                onDayClick={onDayClick}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pristine Hint */}
      <div className="flex justify-end pr-2 pt-2">
        <div className="flex items-center gap-2 text-slate-400/60">
          <MousePointer2 className="w-3.5 h-3.5" />
          <span className="text-[9px] font-black uppercase tracking-widest">Pricing Strategy Dashboard</span>
        </div>
      </div>
    </div>
  )
}
