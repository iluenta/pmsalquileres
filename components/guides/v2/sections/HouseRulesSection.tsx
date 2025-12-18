import type { HouseRule } from "@/types/guides"
import { Card, CardContent } from "@/components/ui/card"
import { ClipboardList, CheckCircle2 } from "lucide-react"
import { getIconFromCode } from "@/lib/utils/icons"

interface HouseRulesSectionProps {
    rules: HouseRule[]
}

export function HouseRulesSection({ rules }: HouseRulesSectionProps) {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
                    <ClipboardList className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Normas de la Casa</h2>
                <p className="text-gray-600 mt-2">Para garantizar una estancia agradable para todos</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {rules.map((rule) => {
                    // Usar la utilidad centralizada para obtener el icono correcto
                    // Si el icono no se encuentra, usamos CheckCircle2 como fallback
                    const IconComponent = getIconFromCode(rule.icon, CheckCircle2)

                    return (
                        <Card key={rule.id} className="border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-8 flex flex-col items-center text-center h-full">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-600">
                                    <IconComponent className="h-8 w-8" />
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-3">{rule.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-balance">
                                    {rule.description}
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
