import { Button } from "@/components/ui/button"
import Link from "next/link"

interface LandingCTASectionProps {
  slug: string
}

export function LandingCTASection({ slug }: LandingCTASectionProps) {
  return (
    <section className="py-24 lg:py-32 bg-teal-600 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-700 rounded-full blur-3xl opacity-50" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
          ¿Listo para tu escapada?
        </h2>
        <p className="text-teal-50 text-xl mb-10 max-w-xl mx-auto font-light leading-relaxed">
          Reserva ahora y disfruta de una experiencia única. Disponibilidad inmediata para tus vacaciones soñadas en Vera.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <a
            href="#precios"
            className="w-full sm:w-auto bg-white text-teal-600 font-bold px-12 py-4 rounded-2xl transition-all hover:bg-teal-50 hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center text-lg"
          >
            Reservar Ahora
          </a>
          <Link
            href={`/guides/${slug}`}
            className="w-full sm:w-auto bg-teal-700/30 backdrop-blur-md text-white font-semibold px-12 py-4 rounded-2xl transition-all hover:bg-white/10 hover:scale-105 active:scale-95 border border-white/20 text-lg"
          >
            Ver Guía del Huésped
          </Link>
        </div>
      </div>
    </section>
  )
}

