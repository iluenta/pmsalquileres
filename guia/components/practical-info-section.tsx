import { ShoppingCart, Heart, Bus, Cloud, Calendar, Lightbulb } from "lucide-react"

const infoCards = [
  {
    icon: ShoppingCart,
    title: "Supermercados",
    items: [
      "Mercadona (Av. de la Playa, 15) - A 5 minutos en coche",
      "Lidl (Calle Almería, 2) - A 7 minutos en coche",
      "Consum (Calle Pintor Sorolla, 2) - A 10 minutos en coche",
      "Mercado de Vera (sábados por la mañana) - Productos locales frescos",
    ],
  },
  {
    icon: Heart,
    title: "Servicios Médicos",
    items: [
      "Centro de Salud Vera (Calle Águila, 1) - A 10 minutos en coche",
      "Farmacia Guardia: Consultar en la puerta del apartamento",
      "Hospital de la Inmaculada (Huércal-Overa) - A 25 minutos en coche",
      "Teléfono emergencias: 112",
    ],
  },
  {
    icon: Bus,
    title: "Transporte",
    items: [
      "Autobús urbano de Vera - Consultar horarios en la parada",
      "Taxi Vera: Tel. 950 39 30 16",
      "Estación de tren más cercana: Almería (a 90 km)",
      "Aeropuerto más cercano: Almería (LEI) - A 85 km",
    ],
  },
  {
    icon: Cloud,
    title: "Clima y Temporada",
    items: [
      "Vera disfruta de más de 320 días de sol al año",
      "Verano (junio-septiembre): 25-35°C, ideal para playa",
      "Otoño/Primavera: 18-25°C, perfecto para actividades al aire libre",
      "Invierno: 12-18°C, días soleados y noches frescas",
    ],
  },
  {
    icon: Calendar,
    title: "Eventos Locales",
    items: [
      "Fiestas de San Cleofás (septiembre) - Fiestas patronales",
      "Mercado Medieval (junio) - En el centro histórico de Vera",
      "Feria de Vera (agosto) - Atracciones, conciertos y gastronomía",
      "Consultar el calendario de eventos en el Ayuntamiento de Vera",
    ],
  },
  {
    icon: Lightbulb,
    title: "Consejos Útiles",
    items: [
      "Lleva siempre protector solar y agua, especialmente en verano",
      "Reserva restaurantes con antelación en temporada alta",
      "Respeta el medio ambiente en playas y espacios naturales",
      "Consulta los horarios de apertura de establecimientos",
    ],
  },
]

export function PracticalInfoSection() {
  return (
    <section className="py-16 md:py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Información Práctica
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            Todo lo esencial al alcance: supermercados, servicios médicos, transporte y más
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {infoCards.map((card, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-border"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <card.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground mb-4">{card.title}</h3>
              <ul className="space-y-2">
                {card.items.map((item, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground leading-relaxed flex">
                    <span className="mr-2 text-primary">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
