import type { ApartmentSection as ApartmentSectionType, GuideSection } from "@/types/guides"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import { getIconByName } from "@/lib/utils/icon-registry"

import { uiTranslations } from "@/lib/utils/ui-translations"
import { Home, UtensilsCrossed, Bath, Armchair, Bed, Sun, DoorOpen, Wind, Car, LucideIcon } from "lucide-react"

const TYPE_ICONS: Record<string, LucideIcon> = {
    cocina: UtensilsCrossed,
    bano: Bath,
    salon: Armchair,
    dormitorio: Bed,
    terraza: Sun,
    entrada: DoorOpen,
    balcon: Wind,
    garaje: Car,
}

interface ApartmentSectionProps {
    apartmentSections: ApartmentSectionType[]
    property: {
        address: string
        name: string
    } | undefined
    introSection?: GuideSection
    currentLanguage?: string
}

export function ApartmentSection({ apartmentSections, property, introSection, currentLanguage = "es" }: ApartmentSectionProps) {
    const t = uiTranslations[currentLanguage] || uiTranslations["es"]

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="text-center mb-8">
                {(() => {
                    const Icon = getIconByName(introSection?.icon, Home)
                    return (
                        <div
                            className="inline-flex items-center justify-center p-3 rounded-full mb-4"
                            style={{ backgroundColor: 'var(--guide-secondary)' }}
                        >
                            <Icon className="h-8 w-8" style={{ color: 'var(--guide-primary)' }} />
                        </div>
                    )
                })()}
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{introSection?.title || t.apartment}</h2>
                {introSection?.content && (
                    <p className="text-lg text-gray-700 max-w-3xl mx-auto">{introSection.content}</p>
                )}
            </div>



            <div className="grid md:grid-cols-2 gap-6">
                {apartmentSections.map((section) => {
                    // Lógica simple para icono
                    const Icon = TYPE_ICONS[section.section_type] || Home

                    return (
                        <Card key={section.id} className="overflow-hidden bg-white hover:shadow-lg transition-shadow">
                            <div className="relative bg-gray-200" style={{ aspectRatio: '4/3' }}>
                                {section.image_url ? (
                                    <img
                                        src={section.image_url}
                                        alt={section.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                        <Icon className="h-16 w-16 opacity-30" />
                                    </div>
                                )}
                                <div className="absolute bottom-4 left-4">
                                    <Badge variant="secondary" className="bg-white/90 text-gray-900 backdrop-blur-sm shadow-sm">
                                        {section.title}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                    <Icon className="h-5 w-5" style={{ color: 'var(--guide-primary)' }} />
                                    {section.title}
                                </h3>
                                <p className="text-gray-600 mb-4">{section.description}</p>

                                {section.amenities && section.amenities.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {section.amenities.map(amenity => (
                                            <span key={amenity} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
