import { Waves, Car, Trophy, Coffee, Shirt, Sparkles } from "lucide-react"

const tips = [
  {
    icon: Waves,
    title: "Piscina",
    description:
      "La piscina comunitaria está cerca del apartamento. Necesitarás la tarjeta magnética que encontrarás en el apartamento para acceder.",
    tip: "Horario: 10:00 - 14:30 y 15:00 - 20:00",
  },
  {
    icon: Car,
    title: "Parking",
    description: "Tienes asignada una plaza de parking subterránea exclusiva para tu uso durante tu estancia.",
    tip: "Tu plaza: Número 288",
  },
  {
    icon: Trophy,
    title: "Padel/Tenis",
    description:
      "Las instalaciones de padel y tenis están disponibles para los residentes. Es necesario reservar con antelación.",
    tip: "Ubicación: Bloque 22 - 1 - 5",
  },
  {
    icon: Coffee,
    title: "Cafetera",
    description:
      "Para un mejor funcionamiento de la cafetera y para evitar la acumulación de cal, te recomendamos usar siempre agua mineral.",
    tip: "Limpia la cafetera después de cada uso para mantenerla en óptimas condiciones.",
  },
  {
    icon: Shirt,
    title: "Lavadora",
    description:
      "Hemos proporcionado detergente ecológico para tu uso. Encontrarás dos dosis en el estante de la lavandería.",
    tip: "Programa recomendado: 30 minutos para cargas normales",
  },
  {
    icon: Sparkles,
    title: "Lavavajillas",
    description:
      "Para un lavado óptimo, utiliza dos pastillas de detergente (una en el compartimento principal y otra en el de prelavado).",
    tip: "Los programas de 30 minutos o ECO son los más eficientes",
  },
]

export function TipsSection() {
  return (
    <section className="py-16 md:py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Consejos para tu Estancia
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            Recomendaciones para aprovechar al máximo las instalaciones durante tu visita
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3">
                <tip.icon className="h-6 w-6" />
                <h3 className="text-lg font-bold">{tip.title}</h3>
              </div>
              <div className="p-6">
                <p className="text-muted-foreground mb-4 leading-relaxed">{tip.description}</p>
                <div className="bg-muted p-3 rounded-lg border-l-3 border-secondary">
                  <p className="text-sm text-foreground">{tip.tip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
