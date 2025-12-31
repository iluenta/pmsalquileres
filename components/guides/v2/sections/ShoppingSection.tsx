"use client"

import { useState } from "react"
import type { Shopping, GuideSection } from "@/types/guides"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingBag, MapPin, Star, ExternalLink, ChevronDown, ChevronUp, Phone, Clock } from "lucide-react"
import { DistanceDisplay } from "./DistanceDisplay"
import { getIconByName } from "@/lib/utils/icon-registry"

interface ShoppingSectionProps {
    shopping: Shopping[]
    introSection?: GuideSection
}

function ShoppingCard({ place }: { place: Shopping }) {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
    const [isScheduleExpanded, setIsScheduleExpanded] = useState(false)
    const description = place.description || ""
    const shouldShowToggle = description.length > 100

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
                {place.price_range && (
                    <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-white/90 text-green-700 border-green-100 backdrop-blur-sm">
                            {place.price_range}
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

                <DistanceDisplay walkingTime={place.walking_time} drivingTime={place.driving_time} />

                {place.address && (
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 text-xs mt-2 mb-2 flex items-start hover:text-blue-600 transition-colors"
                    >
                        <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{place.address}</span>
                    </a>
                )}

                {place.phone && (
                    <a
                        href={`tel:${place.phone.replace(/\s+/g, '')}`}
                        className="text-gray-500 text-xs mb-2 flex items-center hover:text-blue-600 transition-colors"
                    >
                        <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>{place.phone}</span>
                    </a>
                )}

                {place.opening_hours?.weekday_text && (
                    <div className="text-gray-500 text-xs mb-3 flex items-start gap-1">
                        <Clock className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsScheduleExpanded(!isScheduleExpanded);
                                }}
                                className="hover:text-blue-600 transition-colors text-left flex items-center gap-1"
                            >
                                <span>Ver horarios</span>
                                {isScheduleExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                            {isScheduleExpanded && (
                                <div className="mt-1 space-y-0.5 border-l border-gray-100 pl-2 py-1">
                                    {place.opening_hours.weekday_text.map((text: string, i: number) => (
                                        <p key={i} className="text-[10px] whitespace-nowrap">{text}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {description && (
                    <div className="mb-4 flex-grow">
                        <p className={`text-gray-600 text-sm ${isDescriptionExpanded ? '' : 'line-clamp-3'}`}>
                            {description}
                        </p>
                        {shouldShowToggle && (
                            <button
                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                            >
                                {isDescriptionExpanded ? (
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

export function ShoppingSection({ shopping, introSection }: ShoppingSectionProps) {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
                {(() => {
                    const Icon = getIconByName(introSection?.icon, ShoppingBag)
                    return (
                        <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
                            <Icon className="h-8 w-8 text-blue-600" />
                        </div>
                    )
                })()}
                <h2 className="text-3xl font-bold text-gray-900">{introSection?.title || "Compras"}</h2>
                <p className="text-gray-600 mt-2">
                    {introSection?.content || "Supermercados y centros comerciales cercanos"}
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shopping.map((place) => (
                    <ShoppingCard key={place.id} place={place} />
                ))}
            </div>
        </div>
    )
}

