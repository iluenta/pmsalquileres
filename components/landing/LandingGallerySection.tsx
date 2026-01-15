'use client'

import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PropertyImage } from "@/types/property-images"

interface LandingGallerySectionProps {
  images: PropertyImage[]
  propertyName: string
}

export function LandingGallerySection({ images, propertyName }: LandingGallerySectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageOrientation, setImageOrientation] = useState<'horizontal' | 'vertical' | null>(null)

  // Si no hay imágenes, no mostrar la sección
  if (!images || images.length === 0) {
    return null
  }

  // Detectar orientación de la imagen actual
  useEffect(() => {
    const img = new window.Image()
    img.onload = () => {
      const isVertical = img.height > img.width
      setImageOrientation(isVertical ? 'vertical' : 'horizontal')
    }
    img.src = images[currentIndex].image_url
  }, [currentIndex, images])

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
    <section id="galeria" className="py-20 lg:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Galería
          </h2>
          <p className="text-slate-600 text-lg">
            Descubre cada rincón de {propertyName} en detalle
          </p>
        </div>

        {/* Featured Image */}
        <div className={`relative mb-6 rounded-2xl overflow-hidden bg-slate-100 shadow-xl group ${imageOrientation === 'vertical' ? 'max-h-[70vh]' : ''
          }`}>
          <div className={imageOrientation === 'vertical' ? 'h-full aspect-square md:aspect-auto' : 'aspect-video'}>
            <Image
              src={images[currentIndex].image_url}
              alt={images[currentIndex].title || propertyName}
              fill
              className={`transition-transform duration-500 group-hover:scale-105 ${imageOrientation === 'vertical' ? 'object-contain bg-slate-100' : 'object-cover'
                }`}
              priority
              sizes="(max-width: 1280px) 100vw, 1200px"
            />
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all hover:bg-white hover:scale-110 active:scale-95"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all hover:bg-white hover:scale-110 active:scale-95"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="w-5 h-5 text-slate-700" />
              </button>
            </>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-4 bg-slate-900/70 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-lg">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Label */}
          <div className="absolute bottom-4 right-4 bg-slate-900/70 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-lg max-w-[60%] truncate">
            {images[currentIndex].title || 'Vista General'}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToImage(index)}
                className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-300 ${index === currentIndex
                    ? 'ring-2 ring-teal-600 ring-offset-2 scale-105 z-10'
                    : 'opacity-60 hover:opacity-100 hover:scale-[1.02]'
                  }`}
                aria-label={`Ver ${image.title}`}
              >
                <Image
                  src={image.image_url}
                  alt={image.title || propertyName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 25vw, (max-width: 1024px) 15vw, 10vw"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

