'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PublicReservationCalendarProps {
  propertyId: string
  onDateRangeSelect: (checkIn: Date, checkOut: Date) => void
}

export function PublicReservationCalendar({ propertyId, onDateRangeSelect }: PublicReservationCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  })
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        setLoading(true)
        const startDate = new Date()
        startDate.setDate(1)
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 12) // Cargar 12 meses por seguridad

        const response = await fetch(
          `/api/public/calendar/availability?propertyId=${propertyId}&startDate=${formatDateForAPI(startDate)}&endDate=${formatDateForAPI(endDate)}`,
          { cache: 'no-store' }
        )

        if (!response.ok) {
          throw new Error('Error al cargar disponibilidad')
        }

        const daysData = await response.json()
        const booked = new Set<string>()

        daysData.forEach((day: any) => {
          if (!day.isAvailable) {
            const date = day.date instanceof Date ? day.date : new Date(day.date)
            // Normalizar a medianoche para evitar problemas de zona horaria
            date.setHours(0, 0, 0, 0)
            const dateKey = formatDateForAPI(date)
            booked.add(dateKey)
          }
        })

        setBookedDates(booked)
      } catch (error) {
        console.error('Error loading availability:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAvailability()
  }, [propertyId])

  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()

    // Primer día del mes actual
    const firstDayOfMonth = new Date(year, month, 1)

    // Obtener el día de la semana (0=Dom, 1=Lun, ..., 6=Sáb)
    // Convertir a 0=Lun, ..., 6=Dom
    const dayOfWeek = (firstDayOfMonth.getDay() + 6) % 7

    // Retroceder hasta el lunes de esa semana
    const startDate = new Date(firstDayOfMonth)
    startDate.setDate(startDate.getDate() - dayOfWeek)

    const days: Date[] = []
    const tempDate = new Date(startDate)

    // Generar siempre 42 días (6 semanas) para mantener altura constante
    for (let i = 0; i < 42; i++) {
      days.push(new Date(tempDate))
      tempDate.setDate(tempDate.getDate() + 1)
    }

    return days
  }

  const isBooked = (date: Date) => {
    return bookedDates.has(formatDateForAPI(date))
  }

  const handleDateClick = (clickedDate: Date) => {
    clickedDate.setHours(0, 0, 0, 0)

    if (isBooked(clickedDate)) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (clickedDate < today) return

    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      setSelectedRange({ start: clickedDate, end: null })
    } else if (clickedDate > selectedRange.start) {
      // Verificar conflictos
      let hasConflict = false
      const tempDate = new Date(selectedRange.start)
      tempDate.setDate(tempDate.getDate() + 1)

      while (tempDate < clickedDate) {
        if (bookedDates.has(formatDateForAPI(tempDate))) {
          hasConflict = true
          break
        }
        tempDate.setDate(tempDate.getDate() + 1)
      }

      if (hasConflict) {
        setSelectedRange({ start: clickedDate, end: null })
      } else {
        setSelectedRange({ ...selectedRange, end: clickedDate })
        onDateRangeSelect(selectedRange.start, clickedDate)
      }
    } else {
      setSelectedRange({ start: clickedDate, end: null })
    }
  }

  const isInRange = (date: Date) => {
    if (selectedRange.start && selectedRange.end) {
      return date >= selectedRange.start && date <= selectedRange.end
    }
    // Previsualización durante el hover si ya hay fecha de inicio
    if (selectedRange.start && !selectedRange.end && hoveredDate && hoveredDate > selectedRange.start) {
      return date >= selectedRange.start && date <= hoveredDate
    }
    return false
  }

  const isStart = (date: Date) => {
    if (!selectedRange.start) return false
    return date.toDateString() === selectedRange.start.toDateString()
  }

  const isEnd = (date: Date) => {
    if (!selectedRange.end) return false
    return date.toDateString() === selectedRange.end.toDateString()
  }

  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  const calendarDays = generateCalendarDays(currentDate)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Cargando disponibilidad...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selector de mes */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          className="p-2 hover:bg-neutral-100 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h3 className="font-semibold text-lg capitalize">{monthName}</h3>
          {selectedRange.start && !selectedRange.end && (
            <p className="text-xs text-teal-600 font-medium animate-pulse">Seleccione fecha de salida</p>
          )}
        </div>
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          className="p-2 hover:bg-neutral-100 rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Leyenda de colores */}
      <div className="flex flex-wrap gap-4 p-4 bg-neutral-50 rounded-lg text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded" />
          <span className="text-gray-700">Reservado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-teal-50 border border-teal-200 rounded" />
          <span className="text-slate-600">Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-teal-700 rounded" />
          <span className="text-slate-600">Entrada/Salida</span>
        </div>
      </div>

      {/* Calendario */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {/* Encabezados de días */}
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => (
          <div key={idx} className="text-center font-bold text-xs text-slate-400 py-2 uppercase tracking-tighter">
            {day}
          </div>
        ))}

        {/* Días del calendario */}
        {calendarDays.map((date, idx) => {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const isPast = date < today
          const booked = isBooked(date)
          const isCurrentMonth = date.getMonth() === currentDate.getMonth()
          const start = isStart(date)
          const end = isEnd(date)
          const range = isInRange(date)

          return (
            <button
              key={idx}
              onClick={() => handleDateClick(date)}
              onMouseEnter={() => setHoveredDate(date)}
              onMouseLeave={() => setHoveredDate(null)}
              disabled={booked || isPast}
              className={`aspect-square sm:p-2 rounded-lg font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-600/20 ${booked || isPast
                ? 'bg-rose-50 text-rose-300 cursor-not-allowed border border-rose-100'
                : start || end
                  ? 'bg-teal-700 text-white shadow-lg shadow-teal-700/30 z-10'
                  : range
                    ? selectedRange.end ? 'bg-teal-50 text-teal-700 font-bold' : 'bg-teal-50/50 text-teal-600/70 border border-dashed border-teal-200'
                    : !isCurrentMonth
                      ? 'text-slate-300 hover:bg-slate-50 cursor-pointer border border-transparent'
                      : 'hover:bg-slate-50 text-slate-700 cursor-pointer border border-transparent hover:border-slate-100'
                }`}
              title={booked ? 'Esta fecha ya está reservada' : isPast ? 'Fecha pasada' : ''}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>

      {selectedRange.start && selectedRange.end && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            <strong>Fechas seleccionadas:</strong> {selectedRange.start.toLocaleDateString('es-ES')} - {selectedRange.end.toLocaleDateString('es-ES')}
          </p>
        </div>
      )}
    </div>
  )
}
