import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Beach } from "@/types/guides"

interface GuideBeachesSectionProps {
  beaches: Beach[]
}

export function GuideBeachesSection({ beaches }: GuideBeachesSectionProps) {
  if (!beaches || beaches.length === 0) {
    return null
  }

  return (
    <section id="playas" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Playas de Vera
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            Descubre las mejores playas de la zona para disfrutar del sol y el mar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {beaches.map((beach) => (
            <Card key={beach.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              {/* Imagen de la playa */}
              <div className="relative h-48 md:h-64 overflow-hidden">
                {beach.image_url ? (
                  <img
                    src={beach.image_url}
                    alt={beach.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <i className="fas fa-umbrella-beach text-6xl text-white opacity-50"></i>
                  </div>
                )}
                
                {/* Badge de recomendación */}
                {beach.badge && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-secondary text-secondary-foreground font-semibold px-3 py-1 rounded-full text-sm">
                      {beach.badge}
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-card-foreground mb-3">{beach.name}</h3>
                
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {beach.description}
                </p>
                
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <i className="fas fa-walking"></i>
                    {beach.distance ? `${beach.distance} min caminando` : "Distancia no especificada"}
                  </span>
                  {beach.rating && beach.rating > 0 && (
                    <span className="flex items-center gap-1 text-secondary">
                      <i className="fas fa-star"></i>
                      {beach.rating}/5
                    </span>
                  )}
                </div>
                
                {/* Amenities de la playa */}
                {beach.amenities && beach.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {beach.amenities.map((amenity, idx) => (
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
          ))}
        </div>
      </div>
    </section>
  )
}
