"use client"

import type { HouseRule } from "@/types/guides"
import { 
  Ban, 
  Volume2, 
  Home, 
  Bed, 
  Moon, 
  Info, 
  Users, 
  Baby,
  Car,
  Dog,
  Wifi,
  Music,
  Coffee,
  Utensils,
  Flame,
  AlertCircle,
  Heart
} from "lucide-react"

interface GuideHouseRulesSectionProps {
  rules: HouseRule[]
}

// Mapeo de iconos de Font Awesome a Lucide React
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "fas fa-smoking-ban": Ban,
  "fa-smoking-ban": Ban,
  "fas fa-ban": Ban,
  "fa-ban": Ban,
  "fas fa-volume-mute": Volume2,
  "fa-volume-mute": Volume2,
  "fas fa-volume-off": Volume2,
  "fa-volume-off": Volume2,
  "fas fa-home": Home,
  "fa-home": Home,
  "fas fa-home-heart": Heart,
  "fa-home-heart": Heart,
  "fas fa-bed": Bed,
  "fa-bed": Bed,
  "fas fa-moon": Moon,
  "fa-moon": Moon,
  "fas fa-users": Users,
  "fa-users": Users,
  "fas fa-baby": Baby,
  "fa-baby": Baby,
  "fas fa-car": Car,
  "fa-car": Car,
  "fas fa-dog": Dog,
  "fa-dog": Dog,
  "fas fa-wifi": Wifi,
  "fa-wifi": Wifi,
  "fas fa-music": Music,
  "fa-music": Music,
  "fas fa-coffee": Coffee,
  "fa-coffee": Coffee,
  "fas fa-utensils": Utensils,
  "fa-utensils": Utensils,
  "fas fa-fire": Flame,
  "fa-fire": Flame,
  "fas fa-info-circle": Info,
  "fa-info-circle": Info,
  "fas fa-exclamation-circle": AlertCircle,
  "fa-exclamation-circle": AlertCircle,
}

function getIcon(iconString: string) {
  // Limpiar el string del icono
  const cleanIcon = iconString.trim().toLowerCase()
  // Buscar el icono en el mapa
  const IconComponent = iconMap[cleanIcon] || Info
  return IconComponent
}

export function GuideHouseRulesSection({ rules }: GuideHouseRulesSectionProps) {
  // Si no hay normas, no mostrar la sección
  if (!rules || rules.length === 0) {
    return null
  }

  return (
    <section className="w-full py-16 md:py-24 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Normas de la Casa
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Para garantizar una estancia agradable para todos, te pedimos que respetes las siguientes normas:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {rules.map((rule) => {
            const IconComponent = getIcon(rule.icon)
            return (
              <div
                key={rule.id}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-black mb-3">
                  {rule.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {rule.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

