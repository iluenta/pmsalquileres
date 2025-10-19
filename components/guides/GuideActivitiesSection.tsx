import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity } from "@/types/guides"

interface GuideActivitiesSectionProps {
  activities: Activity[]
}

export function GuideActivitiesSection({ activities }: GuideActivitiesSectionProps) {
  if (!activities || activities.length === 0) {
    return null
  }

  return (
    <section id="actividades" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Actividades y Atracciones
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            Descubre las mejores experiencias y lugares para visitar en la zona
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {activities.map((activity) => (
            <Card key={activity.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              {/* Imagen de la actividad */}
              <div className="relative h-48 md:h-64 overflow-hidden">
                {activity.image_url ? (
                  <img
                    src={activity.image_url}
                    alt={activity.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                    <i className="fas fa-hiking text-6xl text-white opacity-50"></i>
                  </div>
                )}
                
                {/* Badge de tipo de actividad */}
                {activity.badge && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-secondary text-secondary-foreground font-semibold px-3 py-1 rounded-full text-sm">
                      {activity.badge}
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-card-foreground mb-3">{activity.name}</h3>
                
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {activity.description}
                </p>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  {activity.activity_type && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-tag w-4"></i>
                      <span>{activity.activity_type}</span>
                    </div>
                  )}
                  
                  {activity.duration && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-clock w-4"></i>
                      <span>{activity.duration}</span>
                    </div>
                  )}
                  
                  {activity.distance && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-map-marker-alt w-4"></i>
                      <span>{activity.distance} km</span>
                    </div>
                  )}
                  
                  {activity.price_info && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-euro-sign w-4"></i>
                      <span>{activity.price_info}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
