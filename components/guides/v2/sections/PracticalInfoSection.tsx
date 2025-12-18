import type { PracticalInfo } from "@/types/guides"
import { Card, CardContent } from "@/components/ui/card"
import { Info, HelpCircle } from "lucide-react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

interface PracticalInfoSectionProps {
    info: PracticalInfo[]
}

export function PracticalInfoSection({ info }: PracticalInfoSectionProps) {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 bg-violet-100 rounded-full mb-4">
                    <Info className="h-8 w-8 text-violet-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Información Práctica</h2>
                <p className="text-gray-600 mt-2">Detalles útiles para tu día a día</p>
            </div>

            <Card>
                <CardContent className="p-6">
                    <Accordion type="single" collapsible className="w-full">
                        {info.map((item) => (
                            <AccordionItem key={item.id} value={item.id}>
                                <AccordionTrigger className="text-lg font-medium hover:text-violet-600">
                                    <div className="flex items-center gap-3">
                                        <HelpCircle className="h-5 w-5 text-violet-500" />
                                        {item.title}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600 prose prose-sm max-w-none">
                                    <p>{item.description}</p>
                                    {/* El campo 'details' en PracticalInfo corresponde a la descripción larga o HTML a veces */}
                                    {/* Si tuviese html, habría que usar dangerouslySetInnerHTML con cuidado */}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    )
}
