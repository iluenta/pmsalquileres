import { Button } from "@/components/ui/button"
import Link from "next/link"

interface LandingCTASectionProps {
  slug: string
}

export function LandingCTASection({ slug }: LandingCTASectionProps) {
  return (
    <section className="py-20 lg:py-28 bg-teal-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          ¿Listo para tu escapada?
        </h2>
        <p className="text-teal-100 text-lg mb-8 max-w-xl mx-auto">
          Reserva ahora y disfruta de una experiencia única. Disponibilidad inmediata para tus vacaciones soñadas.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#precios"
            className="w-full sm:w-auto bg-white text-teal-600 font-medium px-8 py-3.5 rounded-lg transition-all hover:bg-teal-50 hover:scale-105 active:scale-95 shadow-md flex items-center justify-center"
          >
            Reservar Ahora
          </a>
          <Link
            href={`/guides/${slug}`}
            className="w-full sm:w-auto bg-teal-500 text-white font-medium px-8 py-3.5 rounded-lg transition-all hover:bg-teal-400 hover:scale-105 active:scale-95 border border-teal-400"
          >
            Ver Guía del Huésped
          </Link>
        </div>
      </div>
    </section>
  )
}

