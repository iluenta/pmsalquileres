'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Loader2, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  comments: string
  agreeTerms: boolean
}

interface PublicCheckoutFormProps {
  propertyId: string
  checkIn: Date
  checkOut: Date
  guests: number
  nights: number
  pricePerNight: number
  totalPrice: number
  slug: string
}

export function PublicCheckoutForm({
  propertyId,
  checkIn,
  checkOut,
  guests,
  nights,
  pricePerNight,
  totalPrice,
  slug,
}: PublicCheckoutFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'España',
    comments: '',
    agreeTerms: false
  })

  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, boolean>>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [bookingCode, setBookingCode] = useState<string | null>(null)

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, boolean>> = {}

    if (!formData.firstName.trim()) newErrors.firstName = true
    if (!formData.lastName.trim()) newErrors.lastName = true
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = true
    if (!formData.phone.trim()) newErrors.phone = true
    if (!formData.agreeTerms) newErrors.agreeTerms = true

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!validateForm()) {
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property_id: propertyId,
          check_in_date: formatDateForAPI(checkIn),
          check_out_date: formatDateForAPI(checkOut),
          number_of_guests: guests,
          total_amount: totalPrice,
          guest: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email || null,
            phone: formData.phone,
            notes: formData.comments || null,
          },
          notes: formData.comments || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear la reserva')
      }

      const booking = await response.json()
      setBookingCode(booking.booking_code)
      setSubmitted(true)
    } catch (error: any) {
      const msg = error.message || ''
      if (!msg.includes('solapan') && !msg.includes('disponibilidad') && !msg.includes('posterior')) {
        console.error('Error creating booking:', error)
      }
      setErrorMessage(msg || 'Error al crear la reserva. Por favor, intenta de nuevo.')
      setIsProcessing(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center space-y-4 py-12">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-teal-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">¡Reserva Confirmada!</h2>
        {bookingCode && (
          <p className="text-lg font-semibold text-teal-700">
            Código de reserva: <span className="font-mono">{bookingCode}</span>
          </p>
        )}
        <p className="text-slate-600">
          Te hemos enviado un email de confirmación a <strong>{formData.email}</strong>
        </p>
        <p className="text-slate-600">
          Nos pondremos en contacto contigo pronto para confirmar los detalles finales.
        </p>
        <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-teal-600 hover:bg-teal-700">
            <a href={`/guides/${slug}`}>Ver Guía del Huésped</a>
          </Button>
          <Button variant="outline" asChild className="border-slate-200 text-slate-600 hover:bg-slate-50">
            <a href={`/landing/${slug}`}>Volver a Inicio</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-6">Datos Personales</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Nombre *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all ${errors.firstName ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 focus:bg-white'
                }`}
              placeholder="Tu nombre"
              disabled={isProcessing}
            />
            {errors.firstName && <p className="text-rose-500 text-xs mt-1">Este campo es requerido</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Apellido *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all ${errors.lastName ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 focus:bg-white'
                }`}
              placeholder="Tu apellido"
              disabled={isProcessing}
            />
            {errors.lastName && <p className="text-rose-500 text-xs mt-1">Este campo es requerido</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all ${errors.email ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 focus:bg-white'
                }`}
              placeholder="tu@email.com"
              disabled={isProcessing}
            />
            {errors.email && <p className="text-rose-500 text-xs mt-1">Email inválido</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all ${errors.phone ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 focus:bg-white'
                }`}
              placeholder="+34 123 456 789"
              disabled={isProcessing}
            />
            {errors.phone && <p className="text-rose-500 text-xs mt-1">Este campo es requerido</p>}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">País</label>
        <input
          type="text"
          value={formData.country}
          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
          disabled={isProcessing}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Comentarios especiales</label>
        <textarea
          value={formData.comments}
          onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all resize-none h-24"
          placeholder="Ej: Preferencias de horarios, requerimientos especiales..."
          disabled={isProcessing}
        />
      </div>

      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          El pago se procesará de forma segura. Recibirás un email de confirmación con los detalles de tu reserva.
        </p>
      </div>

      <div className="flex items-start gap-4">
        <div className="flex items-center h-6">
          <input
            type="checkbox"
            id="agreeTerms"
            checked={formData.agreeTerms}
            onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
            className="w-5 h-5 text-teal-600 border-slate-300 rounded focus:ring-teal-600 transition-all cursor-pointer"
            disabled={isProcessing}
          />
        </div>
        <label htmlFor="agreeTerms" className="text-sm text-slate-600 cursor-pointer">
          Acepto los <a href="#" className="text-teal-600 hover:underline">términos y condiciones</a> y la <a href="#" className="text-teal-600 hover:underline">política de privacidad</a> *
        </label>
      </div>
      {errors.agreeTerms && <p className="text-rose-500 text-xs mt-1">Debes aceptar los términos para continuar</p>}

      <Button
        type="submit"
        disabled={isProcessing}
        className="w-full h-14 text-base font-bold bg-teal-600 hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 active:scale-[0.98]"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Procesando reserva...
          </>
        ) : (
          'Confirmar Reserva'
        )}
      </Button>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300 mt-4">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700 font-medium">{errorMessage}</p>
        </div>
      )}
    </form>
  )
}

