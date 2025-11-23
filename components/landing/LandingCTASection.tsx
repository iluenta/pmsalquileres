import { Button } from "@/components/ui/button"
import Link from "next/link"

interface LandingCTASectionProps {
  slug: string
}

export function LandingCTASection({ slug }: LandingCTASectionProps) {
  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-r from-primary to-accent text-white">
      <div className="container mx-auto px-4 text-center space-y-6">
        <h2 className="font-serif text-3xl md:text-4xl font-bold">¿Listo para tu Escapada?</h2>
        <p className="text-lg text-white/90 max-w-2xl mx-auto">
          Reserva ahora y disfruta de tus vacaciones en el apartamento perfecto. Disponibilidad inmediata.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button size="lg" variant="secondary" asChild>
            <Link href={`/landing/${slug}/reservas`}>Reservar Ahora</Link>
          </Button>
          <Button size="lg" variant="outline" className="border-white hover:bg-white/20" asChild>
            <Link href={`/guides/${slug}/public`}>Ver Guía del Huésped</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

