import type { HouseRule, GuideSection } from "@/types/guides"
import { Card, CardContent } from "@/components/ui/card"
import { ClipboardList, CheckCircle2 } from "lucide-react"
import { getIconByName } from "@/lib/utils/icon-registry"
import { FormattedText } from "@/components/ui/formatted-text"

interface HouseRulesSectionProps {
    rules: HouseRule[]
    introSection?: GuideSection
}

export function HouseRulesSection({ rules, introSection }: HouseRulesSectionProps) {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
                {(() => {
                    const Icon = getIconByName(introSection?.icon, ClipboardList)
                    return (
                        <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
                            <Icon className="h-8 w-8 text-blue-600" />
                        </div>
                    )
                })()}
                <h2 className="text-3xl font-bold text-gray-900">{introSection?.title || "Normas de la Casa"}</h2>
                <p className="text-gray-600 mt-2">{introSection?.content || "Para garantizar una estancia agradable para todos"}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {rules.map((rule) => {
                    // Usar la utilidad centralizada para obtener el icono correcto
                    const IconComponent = getIconByName(rule.icon, CheckCircle2)

                    return (
                        <Card key={rule.id} className="border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-white group">
                            <CardContent className="p-8">
                                <div className="flex items-start gap-6">
                                    <div className="w-16 h-16 bg-blue-50 group-hover:bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 transition-colors">
                                        <IconComponent className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{rule.title}</h3>
                                        <FormattedText
                                            text={rule.description}
                                            className="text-gray-600 leading-relaxed"
                                        />
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
