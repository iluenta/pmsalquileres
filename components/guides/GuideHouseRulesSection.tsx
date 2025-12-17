"use client"

import type { HouseRule } from "@/types/guides"
import { 
  Ban, 
  Volume2, 
  VolumeX,
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
  UtensilsCrossed,
  Flame,
  AlertCircle,
  Heart,
  // Hogar
  Bath,
  Armchair,
  DoorOpen,
  Square,
  Lightbulb,
  Monitor,
  // Viajes y Vacaciones
  Plane,
  Train,
  Ship,
  MapPin,
  Compass,
  Camera,
  Luggage,
  Sun,
  Umbrella,
  // Transporte
  Bike,
  Bus,
  Navigation,
  Route,
  // Comodidades
  Wind,
  Droplet,
  Snowflake,
  Shield,
  Key,
  Lock,
  // Actividades
  Waves,
  Mountain,
  TreePine,
  Gamepad,
  BookOpen,
  // Servicios
  ShoppingBag,
  Candy,
  Star,
  Sparkles,
  Zap,
  LucideIcon
} from "lucide-react"

interface GuideHouseRulesSectionProps {
  rules: HouseRule[]
}

// Mapeo completo de iconos de Font Awesome a Lucide React (basado en GuideApartmentSections)
const FA_TO_LUCIDE: Record<string, LucideIcon> = {
  "fas fa-home": Home,
  "fa-home": Home,
  "fas fa-utensils": UtensilsCrossed,
  "fa-utensils": UtensilsCrossed,
  "fas fa-bed": Bed,
  "fa-bed": Bed,
  "fas fa-bath": Bath,
  "fa-bath": Bath,
  "fas fa-couch": Armchair,
  "fa-couch": Armchair,
  "fas fa-door-open": DoorOpen,
  "fa-door-open": DoorOpen,
  "fas fa-window-maximize": Square,
  "fa-window-maximize": Square,
  "fas fa-lightbulb": Lightbulb,
  "fa-lightbulb": Lightbulb,
  "fas fa-tv": Monitor,
  "fa-tv": Monitor,
  "fas fa-wifi": Wifi,
  "fa-wifi": Wifi,
  "fas fa-plane": Plane,
  "fa-plane": Plane,
  "fas fa-car": Car,
  "fa-car": Car,
  "fas fa-train": Train,
  "fa-train": Train,
  "fas fa-ship": Ship,
  "fa-ship": Ship,
  "fas fa-map-marker-alt": MapPin,
  "fa-map-marker-alt": MapPin,
  "fas fa-compass": Compass,
  "fa-compass": Compass,
  "fas fa-camera": Camera,
  "fa-camera": Camera,
  "fas fa-suitcase": Luggage,
  "fa-suitcase": Luggage,
  "fas fa-sun": Sun,
  "fa-sun": Sun,
  "fas fa-umbrella": Umbrella,
  "fa-umbrella": Umbrella,
  "fas fa-bicycle": Bike,
  "fa-bicycle": Bike,
  "fas fa-bus": Bus,
  "fa-bus": Bus,
  "fas fa-map": Navigation,
  "fa-map": Navigation,
  "fas fa-route": Route,
  "fa-route": Route,
  "fas fa-wind": Wind,
  "fa-wind": Wind,
  "fas fa-tint": Droplet,
  "fa-tint": Droplet,
  "fas fa-fire": Flame,
  "fa-fire": Flame,
  "fas fa-snowflake": Snowflake,
  "fa-snowflake": Snowflake,
  "fas fa-shield-alt": Shield,
  "fa-shield-alt": Shield,
  "fas fa-key": Key,
  "fa-key": Key,
  "fas fa-lock": Lock,
  "fa-lock": Lock,
  "fas fa-water": Waves,
  "fa-water": Waves,
  "fas fa-mountain": Mountain,
  "fa-mountain": Mountain,
  "fas fa-tree": TreePine,
  "fa-tree": TreePine,
  "fas fa-gamepad": Gamepad,
  "fa-gamepad": Gamepad,
  "fas fa-music": Music,
  "fa-music": Music,
  "fas fa-book": BookOpen,
  "fa-book": BookOpen,
  "fas fa-shopping-bag": ShoppingBag,
  "fa-shopping-bag": ShoppingBag,
  "fas fa-coffee": Coffee,
  "fa-coffee": Coffee,
  "fas fa-candy-cane": Candy,
  "fa-candy-cane": Candy,
  "fas fa-star": Star,
  "fa-star": Star,
  "fas fa-heart": Heart,
  "fa-heart": Heart,
  "fas fa-sparkles": Sparkles,
  "fa-sparkles": Sparkles,
  "fas fa-bolt": Zap,
  "fa-bolt": Zap,
  // Iconos específicos para normas de la casa
  "fas fa-smoking-ban": Ban,
  "fa-smoking-ban": Ban,
  "fas fa-ban": Ban,
  "fa-ban": Ban,
  "fas fa-volume-mute": VolumeX,
  "fa-volume-mute": VolumeX,
  "fa-volume-mute-alt": VolumeX,
  "fas fa-volume-off": VolumeX,
  "fa-volume-off": VolumeX,
  "fas fa-volume-xmark": VolumeX,
  "fa-volume-xmark": VolumeX,
  "fas fa-home-heart": Heart,
  "fa-home-heart": Heart,
  "fas fa-moon": Moon,
  "fa-moon": Moon,
  "fas fa-users": Users,
  "fa-users": Users,
  "fas fa-baby": Baby,
  "fa-baby": Baby,
  "fas fa-dog": Dog,
  "fa-dog": Dog,
  "fas fa-info-circle": Info,
  "fa-info-circle": Info,
  "fas fa-exclamation-circle": AlertCircle,
  "fa-exclamation-circle": AlertCircle,
}

function getIcon(iconString: string): LucideIcon {
  if (!iconString) return Info
  
  // Limpiar el string del icono
  const cleanIcon = iconString.trim()
  
  // Buscar primero con el formato exacto
  if (FA_TO_LUCIDE[cleanIcon]) {
    return FA_TO_LUCIDE[cleanIcon]
  }
  
  // Buscar en minúsculas
  const lowerIcon = cleanIcon.toLowerCase()
  if (FA_TO_LUCIDE[lowerIcon]) {
    return FA_TO_LUCIDE[lowerIcon]
  }
  
  // Fallback a Info si no se encuentra
  return Info
}

export function GuideHouseRulesSection({ rules }: GuideHouseRulesSectionProps) {
  // Si no hay normas, no mostrar la sección
  if (!rules || rules.length === 0) {
    return null
  }

  // Debug: ver qué iconos se están recibiendo
  console.log('GuideHouseRulesSection - Rules with icons:', rules.map(r => ({ title: r.title, icon: r.icon })))

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

