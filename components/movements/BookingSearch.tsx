"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, X, Home, Calendar, User } from "lucide-react"
import type { BookingWithDetails } from "@/types/bookings"

interface BookingSearchProps {
  bookings: BookingWithDetails[]
  selectedBookingId: string
  onSelect: (bookingId: string) => void
  placeholder?: string
  filterCommercialOnly?: boolean
}

export function BookingSearch({
  bookings,
  selectedBookingId,
  onSelect,
  placeholder = "Busca por ID, huésped, propiedad o fechas...",
  filterCommercialOnly = false,
}: BookingSearchProps) {
  const [searchInput, setSearchInput] = useState("")
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filtrar reservas comerciales si es necesario
  const availableBookings = filterCommercialOnly
    ? bookings.filter((b) => {
        if (!b.booking_type) return true
        return b.booking_type.value !== 'closed_period'
      })
    : bookings

  // Filtrar reservas según búsqueda
  const filteredBookings = availableBookings.filter((booking) => {
    if (!searchInput.trim()) return false

    const searchLower = searchInput.toLowerCase().trim()
    const searchInCode = booking.booking_code?.toLowerCase().includes(searchLower) || false
    const searchInProperty = booking.property?.name?.toLowerCase().includes(searchLower) || false
    const searchInGuest = booking.person
      ? `${booking.person.first_name || ''} ${booking.person.last_name || ''}`.toLowerCase().includes(searchLower)
      : false

    // Búsqueda en fechas
    let searchInDates = false
    if (booking.check_in_date || booking.check_out_date) {
      const formatDateForSearch = (dateString: string) => {
        try {
          const date = new Date(dateString)
          const isoDate = dateString.toLowerCase()
          const readableDate = date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).toLowerCase()
          return `${isoDate} ${readableDate}`
        } catch {
          return dateString.toLowerCase()
        }
      }

      const checkInSearch = booking.check_in_date ? formatDateForSearch(booking.check_in_date) : ''
      const checkOutSearch = booking.check_out_date ? formatDateForSearch(booking.check_out_date) : ''
      searchInDates = checkInSearch.includes(searchLower) || checkOutSearch.includes(searchLower)
    }

    return searchInCode || searchInProperty || searchInGuest || searchInDates
  })

  const selectedBooking = availableBookings.find((b) => b.id === selectedBookingId)

  // Manejar clicks fuera del contenedor
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
    setOpen(true)
  }

  const handleSelectBooking = (booking: BookingWithDetails) => {
    onSelect(booking.id)
    setOpen(false)
    setSearchInput("")
  }

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect("")
    setSearchInput("")
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="w-full space-y-3" ref={containerRef}>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchInput}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          className="w-full pl-10 pr-4 py-2 bg-background border-border"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>

      {/* Dropdown de resultados */}
      {open && searchInput.trim() && (
        <div className="absolute w-full bg-popover border border-border rounded-md shadow-lg z-50 mt-1 max-h-80 overflow-y-auto">
          {filteredBookings.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredBookings.map((booking) => {
                const checkIn = booking.check_in_date ? formatDate(booking.check_in_date) : 'N/A'
                const checkOut = booking.check_out_date ? formatDate(booking.check_out_date) : 'N/A'
                const guestName = booking.person
                  ? `${booking.person.first_name || ''} ${booking.person.last_name || ''}`.trim()
                  : null

                return (
                  <div
                    key={booking.id}
                    onClick={() => handleSelectBooking(booking)}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {booking.booking_code}
                        </span>
                      </div>
                      {guestName && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>{guestName}</span>
                        </div>
                      )}
                      <div className="flex flex-col md:flex-row md:items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Home className="w-3 h-3" />
                          <span>{booking.property?.name || 'N/A'}</span>
                        </div>
                        <span className="hidden md:inline">•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {checkIn} → {checkOut}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No se encontraron reservas con &quot;{searchInput}&quot;
            </div>
          )}
        </div>
      )}

      {open && !searchInput.trim() && (
        <div className="p-8 text-center text-sm text-muted-foreground bg-popover border border-border rounded-md">
          <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p>Comienza a escribir para buscar reservas</p>
        </div>
      )}

      {/* Card con reserva seleccionada */}
      {selectedBooking && (
        <Card className="p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">
                  {selectedBooking.booking_code}
                </span>
                {selectedBooking.person && (
                  <>
                    <span className="text-xs text-muted-foreground">-</span>
                    <span className="text-sm text-foreground">
                      {selectedBooking.person.first_name} {selectedBooking.person.last_name}
                    </span>
                  </>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  <span>{selectedBooking.property?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {selectedBooking.check_in_date
                      ? formatDate(selectedBooking.check_in_date)
                      : 'N/A'}{' '}
                    →{' '}
                    {selectedBooking.check_out_date
                      ? formatDate(selectedBooking.check_out_date)
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearSelection}
              className="p-1 hover:bg-primary/20 rounded-md transition text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </Card>
      )}
    </div>
  )
}

