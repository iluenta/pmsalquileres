import { MapPin, Utensils, Waves, Info, Home, Heart } from "lucide-react"

const benefits = [
  {
    icon: Home,
    title: "Conoce tu Apartamento",
    description:
      "Instrucciones detalladas sobre WiFi, aire acondicionado, electrodomésticos y todo lo que necesitas saber",
  },
  {
    icon: Waves,
    title: "6 Playas Exclusivas",
    description:
      "Desde El Playazo hasta calas escondidas, descubre las mejores playas con distancias y características",
  },
  {
    icon: Utensils,
    title: "8+ Restaurantes Seleccionados",
    description: "Los mejores lugares para comer según los locales, con valoraciones reales y especialidades",
  },
  {
    icon: MapPin,
    title: "Actividades Únicas",
    description: "Parques acuáticos, golf, senderismo, buceo y experiencias que no encontrarás en Google",
  },
  {
    icon: Info,
    title: "Info Práctica Esencial",
    description: "Supermercados, farmacias, transporte, emergencias y todo lo que necesitas al alcance",
  },
  {
    icon: Heart,
    title: "Consejos de Anfitriones",
    description: "Sonia y Pedro comparten sus secretos locales para que aproveches cada momento",
  },
]

export function ValuePropositionTest() {
  return (
    <section id="valor" className="py-16 md:py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            ¿Por qué necesitas esta guía?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            No pierdas tiempo buscando información dispersa. Todo lo que necesitas para disfrutar tu estancia en un solo
            lugar, creado por quienes mejor conocen Vera.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-card p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-border hover:border-primary/30"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <benefit.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 md:mt-16 bg-accent/10 border-l-4 border-accent rounded-lg p-6 md:p-8">
          <p className="text-lg md:text-xl font-semibold text-foreground mb-2">💡 Ahorra horas de planificación</p>
          <p className="text-muted-foreground leading-relaxed">
            Los huéspedes que usan esta guía aprovechan un 40% más su tiempo de vacaciones al tener toda la información
            organizada y verificada por locales.
          </p>
        </div>
      </div>
    </section>
  )
}
