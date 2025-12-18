import type { Tip, GuideSection } from "@/types/guides"
import { Card, CardContent } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"

interface TipsSectionProps {
    tips: Tip[]
    introSection?: GuideSection
}

export function TipsSection({ tips, introSection }: TipsSectionProps) {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-full mb-4">
                    <Lightbulb className="h-8 w-8 text-amber-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">{introSection?.title || "Consejos Locales"}</h2>
                {introSection?.content && (
                    <p className="text-gray-600 mt-2 max-w-2xl mx-auto">{introSection.content}</p>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {tips.map((tip) => (
                    <Card key={tip.id} className="bg-amber-50/50 border-amber-100 hover:shadow-md transition-all">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-start gap-2">
                                <Lightbulb className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
                                {tip.title}
                            </h3>
                            <p className="text-gray-700 mb-2">{tip.description}</p>
                            {tip.details && (
                                <p className="text-sm text-gray-500 italic mt-2 border-t border-amber-200/50 pt-2">
                                    {tip.details}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
