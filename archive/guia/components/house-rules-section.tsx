import { CookingPot as SmokingNo, Volume2, Home, Moon } from "lucide-react"

const rules = [
  {
    icon: SmokingNo,
    title: "No Fumar",
    description: "Por favor, no fumes dentro del apartamento. Puedes hacerlo en las zonas exteriores designadas.",
  },
  {
    icon: Volume2,
    title: "Sin Fiestas",
    description: "No se permiten fiestas ni eventos ruidosos. Mantén un volumen moderado, especialmente por la noche.",
  },
  {
    icon: Home,
    title: "Cuida como en Casa",
    description: "Trata el apartamento como si fuera tu hogar. Si encuentras algún problema, contáctanos de inmediato.",
  },
  {
    icon: Moon,
    title: "Respeta el Descanso",
    description: "Por favor, mantén la tranquilidad entre las 22:00h y las 8:00h para no molestar a otros residentes.",
  },
]

export function HouseRulesSection() {
  return (
    <section className="py-16 md:py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Normas de la Casa
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            Para garantizar una estancia agradable para todos, te pedimos que respetes estas sencillas normas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {rules.map((rule, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-2xl text-center shadow-sm hover:shadow-lg transition-all duration-300 border-t-4 border-primary"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <rule.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-card-foreground mb-3">{rule.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{rule.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
