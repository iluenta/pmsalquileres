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
          `/api/public/calendar/availability?propertyId=${propertyId}&startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
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
            const dateKey = date.toISOString().split('T')[0]
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
    const dateKey = checkDate.toISOString().split('T')[0]
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
      setSelectedRange({ ...selectedRange, end: clickedDate })
      onDateRangeSelect(selectedRange.start, clickedDate)
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
          <div className="w-4 h-4 bg-primary/20 rounded" />
          <span className="text-gray-700">Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary rounded" />
          <span className="text-gray-700">Entrada/Salida</span>
        </div>
      </div>

      {/* Calendario */}
      <div className="grid grid-cols-7 gap-2">
        {/* Encabezados de días */}
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => (
          <div key={idx} className="text-center font-semibold text-sm text-gray-600 py-2">
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
              className={`p-2 rounded-lg font-medium text-sm transition ${
                isBooked || isPast
                  ? 'bg-red-100 text-red-600 cursor-not-allowed border border-red-300'
                  : isDateStart(day) || isDateEnd(day)
                  ? 'bg-primary text-white'
                  : isDateInRange(day)
                  ? 'bg-primary/20 text-primary'
                  : 'hover:bg-neutral-100 text-foreground cursor-pointer'
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

