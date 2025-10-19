import { Star, MapPin } from "lucide-react"

const beaches = [
  {
    name: "El Playazo",
    description:
      "La playa más grande e importante de Vera, con más de 2 kilómetros de longitud. Arena fina y dorada con todos los servicios: paseo marítimo, restaurantes, chiringuitos y club de playa.",
    distance: "15 min caminando",
    rating: "4.5/5",
    badge: "Recomendada",
    image:
      "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Playa de Las Marinas – Bolaga",
    description:
      "Playa de 1.775 metros con paseo marítimo ajardinado, carril bici y zonas de juego infantil. Cuenta con la certificación Q de calidad y chiringuitos para comer.",
    distance: "5 min en coche",
    rating: "4.3/5",
    badge: "Familiar",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Playa de Puerto Rey",
    description:
      "Playa urbana en la urbanización Puerto Rey, con accesos para discapacitados, duchas, aseos y chiringuitos. Zona tranquila de casas bajas con instalaciones deportivas.",
    distance: "10 min en coche",
    rating: "4.0/5",
    badge: "Tranquila",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Zona Naturista de El Playazo",
    description:
      "En la parte norte de El Playazo, mundialmente famosa por ser el primer enclave europeo oficialmente declarado para la práctica del nudismo. Cuenta con hoteles y restaurantes especializados.",
    distance: "15 min en coche",
    rating: "4.2/5",
    badge: "Naturista",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Playa de Quitapellejos",
    description:
      "La playa más tranquila y poco frecuentada de Vera, semiurbana con una pequeña calita privada y un pineda. Ideal cuando sopla viento de levante por su orientación sur.",
    distance: "20 min en coche",
    rating: "3.8/5",
    badge: "Escondida",
    image:
      "https://images.unsplash.com/photo-1533563996068-24833183f0b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Playa de Garrucha",
    description:
      "A solo 10 minutos en coche, esta playa de 1.100 metros cuenta con la Bandera Azul. Ambiente familiar con paseo marítimo, restaurantes y todos los servicios.",
    distance: "10 min en coche",
    rating: "4.4/5",
    badge: "Cercana",
    image:
      "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
]

export function BeachesSection() {
  return (
    <section id="playas" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Las Mejores Playas de Vera
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            Descubre 6 playas únicas, cada una con su propio encanto. Desde playas familiares hasta calas escondidas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {beaches.map((beach, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={beach.image || "/placeholder.svg"}
                  alt={beach.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full font-semibold text-sm">
                  {beach.badge}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-card-foreground mb-3">{beach.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-3">{beach.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {beach.distance}
                  </span>
                  <span className="flex items-center gap-1 text-secondary font-semibold">
                    <Star className="h-4 w-4 fill-current" />
                    {beach.rating}
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
