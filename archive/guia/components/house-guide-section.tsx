import { Thermometer, Wifi, Key, Recycle } from "lucide-react"

const guides = [
  {
    icon: Thermometer,
    title: "TEMPERATURA",
    description: "Para una ventilación adecuada, abre las ventanas durante las horas frescas del día.",
    detail:
      "El aire acondicionado está configurado para un consumo eficiente. Te recomendamos mantenerlo a 23°C para un confort óptimo.",
    tip: "Cierra ventanas y puertas cuando uses el aire acondicionado para mayor eficiencia.",
  },
  {
    icon: Wifi,
    title: "WIFI & TV",
    description: "Dispones de conexión WiFi gratuita de alta velocidad en todo el apartamento.",
    detail: "El televisor es Smart TV con acceso a Netflix, YouTube y otras aplicaciones.",
    tip: "Contraseña WiFi: Ver@Tesper@1234",
  },
  {
    icon: Key,
    title: "ACCESO",
    description: "Para el acceso de vehículos, utiliza el control remoto que encontrarás en el apartamento.",
    detail: "Para acceso peatonal, utiliza el código en el panel de entrada o las llaves proporcionadas.",
    tip: "Código de acceso: 07349",
  },
  {
    icon: Recycle,
    title: "RECICLAJE",
    description: "Los contenedores de reciclaje se encuentran en la entrada de la comunidad.",
    detail: "Por favor, separa los residuos según las indicaciones: orgánico, plástico, papel y vidrio.",
    tip: "Deposita la basura orgánica por la noche para evitar olores.",
  },
]

export function HouseGuideSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Guía de la Casa
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            Todo lo que necesitas saber sobre el funcionamiento del apartamento
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {guides.map((guide, index) => (
            <div
              key={index}
              className="bg-card p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border-l-4 border-secondary"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <guide.icon className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground">{guide.title}</h3>
              </div>
              <p className="text-muted-foreground mb-3 leading-relaxed">{guide.description}</p>
              <p className="text-muted-foreground mb-4 leading-relaxed">{guide.detail}</p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-foreground">
                  <strong>Consejo:</strong> {guide.tip}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
