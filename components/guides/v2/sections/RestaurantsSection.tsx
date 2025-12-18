import type { Restaurant } from "@/types/guides"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Utensils, MapPin, Star, Euro } from "lucide-react"

interface RestaurantsSectionProps {
    restaurants: Restaurant[]
}

export function RestaurantsSection({ restaurants }: RestaurantsSectionProps) {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-full mb-4">
                    <Utensils className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Dónde Comer</h2>
                <p className="text-gray-600 mt-2">Nuestra selección de los mejores restaurantes</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((place) => (
                    <Card key={place.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col h-full">
                        <div className="relative h-48 bg-gray-200">
                            {place.image_url ? (
                                <img src={place.image_url} alt={place.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-red-50">
                                    <Utensils className="h-16 w-16 text-red-200" />
                                </div>
                            )}
                            {place.cuisine_type && (
                                <div className="absolute top-3 left-3">
                                    <Badge variant="secondary" className="bg-white/90 text-gray-800 shadow-sm">
                                        {place.cuisine_type}
                                    </Badge>
                                </div>
                            )}
                        </div>

                        <CardContent className="p-5 flex flex-col flex-grow">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-gray-900">{place.name}</h3>
                                {place.rating && (
                                    <div className="flex items-center text-amber-500 text-sm font-semibold">
                                        <Star className="h-4 w-4 fill-current mr-1" />
                                        {place.rating}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {place.distance ? `${place.distance} km` : 'Cerca'}
                                </div>
                                {place.price_range && (
                                    <div className="flex items-center text-green-600 font-medium">
                                        <span className="text-xs bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                            {place.price_range}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <p className="text-gray-600 text-sm line-clamp-3">
                                {place.description}
                            </p>

                            {place.badge && (
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                    <span className="text-xs font-medium text-red-600 flex items-center gap-1">
                                        <Star className="h-3 w-3" /> {place.badge}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
