"use client"

import { useState, useEffect } from "react"
import { QuickCheckForm } from "@/components/calendar/QuickCheckForm"
import { AvailablePeriods } from "@/components/calendar/AvailablePeriods"
import { PropertySelector } from "@/components/calendar/PropertySelector"
import type { Property } from "@/lib/api/properties"
import { Search, MapPin, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface QuoterScreenProps {
    properties: Property[]
    tenantId: string
}

export function QuoterScreen({ properties, tenantId }: QuoterScreenProps) {
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>("")

    useEffect(() => {
        if (properties.length > 0 && !selectedPropertyId) {
            const firstActiveProperty = properties.find(p => p.is_active) || properties[0]
            if (firstActiveProperty?.id) {
                setSelectedPropertyId(firstActiveProperty.id)
            }
        }
    }, [properties, selectedPropertyId])

    if (!properties || properties.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-slate-50 p-6 text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center mb-6">
                    <Building2 className="w-10 h-10 text-indigo-500" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase mb-2">No hay propiedades</h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-xs">
                    Debes tener al menos una propiedad registrada para usar el cotizador.
                </p>
                <Button asChild className="mt-8 rounded-2xl bg-indigo-600 font-black uppercase text-[11px] tracking-widest px-8 h-12 text-white">
                    <Link href="/dashboard/properties/new">Registrar Propiedad</Link>
                </Button>
            </div>
        )
    }

    const selectedProperty = properties.find(p => p.id === selectedPropertyId)

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC]">
            {/* 1. Header (Sticky) */}
            <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-5 shadow-sm">
                <div className="max-w-xl mx-auto flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
                                <Search className="w-6 h-6 text-indigo-600" />
                                Cotizador Exprés
                            </h1>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                Disponibilidad y Valoración en tiempo real
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <PropertySelector
                            selectedProperty={selectedPropertyId}
                            onPropertyChange={setSelectedPropertyId}
                            properties={properties}
                            compact={true}
                        />
                        {selectedProperty && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg self-start">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                    {selectedProperty.city}, {selectedProperty.province}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* 2. Scrollable Content */}
            <main className="flex-1 overflow-y-auto px-6 py-6 pb-32">
                <div className="max-w-xl mx-auto space-y-8">
                    {/* Quick Check Form - Optimized for Mobile */}
                    <section>
                        <QuickCheckForm propertyId={selectedPropertyId} tenantId={tenantId} />
                    </section>

                    {/* Available Periods List - Opportunity Cards */}
                    <section>
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                Próximos Huecos Libres
                            </h2>
                        </div>
                        <AvailablePeriods propertyId={selectedPropertyId} />
                    </section>
                </div>
            </main>
        </div>
    )
}
