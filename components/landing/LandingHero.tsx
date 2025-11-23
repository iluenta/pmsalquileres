'use client'

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Users } from 'lucide-react'
import type { Property } from '@/lib/api/properties'

interface LandingHeroProps {
  property: Property
  slug: string
}

export function LandingHero({ property, slug }: LandingHeroProps) {
  const imageUrl = property.image_url || '/placeholder.jpg'
  const maxGuests = property.max_guests || 4

  return (
    <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden">
      <Image
        src={imageUrl}
        alt={property.name}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/30" />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
        <div className="text-center space-y-6 max-w-2xl">
          <div className="inline-block px-4 py-2 rounded-full bg-white/20 backdrop-blur border border-white/30">
            <span className="text-sm font-medium">Lujo & Confort en {property.city || 'Vera'}</span>
          </div>
          
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-balance">
            {property.name}
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto">
            {property.description || 'Apartamento boutique con vistas al mar, diseño moderno y amenidades premium para tus vacaciones soñadas'}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button size="lg" asChild>
              <Link href={`/landing/${slug}/reservas`}>Reservar Ahora</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/20 hover:bg-white/30 border-white" asChild>
              <a href="#características">Ver Detalles</a>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 pt-8">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
              <span className="text-sm">4.9/5 - 47 reseñas</span>
            </div>
            {maxGuests > 0 && (
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="text-sm">Hasta {maxGuests} huéspedes</span>
              </div>
            )}
            {property.city && (
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span className="text-sm">{property.city}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

