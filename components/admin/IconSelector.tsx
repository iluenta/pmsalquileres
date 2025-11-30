"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  // Hogar
  Home,
  UtensilsCrossed,
  Bed,
  Bath,
  Armchair,
  DoorOpen,
  Square,
  Lightbulb,
  Monitor,
  Wifi,
  // Viajes y Vacaciones
  Plane,
  Car,
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
  Flame,
  Snowflake,
  Shield,
  Key,
  Lock,
  // Actividades
  Waves,
  Mountain,
  TreePine,
  Gamepad,
  Music,
  BookOpen,
  // Servicios
  ShoppingBag,
  Coffee,
  Utensils,
  Candy,
  // Otros
  Star,
  Heart,
  Sparkles,
  Zap,
} from "lucide-react"

// Categorías de iconos organizados por tema
const iconCategories = {
  Hogar: [
    { name: "Home", icon: Home, code: "Home" },
    { name: "Cocina", icon: UtensilsCrossed, code: "UtensilsCrossed" },
    { name: "Dormitorio", icon: Bed, code: "Bed" },
    { name: "Baño", icon: Bath, code: "Bath" },
    { name: "Salón", icon: Armchair, code: "Armchair" },
    { name: "Puerta", icon: DoorOpen, code: "DoorOpen" },
    { name: "Ventana", icon: Square, code: "Square" },
    { name: "Lámpara", icon: Lightbulb, code: "Lightbulb" },
    { name: "TV", icon: Monitor, code: "Monitor" },
    { name: "WiFi", icon: Wifi, code: "Wifi" },
  ],
  "Viajes y Vacaciones": [
    { name: "Avión", icon: Plane, code: "Plane" },
    { name: "Coche", icon: Car, code: "Car" },
    { name: "Tren", icon: Train, code: "Train" },
    { name: "Barco", icon: Ship, code: "Ship" },
    { name: "Ubicación", icon: MapPin, code: "MapPin" },
    { name: "Brújula", icon: Compass, code: "Compass" },
    { name: "Cámara", icon: Camera, code: "Camera" },
    { name: "Maleta", icon: Luggage, code: "Luggage" },
    { name: "Sol", icon: Sun, code: "Sun" },
    { name: "Paraguas", icon: Umbrella, code: "Umbrella" },
  ],
  Transporte: [
    { name: "Bicicleta", icon: Bike, code: "Bike" },
    { name: "Autobús", icon: Bus, code: "Bus" },
    { name: "Navegación", icon: Navigation, code: "Navigation" },
    { name: "Ruta", icon: Route, code: "Route" },
  ],
  Comodidades: [
    { name: "Ventilador", icon: Wind, code: "Wind" },
    { name: "Agua", icon: Droplet, code: "Droplet" },
    { name: "Calefacción", icon: Flame, code: "Flame" },
    { name: "Aire Acondicionado", icon: Snowflake, code: "Snowflake" },
    { name: "Seguridad", icon: Shield, code: "Shield" },
    { name: "Llave", icon: Key, code: "Key" },
    { name: "Candado", icon: Lock, code: "Lock" },
  ],
  Actividades: [
    { name: "Playa", icon: Waves, code: "Waves" },
    { name: "Montaña", icon: Mountain, code: "Mountain" },
    { name: "Naturaleza", icon: TreePine, code: "TreePine" },
    { name: "Juegos", icon: Gamepad, code: "Gamepad" },
    { name: "Música", icon: Music, code: "Music" },
    { name: "Libro", icon: BookOpen, code: "BookOpen" },
  ],
  Servicios: [
    { name: "Compras", icon: ShoppingBag, code: "ShoppingBag" },
    { name: "Café", icon: Coffee, code: "Coffee" },
    { name: "Restaurante", icon: Utensils, code: "Utensils" },
    { name: "Dulces", icon: Candy, code: "Candy" },
  ],
  Otros: [
    { name: "Estrella", icon: Star, code: "Star" },
    { name: "Corazón", icon: Heart, code: "Heart" },
    { name: "Brillo", icon: Sparkles, code: "Sparkles" },
    { name: "Rayo", icon: Zap, code: "Zap" },
  ],
}

