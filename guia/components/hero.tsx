import { ArrowDown } from "lucide-react"

export function Hero() {
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
          Tu Guía Esencial para una Estancia Perfecta en Vera
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto leading-relaxed text-pretty">
          Descubre los secretos locales, las mejores playas, restaurantes imprescindibles y todo lo que necesitas para
          vivir una experiencia inolvidable en la Costa de Almería
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="#valor"
            className="inline-flex items-center justify-center px-8 py-4 bg-secondary text-secondary-foreground font-semibold rounded-full hover:bg-secondary/90 transition-all shadow-lg hover:shadow-xl"
          >
            Descubre la Guía
          </a>
          <a
            href="#apartamento"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary-foreground/10 backdrop-blur-sm text-primary-foreground font-semibold rounded-full hover:bg-primary-foreground/20 transition-all border-2 border-primary-foreground/30"
          >
            Ver Apartamento
          </a>
        </div>

        <div className="mt-16 animate-bounce">
          <ArrowDown className="h-8 w-8 text-primary-foreground/70 mx-auto" />
        </div>
      </div>
    </section>
  )
}
