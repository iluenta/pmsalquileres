'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, Clock, Info, Minus, Plus, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PublicReservationCalendar } from '@/components/reservations/PublicReservationCalendar'
import { PublicCheckoutForm } from '@/components/checkout/PublicCheckoutForm'
import { PublicOrderSummary } from '@/components/checkout/PublicOrderSummary'

interface LandingBookingSectionProps {
    property: any
    slug: string
}

export function LandingBookingSection({ property, slug }: LandingBookingSectionProps) {
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
        pricePerNight: property.base_price_per_night || 89,
        totalPrice: 0
    })

    const [showCheckout, setShowCheckout] = useState(false)

    // Scroll to checkout when visible
    useEffect(() => {
        if (showCheckout) {
            const element = document.getElementById('pago')
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
            }
        }
    }, [showCheckout])

    const handleDateRangeSelect = (checkIn: Date, checkOut: Date) => {
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        const pricePerNight = property.base_price_per_night || 89
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

    const handleGuestChange = (delta: number) => {
        const maxGuests = property.max_guests || 4
        const newCount = Math.max(1, Math.min(maxGuests, reservation.guests + delta))
        setReservation({ ...reservation, guests: newCount })
    }

    const isValid = reservation.checkIn && reservation.checkOut && reservation.totalNights > 0

    const formatDate = (date: Date | null) => {
        if (!date) return 'Selecciona fecha'
        return date.toLocaleDateString('es-ES', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <div className="space-y-20 lg:space-y-28">
            {/* Phase 1: Calendar */}
            <section id="precios" className="w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Sistema de Reservas</h2>
                        <p className="text-slate-600 text-lg max-w-xl mx-auto">
                            Selecciona tus fechas y completa tu reserva en {property.name}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Calendar Container */}
                        <div className="lg:col-span-2 bg-white rounded-2xl p-6 lg:p-8 border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-900 mb-6">Selecciona tus Fechas</h3>
                            <PublicReservationCalendar
                                propertyId={property.id}
                                onDateRangeSelect={handleDateRangeSelect}
                            />
                        </div>

                        {/* Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl p-6 border-2 border-slate-900 sticky top-24">
                                <h3 className="text-xl font-bold text-slate-900 mb-6">Tu Reserva</h3>

                                <div className="space-y-6">
                                    {/* Check-in */}
                                    <div>
                                        <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>Check-in</span>
                                        </div>
                                        <p className="text-teal-700 font-semibold">{formatDate(reservation.checkIn)}</p>
                                    </div>

                                    {/* Check-out */}
                                    <div>
                                        <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                                            <Clock className="w-4 h-4" />
                                            <span>Check-out</span>
                                        </div>
                                        <p className="text-slate-900 font-semibold">{formatDate(reservation.checkOut)}</p>
                                    </div>

                                    {/* Nights */}
                                    <div className="pb-6 border-b border-slate-200">
                                        <p className="text-slate-600 text-sm mb-1">Noches</p>
                                        <p className="text-slate-900 font-bold text-lg">
                                            {reservation.totalNights} {reservation.totalNights === 1 ? 'noche' : 'noches'}
                                        </p>
                                    </div>

                                    {/* Guests */}
                                    <div>
                                        <div className="flex items-center gap-2 text-slate-600 text-sm mb-3">
                                            <Users className="w-4 h-4" />
                                            <span>Huéspedes</span>
                                        </div>
                                        <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                                            <button
                                                onClick={() => handleGuestChange(-1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-colors"
                                                disabled={reservation.guests <= 1}
                                            >
                                                <Minus className="w-4 h-4 text-slate-700" />
                                            </button>
                                            <span className="font-semibold text-slate-900">{reservation.guests}</span>
                                            <button
                                                onClick={() => handleGuestChange(1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-colors"
                                                disabled={reservation.guests >= (property.max_guests || 4)}
                                            >
                                                <Plus className="w-4 h-4 text-slate-700" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-600">
                                                €{reservation.pricePerNight} × {reservation.totalNights} noches
                                            </span>
                                            <span className="font-semibold text-slate-900">
                                                €{reservation.totalPrice}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-lg font-bold text-slate-900">Total</span>
                                        <span className="text-2xl font-bold text-teal-700">€{reservation.totalPrice}</span>
                                    </div>

                                    <Button
                                        className="w-full h-12 text-base bg-teal-700 hover:bg-teal-800"
                                        disabled={!isValid}
                                        onClick={() => setShowCheckout(true)}
                                    >
                                        Continuar a Pago
                                    </Button>

                                    {!isValid && (
                                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
                                            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-yellow-700">Selecciona fecha de entrada y salida para continuar</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Phase 2: Checkout Form (Only if enabled and visible) */}
            {showCheckout && (
                <section id="pago" className="w-full pt-10 scroll-mt-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Finalizar Reserva</h2>
                            <p className="text-slate-600 text-lg">
                                Completa tus datos para confirmar tu estancia en {property.name}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {/* Form Container */}
                            <div className="lg:col-span-2 bg-white rounded-2xl p-6 lg:p-8 border border-slate-200">
                                <PublicCheckoutForm
                                    propertyId={property.id}
                                    checkIn={reservation.checkIn!}
                                    checkOut={reservation.checkOut!}
                                    guests={reservation.guests}
                                    nights={reservation.totalNights}
                                    pricePerNight={reservation.pricePerNight}
                                    totalPrice={reservation.totalPrice}
                                    slug={slug}
                                />
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <PublicOrderSummary
                                    checkIn={reservation.checkIn!}
                                    checkOut={reservation.checkOut!}
                                    guests={reservation.guests}
                                    nights={reservation.totalNights}
                                    pricePerNight={reservation.pricePerNight}
                                    totalPrice={reservation.totalPrice}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}
