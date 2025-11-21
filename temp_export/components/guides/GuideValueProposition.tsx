"use client"

import { MapPin, Utensils, Waves, Info, Home, Heart, ClipboardList, Book, Lightbulb } from "lucide-react"
import { CompleteGuideDataResponse } from "@/types/guides"

interface GuideValuePropositionProps {
  data: CompleteGuideDataResponse
}

export function GuideValueProposition({ data }: GuideValuePropositionProps) {
  // Crear beneficios dinámicos basados en los datos disponibles
  const benefits = [
    {
      icon: Home,
      title: "Conoce tu Apartamento",
      description: "Instrucciones detalladas sobre WiFi, aire acondicionado, electrodomésticos y todo lo que necesitas saber",
      show: data.apartment_sections && data.apartment_sections.length > 0
    },
    {
      icon: ClipboardList,
      title: "Normas de la Casa",
      description: "Información importante sobre el funcionamiento del apartamento y las reglas de convivencia",
      show: data.house_rules && data.house_rules.length > 0
    },
    {
      icon: Book,
      title: "Guía de la Casa",
      description: "Instrucciones detalladas sobre electrodomésticos, sistemas y todo lo que necesitas saber",
      show: data.house_guide_items && data.house_guide_items.length > 0
    },
    {
      icon: Lightbulb,
      title: "Consejos Locales",
      description: "Tips y recomendaciones de los anfitriones para aprovechar al máximo tu estancia",
      show: data.tips && data.tips.length > 0
    },
    {
      icon: Waves,
      title: "Playas Cercanas",
      description: "Descubre las mejores playas con distancias, características y recomendaciones locales",
      show: data.beaches && data.beaches.length > 0
    },
    {
      icon: Utensils,
      title: "Restaurantes Recomendados",
      description: "Los mejores lugares para comer según los locales, con valoraciones y especialidades",
      show: data.restaurants && data.restaurants.length > 0
    },
    {
      icon: MapPin,
      title: "Actividades Únicas",
      description: "Experiencias locales que no encontrarás en Google, desde parques acuáticos hasta senderismo",
      show: data.activities && data.activities.length > 0
    },
    {
      icon: Info,
      title: "Información Práctica",
      description: "Supermercados, farmacias, transporte, emergencias y todo lo que necesitas al alcance",
      show: data.practical_info && data.practical_info.length > 0
    },
    {
      icon: Heart,
      title: "Contacto Directo",
      description: "Información de contacto de los anfitriones para cualquier duda o emergencia",
      show: data.contact_info !== null
    }
  ]

  // Filtrar solo los beneficios que tienen contenido
  const availableBenefits = benefits.filter(benefit => benefit.show)

  // Si no hay beneficios disponibles, no mostrar la sección
  if (availableBenefits.length === 0) {
    return null
  }

  return (
    <section id="valor" className="py-16 md:py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            ¿Por qué necesitas esta guía?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            No pierdas tiempo buscando información dispersa. Todo lo que necesitas para disfrutar tu estancia en un solo
            lugar, creado por quienes mejor conocen {data.property?.name || "la zona"}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {availableBenefits.map((benefit, index) => (
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
