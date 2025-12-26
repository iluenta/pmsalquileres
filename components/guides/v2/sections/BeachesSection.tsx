"use client"

import { useState } from "react"
import type { Beach } from "@/types/guides"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Umbrella, MapPin, Star, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"

interface BeachesSectionProps {
    beaches: Beach[]
}

function BeachCard({ beach }: { beach: Beach }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const description = beach.description || ""
    const shouldShowToggle = description.length > 150

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col h-full">
            <div className="relative h-48 bg-gray-200">
                {beach.image_url ? (
                    <img src={beach.image_url} alt={beach.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-cyan-50">
                        <Umbrella className="h-16 w-16 text-cyan-200" />
                    </div>
                )}
                {beach.badge && (
                    <div className="absolute top-3 left-3">
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
                            {beach.rating.toFixed(1)}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end text-sm text-gray-500 mb-3">
                    {beach.price_range && (
                        <div className="flex items-center text-green-600 font-medium">
                            <span className="text-xs bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                {beach.price_range}
                            </span>
                        </div>
                    )}
                </div>

                {beach.address && (
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(beach.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 text-xs mb-2 flex items-start hover:text-blue-600 transition-colors"
                    >
                        <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{beach.address}</span>
                    </a>
                )}

                {description && (
                    <div className="mb-4 flex-grow">
                        <p className={`text-gray-600 text-sm ${isExpanded ? '' : 'line-clamp-3'}`}>
                            {description}
                        </p>
                        {shouldShowToggle && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                            >
                                {isExpanded ? (
                                    <>
                                        <ChevronUp className="h-3 w-3" />
                                        Ver menos
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-3 w-3" />
                                        Leer más
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}

                {beach.amenities && beach.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
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

                {beach.url && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full"
                        >
                            <a
                                href={beach.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Visitar Web
                            </a>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
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
                    <BeachCard key={beach.id} beach={beach} />
                ))}
            </div>
        </div>
    )
}
