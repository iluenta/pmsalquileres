'use client'

import { useState, Suspense, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { PublicCheckoutForm } from '@/components/checkout/PublicCheckoutForm'
import { PublicOrderSummary } from '@/components/checkout/PublicOrderSummary'

function CheckoutContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const guests = searchParams.get('guests') || '2'

  const [propertyId, setPropertyId] = useState<string | null>(null)
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
      } catch (error) {
        console.error('Error loading property:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProperty()
  }, [slug])

  const checkIn = from ? new Date(from) : null
  const checkOut = to ? new Date(to) : null
  const nights = checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0
  const pricePerNight = property?.base_price_per_night || 89
  const totalPrice = nights * pricePerNight

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

  if (!property || !propertyId || !checkIn || !checkOut) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
        <LandingHeader slug={slug} />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="font-serif text-4xl font-bold mb-2">Error</h1>
            <p className="text-gray-600">No se pudieron cargar los datos de la reserva. Por favor, vuelve a seleccionar las fechas.</p>
          </div>
        </div>
        <LandingFooter propertyName={property?.name} />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <LandingHeader slug={slug} />
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold mb-2">Finalizar Reserva</h1>
            <p className="text-gray-600">Completa tus datos para confirmar tu estancia en {property.name}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Formulario */}
            <div className="lg:col-span-2">
              <Card className="p-8 border-2 border-neutral-200">
                <PublicCheckoutForm
                  propertyId={propertyId}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  guests={parseInt(guests)}
                  nights={nights}
                  pricePerNight={pricePerNight}
                  totalPrice={totalPrice}
                  slug={slug}
                />
              </Card>
            </div>

            {/* Resumen */}
            <div>
              <PublicOrderSummary
                checkIn={checkIn}
                checkOut={checkOut}
                guests={parseInt(guests)}
                nights={nights}
                pricePerNight={pricePerNight}
                totalPrice={totalPrice}
              />
            </div>
          </div>
        </div>
      </div>
      <LandingFooter propertyName={property.name} />
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Cargando...</div>
        </div>
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  )
}

