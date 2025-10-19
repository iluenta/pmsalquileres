import { ArrowDown } from "lucide-react"

interface GuideHeroProps {
  propertyName: string
  welcomeMessage: string
}

export function GuideHero({ propertyName, welcomeMessage }: GuideHeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary pt-16">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
        }}
      />

      <div className="container mx-auto px-4 z-10 text-center">
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight text-balance">
          Guía del Huésped
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto leading-relaxed text-pretty">
          {welcomeMessage}
        </p>
        <p className="text-base md:text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
          Tu compañero esencial para disfrutar al máximo tu estancia en {propertyName}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <a
            href="#apartamento"
            className="inline-flex items-center justify-center px-8 py-4 bg-secondary text-secondary-foreground font-semibold rounded-full hover:bg-secondary/90 transition-all shadow-lg hover:shadow-xl"
          >
            Descubre la Guía
          </a>
          <a
            href="#contacto"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary-foreground/10 backdrop-blur-sm text-primary-foreground font-semibold rounded-full hover:bg-primary-foreground/20 transition-all border-2 border-primary-foreground/30"
          >
            Contactar Anfitriones
          </a>
        </div>

        <div className="mt-16 animate-bounce">
          <ArrowDown className="h-8 w-8 text-primary-foreground/70 mx-auto" />
        </div>
      </div>
    </section>
  )
}
