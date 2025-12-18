import type { HouseGuideItem } from "@/types/guides"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Book, HelpCircle } from "lucide-react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

interface HouseGuideSectionProps {
    items: HouseGuideItem[]
}

export function HouseGuideSection({ items }: HouseGuideSectionProps) {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
                    <Book className="h-8 w-8 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Guía de la Casa</h2>
                <p className="text-gray-600 mt-2">Instrucciones de uso para electrodomésticos y servicios</p>
            </div>

            <Card>
                <CardContent className="p-6">
                    <Accordion type="single" collapsible className="w-full">
                        {items.map((item) => (
                            <AccordionItem key={item.id} value={item.id}>
                                <AccordionTrigger className="text-lg font-medium hover:text-indigo-600">
                                    <div className="flex items-center gap-3">
                                        <HelpCircle className="h-5 w-5 text-indigo-500" />
                                        {item.title}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600 prose prose-sm max-w-none">
                                    <p>{item.description}</p>
                                    {item.details && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm border border-gray-100">
                                            {item.details}
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    )
}
