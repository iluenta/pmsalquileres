import type { HouseGuideItem } from "@/types/guides"
import { Card, CardContent } from "@/components/ui/card"
import { Book } from "lucide-react"
import { getIconByName } from "@/lib/utils/icon-registry"
import { FormattedText } from "@/components/ui/formatted-text"

interface HouseGuideSectionProps {
    items: HouseGuideItem[]
}

export function HouseGuideSection({ items }: HouseGuideSectionProps) {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
                    <Book className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Guía de la Casa</h2>
                <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                    Todo lo que necesitas saber sobre el funcionamiento del apartamento y sus equipos.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {items.map((item) => {
                    const IconComponent = getIconByName(item.icon)

                    return (
                        <Card key={item.id} className="border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-white group">
                            <CardContent className="p-8">
                                <div className="flex items-start gap-6">
                                    <div className="w-16 h-16 bg-blue-50 group-hover:bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 transition-colors">
                                        <IconComponent className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{item.title}</h3>
                                        <FormattedText
                                            text={item.description}
                                            className="text-gray-600 leading-relaxed"
                                        />
                                        {item.details && (
                                            <div className="pt-4 border-t border-gray-50 mt-4">
                                                <FormattedText
                                                    text={item.details}
                                                    className="text-sm text-blue-700 bg-blue-50/50 px-4 py-3 rounded-lg border border-blue-100/50"
                                                />
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
