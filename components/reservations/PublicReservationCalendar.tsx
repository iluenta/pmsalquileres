'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CalendarDay } from '@/lib/api/calendar'

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
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  useEffect(() => {
    // Cargar disponibilidad para los próximos 6 meses
    const loadAvailability = async () => {
      try {
        setLoading(true)
        const startDate = new Date()
        startDate.setDate(1) // Primer día del mes actual
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 6) // 6 meses adelante

        const response = await fetch(
          `/api/public/calendar/availability?propertyId=${propertyId}&startDate=${formatDateForAPI(startDate)}&endDate=${formatDateForAPI(endDate)}`,
          { cache: 'no-store' }
        )

        if (!response.ok) {
          throw new Error('Error al cargar disponibilidad')
        }

        const daysData = await response.json()
        const booked = new Set<string>()

        // Convertir las fechas de cadena a objetos Date (JSON serializa Date como string)
        daysData.forEach((day: any) => {
          if (!day.isAvailable) {
            // day.date puede ser una cadena ISO o un objeto Date
            const date = day.date instanceof Date ? day.date : new Date(day.date)
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

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isDateBooked = (day: number) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateKey = formatDateForAPI(checkDate)
    return bookedDates.has(dateKey)
  }

  const handleDateClick = (day: number) => {
    if (isDateBooked(day)) return

    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // No permitir fechas pasadas
    if (clickedDate < today) return

    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      setSelectedRange({ start: clickedDate, end: null })
    } else if (clickedDate > selectedRange.start) {
      // Verificar si hay fechas reservadas entre el inicio y el fin seleccionado
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
        // Si hay conflicto, reiniciar la selección con la fecha clickeada
        setSelectedRange({ start: clickedDate, end: null })
      } else {
        setSelectedRange({ ...selectedRange, end: clickedDate })
        onDateRangeSelect(selectedRange.start, clickedDate)
      }
    } else {
      setSelectedRange({ start: clickedDate, end: null })
    }
  }

  const isDateInRange = (day: number) => {
    if (!selectedRange.start || !selectedRange.end) return false
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return date >= selectedRange.start && date <= selectedRange.end
  }

  const isDateStart = (day: number) => {
    if (!selectedRange.start) return false
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return date.toDateString() === selectedRange.start.toDateString()
  }

  const isDateEnd = (day: number) => {
    if (!selectedRange.end) return false
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return date.toDateString() === selectedRange.end.toDateString()
  }

  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

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
        <h3 className="font-semibold text-lg capitalize">{monthName}</h3>
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

        {/* Días vacíos al inicio */}
        {emptyDays.map((_, idx) => (
          <div key={`empty-${idx}`} />
        ))}

        {/* Días del mes */}
        {days.map((day) => {
          const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const isPast = checkDate < today
          const isBooked = isDateBooked(day)

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={isBooked || isPast}
              className={`aspect-square sm:p-2 rounded-lg font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-600/20 ${isBooked || isPast
                ? 'bg-rose-50 text-rose-300 cursor-not-allowed border border-rose-100'
                : isDateStart(day) || isDateEnd(day)
                  ? 'bg-teal-700 text-white shadow-lg shadow-teal-700/30'
                  : isDateInRange(day)
                    ? 'bg-teal-50 text-teal-700 font-bold'
                    : 'hover:bg-slate-50 text-slate-700 cursor-pointer border border-transparent hover:border-slate-100'
                }`}
              title={isBooked ? 'Esta fecha ya está reservada' : isPast ? 'Fecha pasada' : ''}
            >
              {day}
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

