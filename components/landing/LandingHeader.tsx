'use client'

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from 'lucide-react'

interface LandingHeaderProps {
  slug: string
}

export function LandingHeader({ slug }: LandingHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-neutral-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={`/landing/${slug}`} className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-lg">VT</span>
          </div>
          <span className="font-serif text-xl font-bold text-primary hidden sm:inline">VeraTespera</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#características" className="text-sm text-foreground hover:text-primary transition">Características</a>
          <a href="#galeria" className="text-sm text-foreground hover:text-primary transition">Galería</a>
          <a href="#precios" className="text-sm text-foreground hover:text-primary transition">Precios</a>
          <a href="#ubicacion" className="text-sm text-foreground hover:text-primary transition">Ubicación</a>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href={`/guides/${slug}`}>Guía del Huésped</Link>
          </Button>
          <Button asChild>
            <Link href={`/landing/${slug}/reservas`}>Reservar Ahora</Link>
          </Button>
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white p-4 space-y-4">
          <a href="#características" className="block text-sm text-foreground hover:text-primary">Características</a>
          <a href="#galeria" className="block text-sm text-foreground hover:text-primary">Galería</a>
          <a href="#precios" className="block text-sm text-foreground hover:text-primary">Precios</a>
          <a href="#ubicacion" className="block text-sm text-foreground hover:text-primary">Ubicación</a>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" asChild className="flex-1">
              <Link href={`/guides/${slug}`}>Guía</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href={`/landing/${slug}/reservas`}>Reservar</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}

