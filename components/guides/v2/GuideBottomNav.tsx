"use client"

import { cn } from "@/lib/utils"
import { Home, Book, Compass, Phone, MapPin, Sparkles } from "lucide-react"

interface GuideBottomNavProps {
    activeTab: string
    onTabChange: (tabId: string) => void
    googleMapsUrl?: string | null
    checkInUrl?: string | null
    onCheckInClick?: () => void
}

export function GuideBottomNav({
    activeTab,
    onTabChange,
    googleMapsUrl,
    checkInUrl,
    onCheckInClick
}: GuideBottomNavProps) {
    // Definimos qué secciones pertenecen a cada categoría del bottom bar
    // Algunos son navegación local e internos, otros son links externos
    const categories = [
        {
            id: "inicio",
            label: "Inicio",
            icon: Home,
            ids: ["bienvenida"]
        },
        {
            id: "llegar",
            label: "Llegar",
            icon: MapPin,
            url: googleMapsUrl
        },
        {
            id: "checkin",
            label: "Check-in",
            icon: Sparkles,
            url: checkInUrl
        },
        {
            id: "la-casa",
            label: "Casa",
            icon: Book,
            ids: ["apartamento", "normas", "guia-casa", "consejos"]
        },
        {
            id: "explora",
            label: "Explora",
            icon: Compass,
            ids: ["playas", "restaurantes", "actividades", "compras", "tiempo"]
        },
        {
            id: "contacto",
            label: "Contacto",
            icon: Phone,
            ids: ["contacto"]
        }
    ].filter(cat => cat.id === "inicio" || cat.url || (cat.ids && cat.ids.length > 0))

    // Determinar qué categoría está activa basándose en el activeTab de PropertyGuideV2
    const currentCategory = categories.find(cat => cat.ids?.includes(activeTab))?.id || "inicio"

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.05)] border-t border-gray-100 safe-area-bottom">
            <div className="flex justify-around items-center h-16 px-1">
                {categories.map((category) => {
                    const Icon = category.icon
                    const isActive = currentCategory === category.id

                    // Si es un link externo
                    if (category.url) {
                        const isCheckIn = category.id === "checkin"

                        return (
                            <button
                                key={category.id}
                                onClick={() => {
                                    if (isCheckIn && onCheckInClick) {
                                        onCheckInClick()
                                    } else if (category.url) {
                                        window.open(category.url, "_blank", "noopener,noreferrer")
                                    }
                                }}
                                className="flex flex-col items-center justify-center flex-1 gap-1"
                            >
                                <div className={cn(
                                    "p-1 rounded-lg",
                                    isCheckIn ? "text-orange-600 bg-orange-50" : "text-blue-600 bg-blue-50"
                                )}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-tight text-gray-500">
                                    {category.label}
                                </span>
                            </button>
                        )
                    }

                    // Si es navegación interna
                    return (
                        <button
                            key={category.id}
                            onClick={() => category.ids && onTabChange(category.ids[0])}
                            className="flex flex-col items-center justify-center flex-1 gap-1 transition-all duration-300"
                        >
                            <div className={cn(
                                "p-1.5 rounded-xl transition-all duration-300",
                                isActive ? "bg-[var(--guide-primary)] text-white shadow-md scale-105" : "text-gray-400"
                            )}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <span className={cn(
                                "text-[9px] font-bold uppercase tracking-tight",
                                isActive ? "text-[var(--guide-primary)]" : "text-gray-400"
                            )}>
                                {category.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
