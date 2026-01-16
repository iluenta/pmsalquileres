'use client'

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from 'lucide-react'

interface LandingHeaderProps {
  slug: string
}

export function LandingHeader({ slug }: LandingHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/90 backdrop-blur-md border-b border-slate-100 py-2'
        : 'bg-transparent py-4'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/landing/${slug}`} className="flex items-center gap-2">
            <div className={`w-9 h-9 flex items-center justify-center rounded-lg shadow-sm transition-colors ${scrolled ? 'bg-teal-600' : 'bg-white/20 backdrop-blur-sm'}`}>
              <span className="text-white font-bold text-sm">VT</span>
            </div>
            <span className={`font-bold text-lg tracking-tight transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>
              VeraTespera
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#características" className={`text-sm font-medium transition-colors hover:text-teal-600 ${scrolled ? 'text-slate-600' : 'text-white/90'}`}>
              Características
            </a>
            <a href="#galeria" className={`text-sm font-medium transition-colors hover:text-teal-600 ${scrolled ? 'text-slate-600' : 'text-white/90'}`}>
              Galería
            </a>
            <a href="#precios" className={`text-sm font-medium transition-colors hover:text-teal-600 ${scrolled ? 'text-slate-600' : 'text-white/90'}`}>
              Precios
            </a>
            <a href="#ubicacion" className={`text-sm font-medium transition-colors hover:text-teal-600 ${scrolled ? 'text-slate-600' : 'text-white/90'}`}>
              Ubicación
            </a>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href={`/guides/${slug}`}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${scrolled ? 'text-slate-600 hover:text-teal-600 hover:bg-slate-50' : 'text-white/90 hover:text-white hover:bg-white/10'}`}
            >
              Guía del Huésped
            </Link>
            <a
              href="#precios"
              className="bg-teal-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all hover:bg-teal-700 hover:scale-105 shadow-sm active:scale-95"
            >
              Reservar Ahora
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 transition-colors ${scrolled || isMenuOpen ? 'text-slate-600' : 'text-white'}`}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-xl animate-in slide-in-from-top duration-300">
          <div className="px-4 py-6 space-y-4">
            <div className="space-y-1">
              <a href="#características" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-slate-600 text-base font-medium rounded-md hover:text-teal-600 hover:bg-slate-50">Características</a>
              <a href="#galeria" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-slate-600 text-base font-medium rounded-md hover:text-teal-600 hover:bg-slate-50">Galería</a>
              <a href="#precios" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-slate-600 text-base font-medium rounded-md hover:text-teal-600 hover:bg-slate-50">Precios</a>
              <a href="#ubicacion" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-slate-600 text-base font-medium rounded-md hover:text-teal-600 hover:bg-slate-50">Ubicación</a>
            </div>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              <Link
                href={`/guides/${slug}`}
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center text-slate-600 text-base font-medium py-3 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                Guía del Huésped
              </Link>
              <a
                href="#precios"
                onClick={() => setIsMenuOpen(false)}
                className="w-full bg-teal-600 text-white text-center text-base font-medium py-3 rounded-lg hover:bg-teal-700 active:scale-[0.98] transition-all"
              >
                Reservar Ahora
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

