import { Ticket } from "lucide-react"

const activities = [
  {
    name: "AquaVera Parque Acuático",
    description:
      "Parque acuático en la playa de Vera con atracciones para familias, niños y jóvenes. Toboganes, piscinas de olas y zonas de relax para disfrutar en familia.",
    distance: "10 min en coche",
    price: "Desde 14€",
    badge: "Familiar",
    image:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Club del Golf Valle del Este",
    description:
      "Campo de golf de 18 holes diseñado por José Canales. Cuenta con escuela de golf, restaurante y pro shop. Un desafío para jugadores de todos los niveles.",
    distance: "15 min en coche",
    price: "Precio green fee",
    badge: "Deporte",
    image:
      "https://images.unsplash.com/photo-1587105329505-6c6b7f5ed828?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Salar de los Canos",
    description:
      "Humedal que conforma uno de los ecosistemas más importantes de la provincia de Almería. Hábitat de garza real, flamencos, ánade real y otras especies.",
    distance: "20 min caminando",
    price: "Gratuito",
    badge: "Naturaleza",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Plaza de Toros de Vera",
    description:
      "La plaza de toros más antigua de la provincia de Almería, construida en 1897. Estilo neoárabe con museo taurino en sus bajos. Visita obligada para los amantes de la historia.",
    distance: "10 min en coche",
    price: "Consultar horarios",
    badge: "Cultural",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Oasys MiniHollywood",
    description:
      "Parque temático en el desierto de Tabernas, antiguo decorado de películas del Lejano Oeste. Pueblo de vaqueros, reserva zoológica y zona acuática.",
    distance: "75 km",
    price: "Desde 14€",
    badge: "Aventura",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Parque Natural Cabo de Gata",
    description:
      "Espacio natural protegido con playas vírgenes, calas y paisajes volcánicos. Ideal para senderismo, snorkel, observación de aves y visitas a faros.",
    distance: "30-40 km",
    price: "Gratuito",
    badge: "Natural",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
]

export function ActivitiesSection() {
  return (
    <section id="actividades" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Actividades y Atracciones
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            Desde parques acuáticos hasta reservas naturales. Experiencias únicas que no encontrarás en Google
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={activity.image || "/placeholder.svg"}
                  alt={activity.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full font-semibold text-sm">
                  {activity.badge}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-card-foreground mb-3">{activity.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{activity.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{activity.distance}</span>
                  <span className="flex items-center gap-1 text-accent font-semibold">
                    <Ticket className="h-4 w-4" />
                    {activity.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
