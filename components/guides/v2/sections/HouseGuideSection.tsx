import type { HouseGuideItem, GuideSection } from "@/types/guides"
import { Card, CardContent } from "@/components/ui/card"
import { Book } from "lucide-react"
import { getIconByName } from "@/lib/utils/icon-registry"
import { FormattedText } from "@/components/ui/formatted-text"

interface HouseGuideSectionProps {
    items: HouseGuideItem[]
    introSection?: GuideSection
}

export function HouseGuideSection({ items, introSection }: HouseGuideSectionProps) {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                {(() => {
                    const Icon = getIconByName(introSection?.icon, Book)
                    return (
                        <div
                            className="inline-flex items-center justify-center p-3 rounded-full mb-4"
                            style={{ backgroundColor: 'var(--guide-secondary)' }}
                        >
                            <Icon className="h-8 w-8" style={{ color: 'var(--guide-primary)' }} />
                        </div>
                    )
                })()}
                <h2 className="text-3xl font-bold text-gray-900">{introSection?.title || "Guía de la Casa"}</h2>
                <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                    {introSection?.content || "Todo lo que necesitas saber sobre el funcionamiento del apartamento y sus equipos."}
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {items.map((item) => {
                    const IconComponent = getIconByName(item.icon)

                    return (
                        <Card key={item.id} className="border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-white group">
                            <CardContent className="p-8">
                                <div className="flex items-start gap-6">
                                    <div
                                        className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                                        style={{ backgroundColor: 'var(--guide-secondary)' }}
                                    >
                                        <IconComponent className="h-8 w-8" style={{ color: 'var(--guide-primary)' }} />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{item.title}</h3>
                                        <FormattedText
                                            text={item.description}
                                            className="text-gray-600 leading-relaxed"
                                        />
                                        {item.details && (
                                            <div
                                                className="text-sm px-4 py-3 rounded-lg border mt-4"
                                                style={{
                                                    color: 'var(--guide-primary)',
                                                    backgroundColor: 'var(--guide-secondary)',
                                                    borderColor: 'var(--guide-primary)',
                                                    opacity: 0.8
                                                }}
                                            >
                                                <FormattedText text={item.details} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
