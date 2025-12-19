import { Card, CardContent } from "@/components/ui/card"
import { ApartmentSection, CompleteGuideDataResponse } from "@/types/guides"
import { GuidePracticalInfo } from "./GuidePracticalInfo"
import { getIconByName } from "@/lib/utils/icon-registry"
import {
  UtensilsCrossed,
  Bath,
  Armchair,
  Bed,
  Sun,
  DoorOpen,
  Wind,
  Car,
  Home,
  LucideIcon
} from "lucide-react"

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

// Fallback por tipo de sección
const TYPE_DEFAULTS: Record<string, LucideIcon> = {
  cocina: UtensilsCrossed,
  bano: Bath,
  salon: Armchair,
  dormitorio: Bed,
  terraza: Sun,
  entrada: DoorOpen,
  balcon: Wind,
  garaje: Car,
}

// Función para obtener el icono Lucide desde el código Font Awesome guardado
function getIconFromCode(iconCode: string | undefined, sectionType: string): LucideIcon {
  // Si hay un código de icono guardado, intentar obtenerlo del registro
  if (iconCode) {
    const IconComponent = getIconByName(iconCode);
    if (IconComponent) {
      return IconComponent;
    }
  }

  // Fallback por tipo de sección
  return TYPE_DEFAULTS[sectionType] || Home;
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
