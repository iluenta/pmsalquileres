import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ApartmentSection } from "@/types/guides"

// Mapeo de tipos de sección a información básica
const SECTION_TYPE_INFO = {
  cocina: {
    label: "Cocina",
    icon: "fas fa-utensils",
    color: "text-orange-500"
  },
  bano: {
    label: "Baño", 
    icon: "fas fa-shower",
    color: "text-blue-500"
  },
  salon: {
    label: "Salón",
    icon: "fas fa-couch", 
    color: "text-green-500"
  },
  dormitorio: {
    label: "Dormitorio",
    icon: "fas fa-bed",
    color: "text-purple-500"
  },
  terraza: {
    label: "Terraza",
    icon: "fas fa-sun",
    color: "text-yellow-500"
  },
  entrada: {
    label: "Entrada",
    icon: "fas fa-door-open",
    color: "text-gray-500"
  },
  balcon: {
    label: "Balcón",
    icon: "fas fa-wind",
    color: "text-cyan-500"
  },
  garaje: {
    label: "Garaje",
    icon: "fas fa-car",
    color: "text-indigo-500"
  }
} as const

interface GuideApartmentSectionsProps {
  sections: ApartmentSection[]
}

export function GuideApartmentSections({ sections }: GuideApartmentSectionsProps) {
  if (!sections || sections.length === 0) {
    return null
  }

  return (
    <section id="apartamento" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Tu Hogar en Vera
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            Un apartamento completamente equipado con todo lo que necesitas para sentirte como en casa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
          {sections.map((section) => {
            const sectionInfo = SECTION_TYPE_INFO[section.section_type as keyof typeof SECTION_TYPE_INFO] || {
              label: section.section_type,
              icon: section.icon || "fas fa-home",
              color: "text-gray-500"
            }
            
            return (
              <Card key={section.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Imagen de fondo */}
                <div className="relative h-48 md:h-64 overflow-hidden">
                  {section.image_url ? (
                    <img
                      src={section.image_url}
                      alt={section.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <i className={`${sectionInfo.icon} text-6xl ${sectionInfo.color} opacity-50`}></i>
                    </div>
                  )}
                  
                  {/* Badge en la esquina superior derecha */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-secondary text-secondary-foreground font-semibold px-3 py-1 rounded-full text-sm">
                      {sectionInfo.label}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <i className={`${section.icon || sectionInfo.icon} text-2xl ${sectionInfo.color}`}></i>
                    <h3 className="text-xl font-bold text-card-foreground">{section.title}</h3>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {section.description}
                  </p>
                  
                  {/* Mostrar detalles si existen */}
                  {section.details && (
                    <div className="text-sm text-muted-foreground mb-4">
                      <p className="font-medium mb-1">Detalles:</p>
                      <p>{section.details}</p>
                    </div>
                  )}
                  
                  {/* Mostrar amenities si existen */}
                  {section.amenities && section.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {section.amenities.map((amenity, idx) => (
                        <span 
                          key={idx} 
                          className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Información adicional del apartamento */}
        <div className="bg-muted rounded-2xl p-6 md:p-8 border-l-4 border-primary">
          <h3 className="text-xl font-bold text-foreground mb-3">Información del Apartamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground mb-1">Dirección</p>
              <p>Calle Ejemplo, 123, 04620 Vera, Almería</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Check-in / Check-out</p>
              <p>Entrada: 16:00h | Salida: 11:00h</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Código de acceso</p>
              <p>07349</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">WiFi</p>
              <p>Ver@Tesper@1234</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
