import { notFound } from 'next/navigation'
import { getPropertyBySlugPublic } from '@/lib/api/properties-public'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { LandingCTASection } from '@/components/landing/LandingCTASection'
import { Card } from '@/components/ui/card'
import { Wifi, Tv, Wind, Utensils, Coffee, Shield } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cache } from 'react'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Cachear la función para evitar llamadas duplicadas
const getCachedProperty = cache(async (slug: string) => {
  const normalizedSlug = slug.toLowerCase().trim()
  return await getPropertyBySlugPublic(normalizedSlug)
})

const highlights = [
  {
    icon: Wifi,
    title: "WiFi de Alta Velocidad",
    description: "Conexión rápida y estable para trabajar o disfrutar"
  },
  {
    icon: Tv,
    title: "Entretenimiento Completo",
    description: "TV, streaming services y sonido envolvente"
  },
  {
    icon: Wind,
    title: "Aire Acondicionado",
    description: "Climatización individual en todas las habitaciones"
  },
  {
    icon: Utensils,
    title: "Cocina Moderna",
    description: "Equipada con todos los electrodomésticos"
  },
  {
    icon: Coffee,
    title: "Zona de Relax",
    description: "Terraza con vistas y mobiliario premium"
  },
  {
    icon: Shield,
    title: "Seguridad 24/7",
    description: "Sistema de seguridad y cerraduras inteligentes"
  }
]

export default async function LandingPage({ params }: PageProps) {
  const { slug } = await params

  const property = await getCachedProperty(slug)

  if (!property) {
    notFound()
  }

  const address = [property.street, property.city, property.province, property.country]
    .filter(Boolean)
    .join(', ')

  return (
    <>
      <LandingHeader slug={slug} />
      <LandingHero property={property} slug={slug} />
      
      {/* Property Highlights */}
      <section id="características" className="w-full py-16 md:py-24 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Lo Mejor de {property.name}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Lujo, comodidad y atención al detalle en cada rincón del apartamento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((highlight, idx) => {
              const Icon = highlight.icon
              return (
                <Card key={idx} className="p-6 border border-neutral-200 hover:shadow-lg transition">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{highlight.title}</h3>
                  <p className="text-gray-600 text-sm">{highlight.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Rooms and Amenities */}
      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Espacios Pensados para Ti</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Cada rincón diseñado con atención y confort
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {property.bedrooms && property.bedrooms > 0 && (
              <Card className="p-8 border-2 border-neutral-200 hover:border-primary transition">
                <h3 className="font-serif text-2xl font-bold mb-2">
                  {property.bedrooms} {property.bedrooms === 1 ? 'Habitación' : 'Habitaciones'}
                </h3>
                <p className="text-gray-600 mb-6">
                  Espacios amplios y confortables para tu descanso
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-sm">Camas premium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-sm">Armarios espaciosos</span>
                  </div>
                </div>
              </Card>
            )}
            {property.bathrooms && property.bathrooms > 0 && (
              <Card className="p-8 border-2 border-neutral-200 hover:border-primary transition">
                <h3 className="font-serif text-2xl font-bold mb-2">
                  {property.bathrooms} {property.bathrooms === 1 ? 'Baño' : 'Baños'}
                </h3>
                <p className="text-gray-600 mb-6">
                  Baños modernos y completamente equipados
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-sm">Artículos de aseo incluidos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-sm">Toallas premium</span>
                  </div>
                </div>
              </Card>
            )}
            <Card className="p-8 border-2 border-neutral-200 hover:border-primary transition">
              <h3 className="font-serif text-2xl font-bold mb-2">Cocina Completa</h3>
              <p className="text-gray-600 mb-6">
                Cocina totalmente equipada para preparar tus comidas
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-sm">Electrodomésticos modernos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-sm">Utensilios de cocina</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {property.base_price_per_night && (
        <section id="precios" className="w-full py-16 md:py-24 bg-neutral-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Precios Transparentes</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Sin sorpresas, sin cargos ocultos. Elige el plan que mejor se adapte a tu estancia
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="p-8 border border-neutral-200">
                <h3 className="font-serif text-2xl font-bold mb-2">Noche Sencilla</h3>
                <p className="text-gray-600 text-sm mb-4">Perfecto para escapadas cortas</p>
                <div className="mb-6">
                  <span className="font-serif text-4xl font-bold text-primary">${property.base_price_per_night}</span>
                  <span className="text-gray-600"> / noche</span>
                </div>
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/landing/${slug}/reservas`}>Reservar Ahora</Link>
                </Button>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Location Section */}
      {address && (
        <section id="ubicacion" className="w-full py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Ubicación</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {address}
              </p>
            </div>
          </div>
        </section>
      )}

      <LandingCTASection slug={slug} />
      <LandingFooter propertyName={property.name} address={address} />
    </>
  )
}

