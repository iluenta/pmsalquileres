'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, Clock, Info, Minus, Plus, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PublicReservationCalendar } from '@/components/reservations/PublicReservationCalendar'
import { PublicCheckoutForm } from '@/components/checkout/PublicCheckoutForm'
import { PublicOrderSummary } from '@/components/checkout/PublicOrderSummary'
import { calculateStayPrice, PricingPeriod } from '@/lib/utils/pricing-engine'

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
        errorMessage?: string
    }>({
        checkIn: null,
        checkOut: null,
        guests: 2,
        totalNights: 0,
        pricePerNight: property.base_price_per_night || 89,
        totalPrice: 0
    })

    const [pricingPeriods, setPricingPeriods] = useState<PricingPeriod[]>([])
    const [loadingPricing, setLoadingPricing] = useState(false)

    // Load pricing periods on mount
    useEffect(() => {
        const loadPricing = async () => {
            setLoadingPricing(true)
            try {
                const response = await fetch(`/api/properties/${property.id}/pricing`)
                if (response.ok) {
                    const data = await response.json()
                    setPricingPeriods(data)
                }
            } catch (error) {
                console.error("Error loading pricing periods:", error)
            } finally {
                setLoadingPricing(false)
            }
        }
        loadPricing()
    }, [property.id])

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
        const result = calculateStayPrice({
            checkIn,
            checkOut,
            numberOfGuests: reservation.guests,
            baseGuests: property.max_guests || 4, // or use a specific threshold if needed
            pricingPeriods
        })

        setReservation({
            ...reservation,
            checkIn,
            checkOut,
            totalNights: result.totalNights,
            pricePerNight: result.averagePricePerNight,
            totalPrice: result.totalPrice,
            errorMessage: result.isValid ? undefined : result.errorMessage
        })
    }

    const handleGuestChange = (delta: number) => {
        const maxGuests = property.max_guests || 4
        const newCount = Math.max(1, Math.min(maxGuests, reservation.guests + delta))

        // Recalculate price with new guest count if dates are selected
        if (reservation.checkIn && reservation.checkOut) {
            const result = calculateStayPrice({
                checkIn: reservation.checkIn,
                checkOut: reservation.checkOut,
                numberOfGuests: newCount,
                baseGuests: property.max_guests || 4,
                pricingPeriods
            })
            setReservation(prev => ({
                ...prev,
                guests: newCount,
                totalPrice: result.totalPrice,
                pricePerNight: result.averagePricePerNight,
                errorMessage: result.isValid ? undefined : result.errorMessage
            }))
        } else {
            setReservation(prev => ({ ...prev, guests: newCount }))
        }
    }

    const isValid = reservation.checkIn && reservation.checkOut && reservation.totalNights > 0 && !reservation.errorMessage

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
        <div className="space-y-20 lg:space-y-28 relative">
            {/* Phase 1: Calendar */}
            <section id="precios" className="w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Sistema de Reservas</h2>
                        <p className="text-slate-600 text-lg max-w-xl mx-auto leading-relaxed">
                            Selecciona tus fechas y completa tu reserva en {property.name}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
                        {/* Calendar Container */}
                        <div className="lg:col-span-2 bg-white rounded-3xl p-4 sm:p-8 border border-slate-200/60 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 px-2">Selecciona tus Fechas</h3>
                            <PublicReservationCalendar
                                propertyId={property.id}
                                onDateRangeSelect={handleDateRangeSelect}
                            />
                        </div>

                        {/* Summary Sidebar - Hidden/Different for mobile if desired, but here we keep it and add sticky */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm lg:sticky lg:top-24">
                                <h3 className="text-xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">Tu Reserva</h3>

                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
                                        {/* Check-in */}
                                        <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100/50">
                                            <div className="flex items-center gap-2 text-teal-700/70 text-xs font-semibold uppercase tracking-wider mb-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>Check-in</span>
                                            </div>
                                            <p className="text-teal-900 font-bold">{formatDate(reservation.checkIn)}</p>
                                        </div>

                                        {/* Check-out */}
                                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200/50">
                                            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>Check-out</span>
                                            </div>
                                            <p className="text-slate-900 font-bold">{formatDate(reservation.checkOut)}</p>
                                        </div>
                                    </div>

                                    {/* Guests */}
                                    <div>
                                        <div className="flex items-center justify-between gap-2 text-slate-600 text-sm font-medium mb-4 px-1">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                <span>Huéspedes</span>
                                            </div>
                                            <span className="text-xs text-slate-400">Máx. {property.max_guests || 4}</span>
                                        </div>
                                        <div className="flex items-center justify-between bg-slate-50/80 rounded-2xl p-4 border border-slate-200/50">
                                            <button
                                                onClick={() => handleGuestChange(-1)}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-30"
                                                disabled={reservation.guests <= 1}
                                            >
                                                <Minus className="w-5 h-5 text-slate-700" />
                                            </button>
                                            <span className="font-bold text-xl text-slate-900">{reservation.guests}</span>
                                            <button
                                                onClick={() => handleGuestChange(1)}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-30"
                                                disabled={reservation.guests >= (property.max_guests || 4)}
                                            >
                                                <Plus className="w-5 h-5 text-slate-700" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Total with Highlight */}
                                    <div className="pt-6 border-t border-slate-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-slate-600 font-medium">Subtotal ({reservation.totalNights} {reservation.totalNights === 1 ? 'noche' : 'noches'})</span>
                                            <span className="font-bold text-slate-900">€{reservation.totalPrice}</span>
                                        </div>
                                        <div className="flex items-center justify-between pt-4">
                                            <span className="text-xl font-bold text-slate-900">Total Estancia</span>
                                            <div className="text-right">
                                                <span className="block text-3xl font-extrabold text-teal-600">€{reservation.totalPrice}</span>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Impuestos incluidos</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full h-14 text-lg font-bold bg-teal-600 hover:bg-teal-700 rounded-2xl shadow-lg transition-transform active:scale-[0.98]"
                                        disabled={!isValid}
                                        onClick={() => setShowCheckout(true)}
                                    >
                                        Reservar Ahora
                                    </Button>

                                    {!isValid && (
                                        <div className="p-4 bg-amber-50 border border-amber-200/60 rounded-2xl flex gap-3 animate-pulse">
                                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-amber-800 leading-tight">
                                                {reservation.errorMessage || 'Selecciona tus fechas en el calendario para calcular el precio'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mobile Sticky Bar */}
            {isValid && !showCheckout && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-4 animate-in slide-in-from-bottom duration-500">
                    <div className="bg-white/90 backdrop-blur-xl border border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-3xl p-5 flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Total Estancia</span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-black text-slate-900">€{reservation.totalPrice}</span>
                                <span className="text-xs text-slate-500 font-medium">{reservation.totalNights} ns</span>
                            </div>
                        </div>
                        <Button
                            className="flex-[2] h-12 bg-teal-600 hover:bg-teal-700 font-bold rounded-2xl shadow-teal-200 shadow-xl"
                            onClick={() => setShowCheckout(true)}
                        >
                            Reservar Ahora
                        </Button>
                    </div>
                </div>
            )}

            {/* Phase 2: Checkout Form */}
            {showCheckout && (
                <section id="pago" className="w-full pt-20 scroll-mt-24 bg-white border-t border-slate-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16 px-4">
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Finalizar Reserva</h2>
                            <p className="text-slate-600 text-lg max-w-xl mx-auto leading-relaxed">
                                Completa tus datos personales para confirmar tu estancia en {property.name}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-6xl mx-auto pb-20">
                            {/* Form Container */}
                            <div className="lg:col-span-2 bg-slate-50/50 rounded-3xl p-6 sm:p-10 border border-slate-200/80">
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
