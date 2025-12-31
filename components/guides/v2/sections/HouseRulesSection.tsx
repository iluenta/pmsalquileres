import type { HouseRule, GuideSection } from "@/types/guides"
import { Card, CardContent } from "@/components/ui/card"
import { ClipboardList, CheckCircle2 } from "lucide-react"
import { getIconByName } from "@/lib/utils/icon-registry"
import { FormattedText } from "@/components/ui/formatted-text"

import { uiTranslations } from "@/lib/utils/ui-translations"

interface HouseRulesSectionProps {
    rules: HouseRule[]
    introSection?: GuideSection
    currentLanguage?: string
}

export function HouseRulesSection({ rules, introSection, currentLanguage = "es" }: HouseRulesSectionProps) {
    const t = uiTranslations[currentLanguage] || uiTranslations["es"]
    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
                {(() => {
                    const Icon = getIconByName(introSection?.icon, ClipboardList)
                    return (
                        <div
                            className="inline-flex items-center justify-center p-3 rounded-full mb-4"
                            style={{ backgroundColor: 'var(--guide-secondary)' }}
                        >
                            <Icon className="h-8 w-8" style={{ color: 'var(--guide-primary)' }} />
                        </div>
                    )
                })()}
                <h2 className="text-3xl font-bold text-gray-900">{introSection?.title || t.house_rules}</h2>
                <p className="text-gray-600 mt-2">{introSection?.content || t.house_rules_desc}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {rules.map((rule) => {
                    // Usar la utilidad centralizada para obtener el icono correcto
                    const IconComponent = getIconByName(rule.icon, CheckCircle2)

                    return (
                        <Card key={rule.id} className="border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-white group">
                            <CardContent className="p-8">
                                <div className="flex items-start gap-6">
                                    <div
                                        className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                                        style={{ backgroundColor: 'var(--guide-secondary)' }}
                                    >
                                        <IconComponent className="h-8 w-8" style={{ color: 'var(--guide-primary)' }} />
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
