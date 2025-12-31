"use client"

import { useState } from "react"
import type { Activity, GuideSection } from "@/types/guides"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mountain, Clock, MapPin, Star, ExternalLink, ChevronDown, ChevronUp, Phone } from "lucide-react"
import { DistanceDisplay } from "./DistanceDisplay"
import { getIconByName } from "@/lib/utils/icon-registry"
import { uiTranslations } from "@/lib/utils/ui-translations"

interface ActivitiesSectionProps {
    activities: Activity[]
    introSection?: GuideSection
    currentLanguage?: string
}

function ActivityCard({ activity, currentLanguage = "es" }: { activity: Activity, currentLanguage?: string }) {
    const t = uiTranslations[currentLanguage] || uiTranslations["es"]
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
    const [isScheduleExpanded, setIsScheduleExpanded] = useState(false)
    const description = activity.description || ""
    const shouldShowToggle = description.length > 100

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col h-full">
            <div className="relative h-48 bg-gray-200">
                {activity.image_url ? (
                    <img src={activity.image_url} alt={activity.name} className="w-full h-full object-cover" />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--guide-secondary)' }}
                    >
                        <Mountain className="h-16 w-16" style={{ color: 'var(--guide-primary)', opacity: 0.3 }} />
                    </div>
                )}
                {(activity.badge || activity.activity_type) && (
                    <div className="absolute top-3 left-3">
                        <Badge style={{ backgroundColor: 'var(--guide-primary)' }}>
                            {activity.badge || activity.activity_type}
                        </Badge>
                    </div>
                )}
                {activity.price_range && (
                    <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-white/90 text-green-700 border-green-100 backdrop-blur-sm">
                            {activity.price_range}
                        </Badge>
                    </div>
                )}
            </div>

            <CardContent className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{activity.name}</h3>
                    {activity.rating && (
                        <div className="flex items-center text-amber-500 text-sm font-semibold">
                            <Star className="h-4 w-4 fill-current mr-1" />
                            {activity.rating.toFixed(1)}
                        </div>
                    )}
                </div>

                <DistanceDisplay walkingTime={activity.walking_time} drivingTime={activity.driving_time} />

                {activity.address && (
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activity.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 text-xs mt-2 mb-2 flex items-start hover:text-blue-600 transition-colors"
                    >
                        <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{activity.address}</span>
                    </a>
                )}

                {activity.phone && (
                    <a
                        href={`tel:${activity.phone.replace(/\s+/g, '')}`}
                        className="text-gray-500 text-xs mb-2 flex items-center hover:text-blue-600 transition-colors"
                    >
                        <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>{activity.phone}</span>
                    </a>
                )}

                {activity.opening_hours?.weekday_text && (
                    <div className="text-gray-500 text-xs mb-3 flex items-start gap-1">
                        <Clock className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsScheduleExpanded(!isScheduleExpanded);
                                }}
                                className="transition-colors text-left flex items-center gap-1"
                                style={{ color: 'var(--guide-primary)' }}
                            >
                                <span>{isScheduleExpanded ? t.hide_schedule : t.show_schedule}</span>
                                {isScheduleExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                            {isScheduleExpanded && (
                                <div className="mt-1 space-y-0.5 border-l border-gray-100 pl-2 py-1">
                                    {activity.opening_hours.weekday_text.map((text: string, i: number) => (
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
                                className="mt-2 text-xs font-medium flex items-center gap-1 transition-colors"
                                style={{ color: 'var(--guide-primary)' }}
                            >
                                {isDescriptionExpanded ? (
                                    <>
                                        <ChevronUp className="h-3 w-3" />
                                        {t.read_less}
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-3 w-3" />
                                        {t.read_more}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}

                {activity.price_info && (
                    <div className="mb-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-semibold text-gray-500 uppercase">{t.approx_price}</span>
                        <span className="font-semibold text-green-700">{activity.price_info}</span>
                    </div>
                )}

                {activity.url && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <Button
                            asChild
                            size="sm"
                            className="w-full text-white border-0"
                            style={{ backgroundColor: 'var(--guide-primary)' }}
                        >
                            <a
                                href={activity.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2"
                            >
                                <ExternalLink className="h-4 w-4" />
                                {t.visit_web}
                            </a>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export function ActivitiesSection({ activities, introSection, currentLanguage = "es" }: ActivitiesSectionProps) {
    const t = uiTranslations[currentLanguage] || uiTranslations["es"]

    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
                {(() => {
                    const Icon = getIconByName(introSection?.icon, Mountain)
                    return (
                        <div
                            className="inline-flex items-center justify-center p-3 rounded-full mb-4"
                            style={{ backgroundColor: 'var(--guide-secondary)' }}
                        >
                            <Icon className="h-8 w-8" style={{ color: 'var(--guide-primary)' }} />
                        </div>
                    )
                })()}
                <h2 className="text-3xl font-bold text-gray-900">{introSection?.title || t.activities_default_title}</h2>
                <p className="text-gray-600 mt-2">
                    {introSection?.content || t.activities_default_desc}
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} currentLanguage={currentLanguage} />
                ))}
            </div>
        </div>
    )
}
