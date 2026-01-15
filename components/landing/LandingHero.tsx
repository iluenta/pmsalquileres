'use client'

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Users } from 'lucide-react'
import type { Property } from '@/lib/api/properties'

interface LandingHeroProps {
  property: Property
  slug: string
  coverImageUrl?: string | null
}

export function LandingHero({ property, slug, coverImageUrl }: LandingHeroProps) {
  const imageUrl = coverImageUrl || property.image_url || '/placeholder.jpg'
  const maxGuests = property.max_guests || 4

  const getChannelStyle = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('airbnb')) return { color: 'bg-red-500', initial: 'A' }
    if (n.includes('booking')) return { color: 'bg-blue-600', initial: 'B' }
    if (n.includes('google')) return { color: 'bg-green-600', initial: 'G' }
    if (n.includes('expedia')) return { color: 'bg-blue-800', initial: 'E' }
    return { color: 'bg-teal-600', initial: name.charAt(0).toUpperCase() }
  }

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-16">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt={property.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/30 to-slate-900/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <span className="text-white/90 text-sm font-medium">
            Lujo & Confort en {property.city || 'Vera'}
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
          {property.name}
        </h1>
        <p className="text-xl sm:text-2xl text-white/80 mb-8 font-light max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          {property.description?.split('.')[0] || 'Propiedad superchula en Vera'}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <a
            href="#precios"
            className="w-full sm:w-auto bg-teal-600 text-white font-medium px-8 py-3.5 rounded-lg transition-all hover:bg-teal-700 hover:scale-105 shadow-lg active:scale-95 flex items-center justify-center"
          >
            Reservar Ahora
          </a>
          <a
            href="#características"
            className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border border-white/30 text-white font-medium px-8 py-3.5 rounded-lg transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
          >
            Ver Detalles
          </a>
        </div>

        {/* Ratings */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          {property.landing_config?.channel_ratings && Object.keys(property.landing_config.channel_ratings).length > 0 ? (
            Object.entries(property.landing_config.channel_ratings).map(([id, ratingData]: [string, any]) => {
              if (!ratingData.rating) return null
              const style = getChannelStyle(ratingData.name || 'Channel')
              return (
                <div key={id} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm shadow-xl rounded-full px-4 py-2.5 border border-white/10 transition-transform hover:scale-105 cursor-default">
                  <div className={`w-6 h-6 ${style.color} rounded-full flex items-center justify-center ring-2 ring-white/20`}>
                    <span className="text-white text-[10px] font-bold">{style.initial}</span>
                  </div>
                  <span className="text-white font-bold">{ratingData.rating}</span>
                  <span className="text-white/60 text-xs font-medium">/ 5</span>
                  {ratingData.reviews_count && (
                    <span className="text-white/50 text-xs border-l border-white/20 pl-2 ml-1">
                      {ratingData.reviews_count} reseñas
                    </span>
                  )}
                </div>
              )
            })
          ) : (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2.5 border border-white/10">
              <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center ring-2 ring-white/20">
                <Star className="w-3.5 h-3.5 fill-white text-white" />
              </div>
              <span className="text-white font-bold">4.9</span>
              <span className="text-white/60 text-xs font-medium">/ 5</span>
              <span className="text-white/50 text-xs border-l border-white/20 pl-2 ml-1">47 reseñas</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex items-center justify-center gap-6 text-white/80 animate-in fade-in duration-1000 delay-500">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">{maxGuests} huéspedes</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <span className="text-sm font-medium">{property.city || 'Vera'}</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-2.5 bg-white/60 rounded-full" />
        </div>
      </div>
    </section>
  )
}

