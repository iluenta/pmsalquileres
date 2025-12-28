"use client"

import { useState } from "react"
import type { Shopping } from "@/types/guides"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingBag, MapPin, Star, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"

interface ShoppingSectionProps {
    shopping: Shopping[]
}

function ShoppingCard({ place }: { place: Shopping }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const description = place.description || ""
    const shouldShowToggle = description.length > 150 // Mostrar toggle si el texto es más largo que ~3 líneas

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col h-full">
            <div className="relative h-48 bg-gray-200">
                {place.image_url ? (
                    <img src={place.image_url} alt={place.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50">
                        <ShoppingBag className="h-16 w-16 text-blue-200" />
                    </div>
                )}
                {place.badge && (
                    <div className="absolute top-3 left-3">
                        <Badge className="bg-blue-600 hover:bg-blue-700">
                            {place.badge}
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
                            {place.rating.toFixed(1)}
                        </div>
                    )}
                </div>

                {place.shopping_type && (
                    <div className="flex items-center mb-3">
                        <Badge variant="outline" className="text-xs">
                            {place.shopping_type}
                        </Badge>
                    </div>
                )}

                <div className="flex items-center justify-end text-sm text-gray-500 mb-3">
                    {place.price_range && (
                        <div className="flex items-center text-green-600 font-medium">
                            <span className="text-xs bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                {place.price_range}
                            </span>
                        </div>
                    )}
                </div>

                {place.address && (
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 text-xs mb-2 flex items-start hover:text-blue-600 transition-colors"
                    >
                        <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{place.address}</span>
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

                {place.url && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full"
                        >
                            <a
                                href={place.url}
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

export function ShoppingSection({ shopping }: ShoppingSectionProps) {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
                    <ShoppingBag className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Compras</h2>
                <p className="text-gray-600 mt-2">Supermercados y centros comerciales cercanos</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shopping.map((place) => (
                    <ShoppingCard key={place.id} place={place} />
                ))}
            </div>
        </div>
    )
}

