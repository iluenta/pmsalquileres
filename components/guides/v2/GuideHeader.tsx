"use client"

import { Menu } from "lucide-react"
import type { PropertyGuide } from "@/types/guides"
import { uiTranslations } from "@/lib/utils/ui-translations"

interface GuideHeaderProps {
    guide: any // Usar any si la definición de PropertyGuide es restrictiva
    onMenuClick?: () => void
    guestName?: string | null
    checkInDate?: string | null
    checkOutDate?: string | null
    currentLanguage?: string
    children?: React.ReactNode // Para inyectar el LanguageSelector
}

export function GuideHeader({
    guide,
    onMenuClick,
    guestName,
    checkInDate,
    checkOutDate,
    currentLanguage = "es",
    children
}: GuideHeaderProps) {
    const t = uiTranslations[currentLanguage] || uiTranslations["es"]

    // Formatear fechas si están disponibles
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return null
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString(currentLanguage, {
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
            className="sticky top-0 z-40 h-[60px] md:h-[150px] shadow-sm transition-all duration-300"
            style={{
                background: `linear-gradient(135deg, var(--guide-primary), var(--guide-primary))`,
            }}
        >
            {/* Contenedor del header con posición relativa */}
            <div className="relative h-full flex items-center px-4">
                {/* Botón hamburguesa (solo móvil, más discreto) */}
                {onMenuClick && (
                    <button
                        onClick={onMenuClick}
                        className="md:hidden flex-shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
                        aria-label="Abrir menú"
                    >
                        <Menu className="h-5 w-5 text-white" />
                    </button>
                )}

                {/* Contenido del header: Título centrado */}
                <div className="flex-1 px-2 overflow-hidden">
                    <h1 className="text-sm md:text-2xl font-bold text-white truncate text-center md:text-balance">
                        {guide.name || guide.title}
                    </h1>
                </div>

                {/* Selector de idioma (derecha) */}
                <div className="flex-shrink-0">
                    {children}
                </div>

                {/* Información extendida solo en desktop */}
                <div className="hidden md:block absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-4xl text-center">
                    {guestName && (
                        <div className="text-sm md:text-base text-white/90">
                            <p className="font-medium">
                                {t.hello} {guestName}
                            </p>
                            {formattedCheckIn && formattedCheckOut && (
                                <p className="text-white/80">
                                    {t.booking_dates
                                        .replace('{from}', formattedCheckIn)
                                        .replace('{to}', formattedCheckOut)}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
