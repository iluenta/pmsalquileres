import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Restaurant } from "@/types/guides"

interface GuideRestaurantsSectionProps {
  restaurants: Restaurant[]
}

export function GuideRestaurantsSection({ restaurants }: GuideRestaurantsSectionProps) {
  if (!restaurants || restaurants.length === 0) {
    return null
  }

  return (
    <section id="restaurantes" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Restaurantes Recomendados
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            Los mejores lugares para disfrutar de la gastronomía local
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              {/* Imagen del restaurante */}
              <div className="relative h-48 md:h-64 overflow-hidden">
                {restaurant.image_url ? (
                  <img
                    src={restaurant.image_url}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                    <i className="fas fa-utensils text-6xl text-white opacity-50"></i>
                  </div>
                )}
                
                {/* Badge de tipo de cocina */}
                {restaurant.badge && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-secondary text-secondary-foreground font-semibold px-3 py-1 rounded-full text-sm">
                      {restaurant.badge}
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-card-foreground mb-3">{restaurant.name}</h3>
                
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {restaurant.description}
                </p>
                
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <i className="fas fa-car"></i>
                    {restaurant.distance ? `${restaurant.distance} min en coche` : "Distancia no especificada"}
                  </span>
                  {restaurant.rating && restaurant.rating > 0 && (
                    <span className="flex items-center gap-1 text-secondary">
                      <i className="fas fa-star"></i>
                      {restaurant.rating}/5
                      {restaurant.review_count && ` (${restaurant.review_count})`}
                    </span>
                  )}
                </div>
                
                {/* Tipo de cocina */}
                {restaurant.cuisine_type && (
                  <div className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium">Cocina:</span> {restaurant.cuisine_type}
                  </div>
                )}
                
                {/* Rango de precios */}
                {restaurant.price_range && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Precio:</span> {restaurant.price_range}
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
