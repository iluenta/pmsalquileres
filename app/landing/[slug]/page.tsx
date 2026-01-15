import { notFound } from 'next/navigation'
import { getPropertyBySlugPublic } from '@/lib/api/properties-public'
import { getPropertyTenantId } from '@/lib/api/properties-public'
import { getCoverImage, getPropertyImagesPublic } from '@/lib/api/property-images'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { LandingCTASection } from '@/components/landing/LandingCTASection'
import { LandingGallerySection } from '@/components/landing/LandingGallerySection'
import { LandingBookingSection } from '@/components/landing/LandingBookingSection'
import { Card } from '@/components/ui/card'
import { Wifi, Tv, Wind, Utensils, Coffee, Shield, Info, BedDouble, Bath, ChefHat, ShieldCheck, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cache } from 'react'

export const dynamic = 'force-dynamic'

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

// Map string icon names to Lucide components
const iconMap: Record<string, any> = {
  Wifi, Tv, Wind, Utensils, Coffee, Shield, Info, ShieldCheck, MapPin
}

const defaultHighlights = [
  { icon: "Wifi", title: "WiFi de Alta Velocidad", description: "Conexión rápida y estable para trabajar o disfrutar" },
  { icon: "Tv", title: "Entretenimiento Completo", description: "TV, streaming services y sonido envolvente" },
  { icon: "Wind", title: "Aire Acondicionado", description: "Climatización individual en todas las habitaciones" },
  { icon: "Coffee", title: "Café de Cortesía", description: "Máquina Nespresso con cápsulas de bienvenida" },
  { icon: "ShieldCheck", title: "Seguridad y Privacidad", description: "Cerradura inteligente y zona residencial tranquila" },
  { icon: "MapPin", title: "Ubicación Premium", description: "A pocos metros de la playa y servicios locales" }
]

export default async function LandingPage({ params }: PageProps) {
  const { slug } = await params

  const property = await getCachedProperty(slug)

  if (!property) {
    // Verificar si la propiedad existe pero no está activa
    const inactiveProperty = await getPropertyBySlugPublic(slug, true) // includeInactive = true

    if (inactiveProperty && !inactiveProperty.is_active) {
      // La propiedad existe pero no está activa
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Propiedad no disponible
            </h1>
            <p className="text-gray-600 mb-6">
              Esta propiedad no está disponible en este momento.
            </p>
          </div>
        </div>
      )
    }

    notFound()
  }

  // Get landing config with fallbacks
  const config = property.landing_config || {}
  const heroSubtitle = config.hero_subtitle || "Lujo, comodidad y atención al detalle en cada rincón del apartamento"
  const displayHighlights = config.highlights || defaultHighlights
  const spaceDesc = config.space_descriptions || {
    rooms: "Espacios amplios y confortables para tu descanso",
    bathrooms: "Baños modernos y completamente equipados",
    kitchen: "Cocina totalmente equipada para preparar tus comidas"
  }

  // Obtener imagen de portada de la galería si existe
  let coverImageUrl = property.image_url || null
  let galleryImages: any[] = []
  try {
    const tenantId = await getPropertyTenantId(property.id)
    if (tenantId) {
      const coverImage = await getCoverImage(property.id, tenantId)
      if (coverImage) {
        coverImageUrl = coverImage.image_url
      }
    }
    // Obtener todas las imágenes de la galería
    galleryImages = await getPropertyImagesPublic(property.id)
  } catch (error) {
    // Si hay error, usar image_url como fallback
    console.error('Error obteniendo imágenes:', error)
  }

  const address = [property.street, property.city, property.province, property.country]
    .filter(Boolean)
    .join(', ')

  return (
    <>
      <LandingHeader slug={slug} />
      <LandingHero property={property} slug={slug} coverImageUrl={coverImageUrl} />

      {/* Property Highlights */}
      <section id="características" className="w-full py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Lo Mejor de {property.name}</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              {heroSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayHighlights.map((highlight: any, idx: number) => {
              const Icon = iconMap[highlight.icon] || Info
              return (
                <div key={idx} className="bg-white rounded-xl p-6 border border-slate-200/80 transition-shadow hover:shadow-md">
                  <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{highlight.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{highlight.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <LandingGallerySection images={galleryImages} propertyName={property.name} />

      {/* Rooms and Amenities */}
      <section className="w-full py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Espacios Pensados para Ti</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Cada rincón diseñado con atención y confort
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {property.bedrooms && property.bedrooms > 0 && (
              <div className="bg-white rounded-xl p-8 border border-slate-200/80 transition-shadow hover:shadow-md">
                <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center mb-5">
                  <BedDouble className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {property.bedrooms} {property.bedrooms === 1 ? 'Habitación' : 'Habitaciones'}
                </h3>
                <p className="text-slate-600 mb-5">
                  {spaceDesc.rooms}
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-slate-700 text-sm">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                    Camas premium
                  </li>
                  <li className="flex items-center gap-2 text-slate-700 text-sm">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                    Armarios espaciosos
                  </li>
                </ul>
              </div>
            )}
            {property.bathrooms && property.bathrooms > 0 && (
              <div className="bg-white rounded-xl p-8 border border-slate-200/80 transition-shadow hover:shadow-md">
                <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center mb-5">
                  <Bath className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {property.bathrooms} {property.bathrooms === 1 ? 'Baño' : 'Baños'}
                </h3>
                <p className="text-slate-600 mb-5">
                  {spaceDesc.bathrooms}
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-slate-700 text-sm">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                    Artículos de aseo incluidos
                  </li>
                  <li className="flex items-center gap-2 text-slate-700 text-sm">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                    Toallas premium
                  </li>
                </ul>
              </div>
            )}
            <div className="bg-white rounded-xl p-8 border border-slate-200/80 transition-shadow hover:shadow-md">
              <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center mb-5">
                <ChefHat className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Cocina Completa</h3>
              <p className="text-slate-600 mb-5">
                {spaceDesc.kitchen}
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-slate-700 text-sm">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                  Electrodomésticos modernos
                </li>
                <li className="flex items-center gap-2 text-slate-700 text-sm">
                  <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                  Utensilios de cocina
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Booking and Pricing Section */}
      <section className="w-full py-20 lg:py-28 bg-slate-50">
        <LandingBookingSection property={property} slug={slug} />
      </section>

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

