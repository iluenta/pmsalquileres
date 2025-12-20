'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
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
          check_in_date: checkIn.toISOString().split('T')[0],
          check_out_date: checkOut.toISOString().split('T')[0],
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
      console.error('Error creating booking:', error)
      setErrorMessage(error.message || 'Error al crear la reserva. Por favor, intenta de nuevo.')
      setIsProcessing(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center space-y-4 py-12">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h2 className="font-serif text-2xl font-bold">¡Reserva Confirmada!</h2>
        {bookingCode && (
          <p className="text-lg font-semibold text-primary">
            Código de reserva: <span className="font-mono">{bookingCode}</span>
          </p>
        )}
        <p className="text-gray-600">
          Te hemos enviado un email de confirmación a <strong>{formData.email}</strong>
        </p>
        <p className="text-gray-600">
          Nos pondremos en contacto contigo pronto para confirmar los detalles finales.
        </p>
        <div className="pt-4 flex gap-4 justify-center">
          <Button asChild>
            <a href={`/guides/${slug}`}>Ver Guía del Huésped</a>
          </Button>
          <Button variant="outline" asChild>
            <a href={`/landing/${slug}`}>Volver a la Propiedad</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <Card className="p-4 bg-red-50 border border-red-200">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        </Card>
      )}

      <div>
        <h3 className="font-semibold text-lg mb-4">Datos Personales</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.firstName ? 'border-red-500' : 'border-neutral-300'
                }`}
              placeholder="Tu nombre"
              disabled={isProcessing}
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">Requerido</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Apellido *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.lastName ? 'border-red-500' : 'border-neutral-300'
                }`}
              placeholder="Tu apellido"
              disabled={isProcessing}
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">Requerido</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.email ? 'border-red-500' : 'border-neutral-300'
                }`}
              placeholder="tu@email.com"
              disabled={isProcessing}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">Email inválido</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Teléfono *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.phone ? 'border-red-500' : 'border-neutral-300'
                }`}
              placeholder="+34 123 456 789"
              disabled={isProcessing}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">Requerido</p>}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">País</label>
        <input
          type="text"
          value={formData.country}
          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isProcessing}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Comentarios especiales</label>
        <textarea
          value={formData.comments}
          onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24"
          placeholder="Ej: Preferencias de horarios, requerimientos especiales..."
          disabled={isProcessing}
        />
      </div>

      <Card className="p-4 bg-blue-50 border border-blue-200">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            El pago se procesará de forma segura. Recibirás un email de confirmación con los detalles de tu reserva.
          </p>
        </div>
      </Card>

      <label className="flex items-center gap-3 p-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.agreeTerms}
          onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
          className="w-5 h-5 accent-primary"
          disabled={isProcessing}
        />
        <span className="text-sm">
          Acepto los términos y condiciones y la política de privacidad *
        </span>
      </label>
      {errors.agreeTerms && <p className="text-red-500 text-xs mt-1">Debes aceptar los términos</p>}

      <Button
        type="submit"
        disabled={isProcessing}
        className="w-full h-12 text-base"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Procesando...
          </>
        ) : (
          'Confirmar Reserva'
        )}
      </Button>
    </form>
  )
}