// Función para convertir código de icono a formato Font Awesome compatible
function iconCodeToFontAwesome(code: string): string {
  const mapping: Record<string, string> = {
    Home: "fas fa-home",
    UtensilsCrossed: "fas fa-utensils",
    Bed: "fas fa-bed",
    Bath: "fas fa-bath",
    Armchair: "fas fa-couch",
    DoorOpen: "fas fa-door-open",
    Square: "fas fa-window-maximize",
    Lightbulb: "fas fa-lightbulb",
    Monitor: "fas fa-tv",
    Wifi: "fas fa-wifi",
    Plane: "fas fa-plane",
    Car: "fas fa-car",
    Train: "fas fa-train",
    Ship: "fas fa-ship",
    MapPin: "fas fa-map-marker-alt",
    Compass: "fas fa-compass",
    Camera: "fas fa-camera",
    Luggage: "fas fa-suitcase",
    Sun: "fas fa-sun",
    Umbrella: "fas fa-umbrella",
    Bike: "fas fa-bicycle",
    Bus: "fas fa-bus",
    Navigation: "fas fa-map",
    Route: "fas fa-route",
    Wind: "fas fa-wind",
    Droplet: "fas fa-tint",
    Flame: "fas fa-fire",
    Snowflake: "fas fa-snowflake",
    Shield: "fas fa-shield-alt",
    Key: "fas fa-key",
    Lock: "fas fa-lock",
    Waves: "fas fa-water",
    Mountain: "fas fa-mountain",
    TreePine: "fas fa-tree",
    Gamepad: "fas fa-gamepad",
    Music: "fas fa-music",
    BookOpen: "fas fa-book",
    ShoppingBag: "fas fa-shopping-bag",
    Coffee: "fas fa-coffee",
    Utensils: "fas fa-utensils",
    Candy: "fas fa-candy-cane",
    Star: "fas fa-star",
    Heart: "fas fa-heart",
    Sparkles: "fas fa-sparkles",
    Zap: "fas fa-bolt",
  }
  return mapping[code] || "fas fa-home"
}

interface IconSelectorProps {
  value: string // Código Font Awesome actual (ej: "fas fa-home")
  onChange: (iconCode: string) => void
  disabled?: boolean
}

export function IconSelector({ value, onChange, disabled }: IconSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Hogar")

  // Encontrar el icono seleccionado actual
  const findSelectedIcon = () => {
    for (const category of Object.values(iconCategories)) {
      for (const iconItem of category) {
        const faCode = iconCodeToFontAwesome(iconItem.code)
        if (faCode === value) {
          return iconItem.code
        }
      }
    }
    return null
  }

  const selectedIconCode = findSelectedIcon()

  const handleIconClick = (iconCode: string) => {
    const faCode = iconCodeToFontAwesome(iconCode)
    onChange(faCode)
  }

  return (
    <div className="space-y-3">
      <Label>Icono</Label>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="flex flex-wrap w-full gap-1 h-auto p-1">
          {Object.keys(iconCategories).map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs flex-1 min-w-[120px] whitespace-normal break-words py-2">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(iconCategories).map(([category, icons]) => (
          <TabsContent key={category} value={category} className="space-y-2">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-3 border rounded-lg bg-muted/30 max-h-64 overflow-y-auto">
              {icons.map((iconItem) => {
                const IconComponent = iconItem.icon
                const isSelected = selectedIconCode === iconItem.code
                return (
                  <Button
                    key={iconItem.code}
                    type="button"
                    variant={isSelected ? "default" : "ghost"}
                    size="sm"
                    disabled={disabled}
                    onClick={() => handleIconClick(iconItem.code)}
                    className={cn(
                      "h-auto min-h-[70px] flex flex-col items-center justify-center gap-1.5 p-2 transition-colors",
                      isSelected && "ring-2 ring-primary ring-offset-2"
                    )}
                    title={iconItem.name}
                  >
                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                    <span className="text-xs text-center leading-tight px-1 line-clamp-2">{iconItem.name}</span>
                  </Button>
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

