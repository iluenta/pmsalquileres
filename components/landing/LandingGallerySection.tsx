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
    <section id="galeria" className="py-20 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Galería
          </h2>
          <p className="text-slate-600 text-lg">
            Descubre cada rincón de {propertyName} en detalle
          </p>
        </div>

        {/* Mobile View: Horizontal Scroll */}
        <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-8 no-scrollbar">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="flex-shrink-0 w-[85vw] aspect-[4/3] relative rounded-2xl overflow-hidden shadow-lg snap-center"
            >
              <Image
                src={image.image_url}
                alt={image.title || propertyName}
                fill
                className="object-cover"
                sizes="85vw"
              />
              {image.title && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg border border-white/10">
                  {image.title}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop View: Featured + Thumbnails */}
        <div className="hidden md:block px-4 sm:px-6 lg:px-8">
          <div className={`relative mb-6 rounded-2xl overflow-hidden bg-slate-100 shadow-2xl group ${imageOrientation === 'vertical' ? 'max-h-[75vh]' : ''
            }`}>
            <div className={imageOrientation === 'vertical' ? 'h-[75vh] w-full' : 'aspect-video'}>
              <Image
                src={images[currentIndex].image_url}
                alt={images[currentIndex].title || propertyName}
                fill
                className={`transition-transform duration-700 group-hover:scale-105 ${imageOrientation === 'vertical' ? 'object-contain bg-slate-900' : 'object-cover'
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
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl transition-all hover:bg-white hover:scale-110 active:scale-95 z-20"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-6 h-6 text-slate-700" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl transition-all hover:bg-white hover:scale-110 active:scale-95 z-20"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="w-6 h-6 text-slate-700" />
                </button>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-6 left-6 bg-slate-900/70 backdrop-blur-md text-white text-sm font-medium px-5 py-2.5 rounded-xl border border-white/10 shadow-lg">
              {currentIndex + 1} / {images.length}
            </div>

            {/* Label */}
            <div className="absolute bottom-6 right-6 bg-slate-900/70 backdrop-blur-md text-white text-sm font-medium px-5 py-2.5 rounded-xl border border-white/10 shadow-lg max-w-[60%] truncate">
              {images[currentIndex].title || 'Vista General'}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex flex-wrap gap-3 py-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => goToImage(index)}
                  className={`relative w-24 h-24 rounded-xl overflow-hidden transition-all duration-300 ${index === currentIndex
                      ? 'ring-4 ring-teal-500 ring-offset-2 scale-105 z-10 shadow-lg'
                      : 'opacity-50 hover:opacity-100 hover:scale-[1.05] grayscale-[20%] hover:grayscale-0'
                    }`}
                  aria-label={`Ver ${image.title}`}
                >
                  <Image
                    src={image.image_url}
                    alt={image.title || propertyName}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

