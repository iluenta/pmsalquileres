"use client"

import { Menu } from "lucide-react"
import type { PropertyGuide } from "@/types/guides"

interface GuideHeaderProps {
    guide: PropertyGuide
    onMenuClick?: () => void
    guestName?: string | null
    checkInDate?: string | null
    checkOutDate?: string | null
    children?: React.ReactNode // Para inyectar el LanguageSelector
}

export function GuideHeader({ guide, onMenuClick, guestName, checkInDate, checkOutDate, children }: GuideHeaderProps) {
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
        <header
            className="sticky top-0 z-40 h-[120px] md:h-[150px] shadow-md"
            style={{
                background: `linear-gradient(135deg, var(--guide-primary), var(--guide-primary))`,
                filter: 'brightness(0.9)' // Slightly darken for effect
            }}
        >
            {/* Contenedor del header con posición relativa */}
            <div className="relative h-full flex items-center">
                {/* Botón hamburguesa (solo móvil, siempre visible) */}
                {onMenuClick && (
                    <button
                        onClick={onMenuClick}
                        className="md:hidden absolute top-4 left-4 z-50 p-2 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-lg"
                        aria-label="Abrir menú"
                    >
                        <Menu className="h-6 w-6 text-blue-900" />
                    </button>
                )}

                {/* Selector de idioma (derecha) */}
                <div className="absolute top-4 right-4 z-50">
                    {children}
                </div>

                {/* Contenido del header con padding para evitar solapamiento */}
                <div className="flex-1 flex items-center justify-center px-20 md:px-4 z-10 w-full overflow-hidden">
                    <div className="text-center flex flex-col items-center justify-center gap-2 md:gap-3 max-w-full md:max-w-4xl w-full">
                        <h1 className="text-xl md:text-2xl font-bold text-white text-balance text-center max-w-[100%]">
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
            </div>
        </header>
    )
}
