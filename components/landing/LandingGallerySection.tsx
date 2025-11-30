'use client'

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PropertyImage } from "@/types/property-images"

interface LandingGallerySectionProps {
  images: PropertyImage[]
  propertyName: string
}

export function LandingGallerySection({ images, propertyName }: LandingGallerySectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Si no hay imágenes, no mostrar la sección
  if (!images || images.length === 0) {
    return null
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <section id="galeria" className="w-full py-16 md:py-24 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Galería</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre cada rincón de {propertyName} en detalle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Imagen principal */}
          <div className="md:col-span-2 relative aspect-[3/2] rounded-lg overflow-hidden group">
            <Image
              src={images[currentIndex].image_url}
              alt={images[currentIndex].title}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 1200px"
              priority={currentIndex === 0}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
            
            {/* Botones de navegación */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white z-10 h-10 w-10"
                  onClick={goToPrevious}
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white z-10 h-10 w-10"
                  onClick={goToNext}
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Contador */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-4 bg-black/60 px-4 py-2 rounded text-white text-sm font-medium">
                {currentIndex + 1} / {images.length}
              </div>
            )}

            {/* Título de la imagen */}
            <div className="absolute bottom-4 right-4 bg-black/60 px-4 py-2 rounded text-white text-sm max-w-[60%]">
              {images[currentIndex].title}
            </div>
          </div>

          {/* Miniaturas */}
          {images.length > 1 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:col-span-2">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => goToImage(idx)}
                  className={`relative aspect-[3/2] rounded-lg overflow-hidden border-2 transition-all ${
                    currentIndex === idx 
                      ? "border-primary ring-2 ring-primary ring-offset-2" 
                      : "border-neutral-300 hover:border-primary/50"
                  }`}
                  aria-label={`Ver ${img.title}`}
                >
                  <Image
                    src={img.image_url}
                    alt={img.title}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                  <span className="absolute inset-0 bg-black/0 hover:bg-black/40 transition flex items-center justify-center text-white text-xs font-semibold px-2 text-center">
                    {img.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

