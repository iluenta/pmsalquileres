import { Card, CardContent } from "@/components/ui/card"
import { ApartmentSection, CompleteGuideDataResponse } from "@/types/guides"
import { GuidePracticalInfo } from "./GuidePracticalInfo"
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
  LucideIcon
} from "lucide-react"

// Mapeo de códigos Font Awesome a componentes Lucide
const FA_TO_LUCIDE: Record<string, LucideIcon> = {
  "fas fa-home": Home,
  "fas fa-utensils": UtensilsCrossed,
  "fas fa-bed": Bed,
  "fas fa-bath": Bath,
  "fas fa-couch": Armchair,
  "fas fa-door-open": DoorOpen,
  "fas fa-window-maximize": Square,
  "fas fa-lightbulb": Lightbulb,
  "fas fa-tv": Monitor,
  "fas fa-wifi": Wifi,
  "fas fa-plane": Plane,
  "fas fa-car": Car,
  "fas fa-train": Train,
  "fas fa-ship": Ship,
  "fas fa-map-marker-alt": MapPin,
  "fas fa-compass": Compass,
  "fas fa-camera": Camera,
  "fas fa-suitcase": Luggage,
  "fas fa-sun": Sun,
  "fas fa-umbrella": Umbrella,
  "fas fa-bicycle": Bike,
  "fas fa-bus": Bus,
  "fas fa-map": Navigation,
  "fas fa-route": Route,
  "fas fa-wind": Wind,
  "fas fa-tint": Droplet,
  "fas fa-fire": Flame,
  "fas fa-snowflake": Snowflake,
  "fas fa-shield-alt": Shield,
  "fas fa-key": Key,
  "fas fa-lock": Lock,
  "fas fa-water": Waves,
  "fas fa-mountain": Mountain,
  "fas fa-tree": TreePine,
  "fas fa-gamepad": Gamepad,
  "fas fa-music": Music,
  "fas fa-book": BookOpen,
  "fas fa-shopping-bag": ShoppingBag,
  "fas fa-coffee": Coffee,
  "fas fa-candy-cane": Candy,
  "fas fa-star": Star,
  "fas fa-heart": Heart,
  "fas fa-sparkles": Sparkles,
  "fas fa-bolt": Zap,
}

// Función para obtener el icono Lucide desde el código Font Awesome guardado
function getIconFromCode(iconCode: string | undefined, sectionType: string): LucideIcon {
  // Si hay un código de icono guardado, usarlo
  if (iconCode && FA_TO_LUCIDE[iconCode]) {
    return FA_TO_LUCIDE[iconCode]
  }
  
  // Fallback por tipo de sección
  const typeDefaults: Record<string, LucideIcon> = {
    cocina: UtensilsCrossed,
    bano: Bath,
    salon: Armchair,
    dormitorio: Bed,
    terraza: Sun,
    entrada: DoorOpen,
    balcon: Wind,
    garaje: Car,
  }
  
  return typeDefaults[sectionType] || Home
}

// Mapeo de colores por tipo de sección (solo para estilos)
const SECTION_TYPE_COLORS: Record<string, string> = {
  cocina: "text-orange-500",
  bano: "text-blue-500",
  salon: "text-green-500",
  dormitorio: "text-purple-500",
  terraza: "text-yellow-500",
  entrada: "text-gray-500",
  balcon: "text-cyan-500",
  garaje: "text-indigo-500",
}

// Función para obtener la primera palabra del título para el badge
function getFirstWord(title: string): string {
  return title.split(" ")[0] || title
}

interface GuideApartmentSectionsProps {
  sections: ApartmentSection[]
  data?: CompleteGuideDataResponse
}

export function GuideApartmentSections({ sections, data }: GuideApartmentSectionsProps) {
  console.log('[GuideApartmentSections] Sections received:', sections)
  console.log('[GuideApartmentSections] Data received:', data)
  console.log('[GuideApartmentSections] Sections length:', sections?.length)
  
  if (!sections || sections.length === 0) {
    console.log('[GuideApartmentSections] No sections to display')
    return null
  }

  // Usar datos de la guía o valores por defecto
  const propertyName = data?.property?.name || "Propiedad"
  const propertyAddress = data?.property?.address || "Dirección no disponible"
  const welcomeMessage = data?.guide?.welcome_message || "Un apartamento completamente equipado con todo lo que necesitas para sentirte como en casa"

  return (
    <section id="apartamento" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Tu Hogar en {propertyName}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            {welcomeMessage}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
          {sections.map((section) => {
            // Obtener el icono desde el código guardado en la BD, con fallback por tipo
            const IconComponent = getIconFromCode(section.icon, section.section_type)
            const iconColor = SECTION_TYPE_COLORS[section.section_type] || "text-gray-500"
            const badgeText = getFirstWord(section.title)
            
            return (
              <div
                key={section.id}
                className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border"
              >
                {/* Imagen */}
                <div className="relative aspect-[3/2] overflow-hidden">
                  {section.image_url ? (
                    <img
                      src={section.image_url}
                      alt={section.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <IconComponent className={`h-16 w-16 ${iconColor} opacity-50`} />
                    </div>
                  )}
                  
                  {/* Badge en la esquina superior derecha con la primera palabra del título */}
                  <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-4 py-2 rounded-full font-semibold text-sm">
                    {badgeText}
                  </div>
                </div>
                
                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-card-foreground mb-3 flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-primary" />
                    {section.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {section.description}
                  </p>
                  
                  {/* Amenities */}
                  {section.amenities && section.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {section.amenities.map((amenity, idx) => (
                        <span 
                          key={idx} 
                          className="inline-flex items-center text-sm bg-muted/50 px-3 py-1.5 rounded-md text-muted-foreground font-normal"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Información práctica del apartamento */}
        <GuidePracticalInfo data={data} />
      </div>
    </section>
  )
}
