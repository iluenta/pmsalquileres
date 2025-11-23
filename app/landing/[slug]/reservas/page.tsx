'use client'

import { useState, Suspense } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Users, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { PublicReservationCalendar } from '@/components/reservations/PublicReservationCalendar'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { useEffect } from 'react'

function ReservationsContent() {
  const params = useParams()
  const slug = params.slug as string
  const [propertyId, setPropertyId] = useState<string | null>(null)
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reservation, setReservation] = useState<{
    checkIn: Date | null
    checkOut: Date | null
    guests: number
    totalNights: number
    pricePerNight: number
    totalPrice: number
  }>({
    checkIn: null,
    checkOut: null,
    guests: 2,
    totalNights: 0,
    pricePerNight: 0,
    totalPrice: 0
  })

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const response = await fetch(`/api/public/properties/${slug}`)
        if (!response.ok) {
          throw new Error('Error al cargar la propiedad')
        }
        const data = await response.json()
        setProperty(data)
        setPropertyId(data.id)
        setReservation(prev => ({
          ...prev,
          pricePerNight: data.base_price_per_night || 89
        }))
      } catch (error) {
        console.error('Error loading property:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProperty()
  }, [slug])

  const handleDateRangeSelect = (checkIn: Date, checkOut: Date) => {
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const pricePerNight = property?.base_price_per_night || 89
    const total = nights * pricePerNight
    
    setReservation({
      ...reservation,
      checkIn,
      checkOut,
      totalNights: nights,
      pricePerNight,
      totalPrice: total
    })
  }

  const handleGuestChange = (newCount: number) => {
    const maxGuests = property?.max_guests || 4
    if (newCount >= 1 && newCount <= maxGuests) {
      setReservation({ ...reservation, guests: newCount })
    }
  }

  const isValid = reservation.checkIn && reservation.checkOut && reservation.totalNights > 0

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
        <LandingHeader slug={slug} />
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Cargando...</div>
        </div>
        <LandingFooter />
      </main>
    )
  }

  if (!property || !propertyId) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
        <LandingHeader slug={slug} />
        <div className="flex items-center justify-center py-12">
          <div className="text-red-600">Error al cargar la propiedad</div>
        </div>
        <LandingFooter />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <LandingHeader slug={slug} />
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Sistema de Reservas</h1>
              <p className="text-gray-600 text-lg">Selecciona tus fechas y completa tu reserva en {property.name}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Calendario */}
              <div className="lg:col-span-2">
                <Card className="p-6 md:p-8 border-2 border-neutral-200">
                  <h2 className="font-serif text-2xl font-bold mb-6">Selecciona tus Fechas</h2>
                  <PublicReservationCalendar 
                    propertyId={propertyId}
                    onDateRangeSelect={handleDateRangeSelect} 
                  />
                </Card>
              </div>

              {/* Panel de Resumen */}
              <div>
                <Card className="p-6 md:p-8 sticky top-4 border-2 border-primary bg-gradient-to-b from-white to-primary/5">
                  <h3 className="font-serif text-2xl font-bold mb-6">Tu Reserva</h3>

                  <div className="space-y-6">
                    {/* Check-in */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Check-in
                      </label>
                      <p className="text-lg font-semibold text-primary">
                        {reservation.checkIn 
                          ? reservation.checkIn.toLocaleDateString('es-ES', { 
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : 'No seleccionado'
                        }
                      </p>
                    </div>

                    {/* Check-out */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Check-out</label>
                      <p className="text-lg font-semibold text-primary">
                        {reservation.checkOut 
                          ? reservation.checkOut.toLocaleDateString('es-ES', { 
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : 'No seleccionado'
                        }
                      </p>
                    </div>

                    {/* Noches */}
                    {reservation.totalNights > 0 && (
                      <div className="space-y-2 pb-4 border-b border-neutral-200">
                        <label className="text-sm font-semibold text-gray-700">Noches</label>
                        <p className="text-lg font-bold">{reservation.totalNights} noche{reservation.totalNights > 1 ? 's' : ''}</p>
                      </div>
                    )}

                    {/* Huéspedes */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Huéspedes
                      </label>
                      <div className="flex items-center gap-3 bg-white border border-neutral-200 rounded-lg p-2">
                        <button
                          onClick={() => handleGuestChange(reservation.guests - 1)}
                          className="px-3 py-1 hover:bg-neutral-100 rounded font-semibold"
                          disabled={reservation.guests <= 1}
                        >
                          −
                        </button>
                        <span className="flex-1 text-center font-semibold">{reservation.guests}</span>
                        <button
                          onClick={() => handleGuestChange(reservation.guests + 1)}
                          className="px-3 py-1 hover:bg-neutral-100 rounded font-semibold"
                          disabled={reservation.guests >= (property.max_guests || 4)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Precio */}
                    {reservation.totalNights > 0 && (
                      <div className="space-y-2 p-4 bg-primary/10 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">${reservation.pricePerNight} x {reservation.totalNights} noches</span>
                          <span className="font-semibold">${reservation.totalNights * reservation.pricePerNight}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-primary/20 text-lg">
                          <span className="font-bold">Total</span>
                          <span className="font-serif text-2xl font-bold text-primary">${reservation.totalPrice}</span>
                        </div>
                      </div>
                    )}

                    {/* Botón de Reserva */}
                    <Button 
                      asChild
                      disabled={!isValid}
                      className="w-full h-12 text-base"
                      variant={isValid ? "default" : "outline"}
                    >
                      <Link 
                        href={isValid 
                          ? `/landing/${slug}/checkout?from=${reservation.checkIn?.toISOString() || ''}&to=${reservation.checkOut?.toISOString() || ''}&guests=${reservation.guests}` 
                          : '#'}
                      >
                        Continuar a Pago
                      </Link>
                    </Button>

                    {!isValid && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-700">Selecciona fecha de entrada y salida</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LandingFooter propertyName={property.name} />
    </main>
  )
}

export default function ReservationsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Cargando...</div>
        </div>
      </main>
    }>
      <ReservationsContent />
    </Suspense>
  )
}

