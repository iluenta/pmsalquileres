import type { Tip, GuideSection } from "@/types/guides"
import { Card, CardContent } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"
import { getIconByName } from "@/lib/utils/icon-registry"
import { FormattedText } from "@/components/ui/formatted-text"

interface TipsSectionProps {
    tips: Tip[]
    introSection?: GuideSection
}

export function TipsSection({ tips, introSection }: TipsSectionProps) {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                {(() => {
                    const Icon = getIconByName(introSection?.icon, Lightbulb)
                    return (
                        <div className="inline-flex items-center justify-center p-3 bg-yellow-100 rounded-full mb-4">
                            <Icon className="h-8 w-8 text-yellow-600" />
                        </div>
                    )
                })()}
                <h2 className="text-3xl font-bold text-gray-900">{introSection?.title || "Consejos y Recomendaciones"}</h2>
                <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                    {introSection?.content || "Pequeños detalles y sugerencias útiles para que tu estancia sea perfecta y no te falte nada."}
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {tips.map((tip: any) => {
                    const IconComponent = getIconByName(tip.icon, Lightbulb)
                    // Usar description pero caer a content si description está vacío (para transición)
                    const tipDescription = tip.description || tip.content;

                    return (
                        <Card key={tip.id} className="border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-white group">
                            <CardContent className="p-8">
                                <div className="flex items-start gap-6">
                                    <div className="w-16 h-16 bg-blue-50 group-hover:bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 transition-colors">
                                        <IconComponent className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{tip.title}</h3>

                                        {tipDescription ? (
                                            <FormattedText
                                                text={tipDescription}
                                                className="text-gray-600 leading-relaxed"
                                            />
                                        ) : (
                                            <p className="text-gray-400 italic text-sm">Sin descripción disponible</p>
                                        )}

                                        {tip.details && (
                                            <div className="pt-4 border-t border-gray-50 mt-4">
                                                <FormattedText
                                                    text={tip.details}
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
