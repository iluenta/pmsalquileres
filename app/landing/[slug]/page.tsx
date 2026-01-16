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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayHighlights.map((highlight: any, idx: number) => {
              const Icon = iconMap[highlight.icon] || Info
              return (
                <div key={idx} className="bg-white rounded-3xl p-8 border border-slate-200/60 transition-all hover:shadow-xl hover:-translate-y-1 group">
                  <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-600 transition-colors duration-300">
                    <Icon className="w-7 h-7 text-teal-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{highlight.title}</h3>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {property.bedrooms && property.bedrooms > 0 && (
              <div className="bg-slate-50 rounded-[2.5rem] p-8 sm:p-10 border border-slate-200/50 transition-all hover:bg-white hover:shadow-2xl hover:border-teal-100 group">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                  <BedDouble className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">
                  {property.bedrooms} {property.bedrooms === 1 ? 'Habitación' : 'Habitaciones'}
                </h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  {spaceDesc.rooms}
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="w-2 h-2 bg-teal-500 rounded-full" />
                    Camas premium
                  </li>
                  <li className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="w-2 h-2 bg-teal-500 rounded-full" />
                    Armarios espaciosos
                  </li>
                </ul>
              </div>
            )}
            {property.bathrooms && property.bathrooms > 0 && (
              <div className="bg-slate-50 rounded-[2.5rem] p-8 sm:p-10 border border-slate-200/50 transition-all hover:bg-white hover:shadow-2xl hover:border-teal-100 group">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                  <Bath className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">
                  {property.bathrooms} {property.bathrooms === 1 ? 'Baño' : 'Baños'}
                </h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  {spaceDesc.bathrooms}
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="w-2 h-2 bg-teal-500 rounded-full" />
                    Artículos de aseo
                  </li>
                  <li className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="w-2 h-2 bg-teal-500 rounded-full" />
                    Toallas premium
                  </li>
                </ul>
              </div>
            )}
            <div className="bg-slate-50 rounded-[2.5rem] p-8 sm:p-10 border border-slate-200/50 transition-all hover:bg-white hover:shadow-2xl hover:border-teal-100 group sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                <ChefHat className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Cocina Completa</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                {spaceDesc.kitchen}
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <div className="w-2 h-2 bg-teal-500 rounded-full" />
                  Electrodomésticos
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <div className="w-2 h-2 bg-teal-500 rounded-full" />
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
        <section id="ubicacion" className="w-full py-20 lg:py-28 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-900 rounded-[3rem] p-10 sm:p-20 relative overflow-hidden shadow-2xl">
              {/* Abstract decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />

              <div className="relative z-10 text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-full text-teal-400 text-sm font-bold uppercase tracking-widest mb-8 border border-teal-500/20">
                  <MapPin className="w-4 h-4" />
                  <span>Ubicación Privilegiada</span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">Vera Playa, Almería</h2>
                <p className="text-slate-400 text-xl mb-10 leading-relaxed font-light">
                  {address}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-white text-slate-900 font-bold px-10 py-4 rounded-2xl transition-all hover:bg-slate-100 hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
                  >
                    Ver en Google Maps
                    <Info className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <LandingCTASection slug={slug} />
      <LandingFooter propertyName={property.name} address={address} />
    </>
  )
}

