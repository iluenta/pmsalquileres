import type { Activity } from "@/types/guides"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mountain, Clock, MapPin } from "lucide-react"

interface ActivitiesSectionProps {
    activities: Activity[]
}

export function ActivitiesSection({ activities }: ActivitiesSectionProps) {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4">
                    <Mountain className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Actividades</h2>
                <p className="text-gray-600 mt-2">Experiencias inolvidables cerca de ti</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.map((activity) => (
                    <Card key={activity.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col h-full">
                        <div className="relative h-48 bg-gray-200">
                            {activity.image_url ? (
                                <img src={activity.image_url} alt={activity.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-green-50">
                                    <Mountain className="h-16 w-16 text-green-200" />
                                </div>
                            )}
                            {activity.activity_type && (
                                <div className="absolute top-3 left-3">
                                    <Badge className="bg-green-600 hover:bg-green-700">
                                        {activity.activity_type}
                                    </Badge>
                                </div>
                            )}
                        </div>

                        <CardContent className="p-5 flex flex-col flex-grow">
                            <h3 className="font-bold text-lg text-gray-900 mb-2">{activity.name}</h3>

                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                {activity.duration && (
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {activity.duration}
                                    </div>
                                )}
                                <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {activity.distance ? `${activity.distance} km` : 'Cerca'}
                                </div>
                            </div>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                                {activity.description}
                            </p>

                            {activity.price_info && (
                                <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-xs font-semibold text-gray-500 uppercase">Precio aproximao</span>
                                    <span className="font-semibold text-green-700">{activity.price_info}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
