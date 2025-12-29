import { Star } from "lucide-react"

const restaurants = [
  {
    name: "Restaurante Juan Moreno",
    description:
      "Uno de los mejores restaurantes de Vera, especializado en cocina mediterránea. Ideal para una cena especial con platos elaborados y un ambiente refinado.",
    rating: "4.6/5",
    reviews: "619",
    price: "€€€€",
    badge: "Gourmet",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Terraza Carmona",
    description:
      "Un clásico de Vera con terraza y comida exquisita. Especializados en cocina mediterránea y europea. Servicio atento y ambiente acogedor.",
    rating: "4.4/5",
    reviews: "911",
    price: "€€-€€€",
    badge: "Clásico",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Freiduria Bar Rosado",
    description:
      "Especializados en pescado frito y marisco fresco. Buena comida a precio razonable. Recomendamos probar las berenjenas a la miel y los boquerones.",
    rating: "4.4/5",
    reviews: "410",
    price: "€€-€€€",
    badge: "Marisco",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Laguna Restaurant",
    description:
      "Cocina internacional y mediterránea en un ambiente elegante. Ideal para una cena especial con buena relación calidad-precio y servicio excelente.",
    rating: "4.4/5",
    reviews: "664",
    price: "€€-€€€",
    badge: "Internacional",
    image:
      "https://images.unsplash.com/photo-1526318896980-cf78c088247c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Restaurante Freiduria El Cenachero",
    description:
      "Fritura en la Playa de Vera, placer gastronómico en familia. Especializados en pescaíto frito y platos tradicionales de la zona.",
    rating: "4.3/5",
    reviews: "659",
    price: "€€-€€€",
    badge: "Fritura",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Chiringuito D´Maruja",
    description:
      "Chiringuito de playa ideal para picar tapas y disfrutar de ricos arroces con vistas al mar. Ambiente relajado y atención cercana.",
    rating: "4.2/5",
    reviews: "392",
    price: "€€-€€€",
    badge: "Playa",
    image:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Restaurante Lua Puerto Rey",
    description:
      "Gran restaurante en Vera playa con espectaculares vistas al mar. Especializados en cocina mediterránea y europea con productos frescos de la zona.",
    rating: "4.0/5",
    reviews: "1020",
    price: "€€-€€€",
    badge: "Vistas",
    image: "https://images.unsplash.com/photo-1522771930-2889bc8832c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Maraú Beach Club",
    description:
      "Ambiente de playa con piscina, música y cócteles. Ideal para pasar el día disfrutando del sol, buen ambiente y gastronomía mediterránea.",
    rating: "4.1/5",
    reviews: "1352",
    price: "€€-€€€",
    badge: "Club de Playa",
    image:
      "https://images.unsplash.com/photo-1521017432531-9a7e0cf3e558?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
]

export function RestaurantsSection() {
  return (
    <section id="restaurantes" className="py-16 md:py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Restaurantes Recomendados
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            Los mejores lugares para comer según los locales. Desde alta cocina hasta chiringuitos de playa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {restaurants.map((restaurant, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={restaurant.image || "/placeholder.svg"}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-secondary text-secondary-foreground px-3 py-1 rounded-full font-semibold text-xs">
                  {restaurant.badge}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-card-foreground mb-2 line-clamp-1">{restaurant.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed line-clamp-2">
                  {restaurant.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-secondary font-semibold">
                    <Star className="h-4 w-4 fill-current" />
                    {restaurant.rating}
                  </span>
                  <span className="text-muted-foreground">{restaurant.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
