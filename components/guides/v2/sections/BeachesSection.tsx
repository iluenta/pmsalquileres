import type { Beach } from "@/types/guides"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Umbrella, MapPin, Star } from "lucide-react"

interface BeachesSectionProps {
    beaches: Beach[]
}

export function BeachesSection({ beaches }: BeachesSectionProps) {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 bg-cyan-100 rounded-full mb-4">
                    <Umbrella className="h-8 w-8 text-cyan-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Playas Cercanas</h2>
                <p className="text-gray-600 mt-2">Disfruta del sol y el mar en las mejores playas de la zona</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {beaches.map((beach) => (
                    <Card key={beach.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col h-full">
                        <div className="relative h-48 bg-gray-200">
                            {beach.image_url ? (
                                <img src={beach.image_url} alt={beach.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-cyan-50">
                                    <Umbrella className="h-16 w-16 text-cyan-200" />
                                </div>
                            )}
                            {beach.badge && (
                                <div className="absolute top-3 right-3">
                                    <Badge className="bg-cyan-500 hover:bg-cyan-600">{beach.badge}</Badge>
                                </div>
                            )}
                        </div>

                        <CardContent className="p-5 flex flex-col flex-grow">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-gray-900">{beach.name}</h3>
                                {beach.rating && (
                                    <div className="flex items-center text-amber-500 text-sm font-semibold">
                                        <Star className="h-4 w-4 fill-current mr-1" />
                                        {beach.rating}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center text-sm text-gray-500 mb-3">
                                <MapPin className="h-4 w-4 mr-1" />
                                {beach.distance ? `${beach.distance} km` : 'Cerca'}
                            </div>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                                {beach.description}
                            </p>

                            {beach.amenities && beach.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-auto">
                                    {beach.amenities.slice(0, 3).map(am => (
                                        <span key={am} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                            {am}
                                        </span>
                                    ))}
                                    {beach.amenities.length > 3 && (
                                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-500">
                                            +{beach.amenities.length - 3}
                                        </span>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
