"use client"

import { useState } from "react"
import type { Beach, GuideSection } from "@/types/guides"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Umbrella, MapPin, Star, ExternalLink, ChevronDown, ChevronUp, Phone, Clock } from "lucide-react"
import { DistanceDisplay } from "./DistanceDisplay"
import { getIconByName } from "@/lib/utils/icon-registry"

interface BeachesSectionProps {
    beaches: Beach[]
    introSection?: GuideSection
}

function BeachCard({ beach }: { beach: Beach }) {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
    const [isScheduleExpanded, setIsScheduleExpanded] = useState(false)
    const description = beach.description || ""
    const shouldShowToggle = description.length > 100

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
                {beach.price_range && (
                    <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-white/90 text-green-700 border-green-100 backdrop-blur-sm">
                            {beach.price_range}
                        </Badge>
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

                <DistanceDisplay walkingTime={beach.walking_time} drivingTime={beach.driving_time} />

                {beach.address && (
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(beach.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 text-xs mt-2 mb-2 flex items-start hover:text-blue-600 transition-colors"
                    >
                        <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{beach.address}</span>
                    </a>
                )}

                {beach.phone && (
                    <a
                        href={`tel:${beach.phone.replace(/\s+/g, '')}`}
                        className="text-gray-500 text-xs mb-2 flex items-center hover:text-blue-600 transition-colors"
                    >
                        <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>{beach.phone}</span>
                    </a>
                )}

                {beach.opening_hours?.weekday_text && (
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
                                    {beach.opening_hours.weekday_text.map((text: string, i: number) => (
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

export function BeachesSection({ beaches, introSection }: BeachesSectionProps) {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
                {(() => {
                    const Icon = getIconByName(introSection?.icon, Umbrella)
                    return (
                        <div className="inline-flex items-center justify-center p-3 bg-cyan-100 rounded-full mb-4">
                            <Icon className="h-8 w-8 text-cyan-600" />
                        </div>
                    )
                })()}
                <h2 className="text-3xl font-bold text-gray-900">{introSection?.title || "Playas Cercanas"}</h2>
                <p className="text-gray-600 mt-2">
                    {introSection?.content || "Disfruta del sol y el mar en las mejores playas de la zona"}
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {beaches.map((beach) => (
                    <BeachCard key={beach.id} beach={beach} />
                ))}
            </div>
        </div>
    )
}
