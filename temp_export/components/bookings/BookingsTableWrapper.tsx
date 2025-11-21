"use client"

import { useEffect, useState, useCallback } from "react"
import { useSeason } from "@/lib/contexts/season-context"
import { BookingsTable } from "./BookingsTable"
import type { BookingWithDetails } from "@/types/bookings"
import { Property } from "@/lib/api/properties"

interface BookingsTableWrapperProps {
  initialBookings: BookingWithDetails[]
  properties: Property[]
  bookingStatuses: any[]
  bookingTypes: any[]
}

export function BookingsTableWrapper({
  initialBookings,
  properties,
  bookingStatuses,
  bookingTypes,
}: BookingsTableWrapperProps) {
  const { selectedYear } = useSeason()
  const [bookings, setBookings] = useState(initialBookings)
  const [loading, setLoading] = useState(false)

  const loadBookings = useCallback(async () => {
    setLoading(true)
    try {
      const yearParam = selectedYear ? `year=${selectedYear}` : "year=all"
      const response = await fetch(`/api/bookings?${yearParam}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      } else {
        console.error("Error response:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error loading bookings:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedYear])

  useEffect(() => {
    // Solo cargar si hay un año seleccionado o si es null (todos)
    loadBookings()
  }, [loadBookings])

  const handleBookingDeleted = useCallback(() => {
    // Recargar las reservas después de eliminar
    loadBookings()
  }, [loadBookings])

  return (
    <BookingsTable
      bookings={bookings}
      properties={properties}
      bookingStatuses={bookingStatuses}
      bookingTypes={bookingTypes}
      onBookingDeleted={handleBookingDeleted}
    />
  )
}

