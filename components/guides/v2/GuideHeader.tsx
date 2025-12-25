"use client"

import { Menu } from "lucide-react"
import type { PropertyGuide } from "@/types/guides"

interface GuideHeaderProps {
    guide: PropertyGuide
    onMenuClick?: () => void
    guestName?: string | null
    checkInDate?: string | null
    checkOutDate?: string | null
}

export function GuideHeader({ guide, onMenuClick, guestName, checkInDate, checkOutDate }: GuideHeaderProps) {
    // Formatear fechas si están disponibles
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return null
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            })
        } catch {
            return dateString
        }
    }

    const formattedCheckIn = formatDate(checkInDate)
    const formattedCheckOut = formatDate(checkOutDate)

    return (
        <header className="relative h-[120px] md:h-[150px] bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
            {/* Botón hamburguesa (solo móvil) */}
            {onMenuClick && (
                <button
                    onClick={onMenuClick}
                    className="md:hidden absolute top-4 left-4 z-20 p-2 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                    aria-label="Abrir menú"
                >
                    <Menu className="h-6 w-6 text-white" />
                </button>
            )}

            {/* Contenido del header */}
            <div className="absolute inset-0 flex items-center justify-center px-4 z-10">
                <div className="text-center flex flex-col items-center justify-center gap-2 md:gap-3 max-w-4xl">
                    <h1 className="text-xl md:text-2xl font-bold text-white text-balance text-center">
                        {guide.title}
                    </h1>
                    {/* Información del huésped y reserva */}
                    {guestName && (
                        <div className="text-sm md:text-base text-white/90 text-center">
                            <p className="font-medium">
                                Hola {guestName}
                            </p>
                            {formattedCheckIn && formattedCheckOut && (
                                <p className="text-white/80">
                                    Tienes una reserva del {formattedCheckIn} al {formattedCheckOut}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
