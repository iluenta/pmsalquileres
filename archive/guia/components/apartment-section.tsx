import { UtensilsCrossed, Bed, Waves } from "lucide-react"

const spaces = [
  {
    icon: UtensilsCrossed,
    title: "Salón - Comedor",
    description: 'Espacio amplio y luminoso con sofá, TV Smart de 43", aire acondicionado y acceso a la terraza.',
    features: ["WiFi Gratis", "A/A"],
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: UtensilsCrossed,
    title: "Cocina Equipada",
    description:
      "Cocina completa con vitrocerámica, horno, microondas, nevera, lavavajillas y todo el menaje necesario.",
    features: ["Cafetera", "Licuadora"],
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: Bed,
    title: "Dormitorio Principal",
    description:
      "Habitación con cama de matrimonio (150x190), armario empotrado, aire acondicionado y ropa de cama de calidad.",
    features: ["Cama 150x190", "Armario"],
    image:
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    icon: Waves,
    title: "Piscina Comunitaria",
    description:
      "Acceso a la piscina comunitaria con zona de solárium, perfecta para refrescarte en los días calurosos.",
    features: ["Piscina", "Solárium"],
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
]

export function ApartmentSection() {
  return (
    <section id="apartamento" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Tu Hogar en Vera
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            Un apartamento completamente equipado con todo lo que necesitas para sentirte como en casa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
          {spaces.map((space, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border"
            >
              <div className="relative h-48 md:h-64 overflow-hidden">
                <img
                  src={space.image || "/placeholder.svg"}
                  alt={space.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-4 py-2 rounded-full font-semibold text-sm">
                  {space.title.split(" ")[0]}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-card-foreground mb-3 flex items-center gap-2">
                  <space.icon className="h-5 w-5 text-primary" />
                  {space.title}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">{space.description}</p>
                <div className="flex gap-3">
                  {space.features.map((feature, idx) => (
                    <span key={idx} className="text-sm bg-muted px-3 py-1 rounded-full text-muted-foreground">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-muted rounded-2xl p-6 md:p-8 border-l-4 border-primary">
          <h3 className="text-xl font-bold text-foreground mb-3">Información del Apartamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground mb-1">Dirección</p>
              <p>Calle Ejemplo, 123, 04620 Vera, Almería</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Check-in / Check-out</p>
              <p>Entrada: 16:00h | Salida: 11:00h</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Código de acceso</p>
              <p>07349</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">WiFi</p>
              <p>Ver@Tesper@1234</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
