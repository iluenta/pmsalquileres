import type { PropertyGuide } from "@/types/guides"
import { Sparkles, MapPin } from "lucide-react"
import { FormattedText } from "@/components/ui/formatted-text"
import { uiTranslations } from "@/lib/utils/ui-translations"

interface WelcomeSectionProps {
    guide: PropertyGuide
    images?: string[]
    property?: {
        address: string
        name: string
    }
    booking?: any
    currentLanguage?: string
}

export function WelcomeSection({
    guide,
    images = [],
    property,
    booking,
    currentLanguage = "es"
}: WelcomeSectionProps) {
    const t = uiTranslations[currentLanguage] || uiTranslations["es"]
    if (!guide.welcome_message) return null

    // Usar la primera imagen como principal, o un placeholder si no hay
    const mainImage = images[0]

    // Construir URL de Google Maps para "Cómo llegar"
    const googleMapsUrl = guide.latitude && guide.longitude
        ? `https://www.google.com/maps/dir/?api=1&destination=${guide.latitude},${guide.longitude}`
        : null;

    return (
        <section className="bg-white py-8 md:py-12 px-4 md:px-8 overflow-hidden">
            <div className="max-w-7xl w-full mx-auto bg-white relative">

                {/* Decoración superior turquesa más sutil */}
                <div
                    className="absolute top-0 right-0 w-24 h-24 md:w-48 md:h-48 -z-10 opacity-10 rounded-bl-full"
                    style={{ backgroundColor: 'var(--guide-primary)' }}
                />

                <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">

                    {/* Columna Izquierda: Contenido Textual y CTAs (Mobile) */}
                    <div className="flex flex-col relative z-10">

                        {/* Cabecera compacta */}
                        <div className="mb-6 relative">
                            {/* Título ajustado para no romperse */}
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-wide uppercase leading-tight text-balance">
                                {t.welcome}
                            </h2>
                        </div>

                        {/* Texto de Bienvenida */}
                        <div className="mb-6">
                            <FormattedText
                                text={guide.welcome_message}
                                className="text-gray-600 font-light text-sm md:text-base leading-relaxed"
                            />
                        </div>

                        {/* Firma de los Anfitriones */}
                        {guide.host_signature && (
                            <div className="mt-6 mb-8">
                                <p
                                    className="text-gray-700 text-sm md:text-base italic font-medium text-center bg-gray-50 border-l-4 pl-4 py-3 rounded-r"
                                    style={{ borderLeftColor: 'var(--guide-primary)' }}
                                >
                                    "{guide.host_signature}"
                                </p>
                            </div>
                        )}

                        {/* Botones CTA para Móvil (Ocultos en Desktop) */}
                        <div className="flex flex-col gap-4 md:hidden mt-4">
                            {googleMapsUrl && (
                                <a
                                    href={googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-white transition-all active:scale-95 shadow-lg"
                                    style={{ backgroundColor: 'var(--guide-primary)' }}
                                >
                                    <MapPin className="h-5 w-5" />
                                    {t.how_to_get_there}
                                </a>
                            )}
                            {booking?.check_in_url && (
                                <a
                                    href={booking.check_in_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all active:scale-95 border-2 shadow-sm"
                                    style={{
                                        borderColor: 'var(--guide-primary)',
                                        color: 'var(--guide-primary)',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <Sparkles className="h-5 w-5" />
                                    {t.do_check_in}
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Columna Derecha: Imágenes y CTAs (Desktop) */}
                    <div className="relative mt-4 md:mt-0 hidden md:flex flex-col gap-8">
                        {/* Contenedor de imagen principal */}
                        <div className="relative z-10 w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl bg-gray-100 ring-8 ring-white">
                            {mainImage ? (
                                <img
                                    src={mainImage}
                                    alt="Vista de la propiedad"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Sparkles className="h-12 w-12" />
                                </div>
                            )}
                        </div>

                        {/* Botones CTA para Desktop */}
                        <div className="flex flex-col gap-4 relative z-10">
                            {googleMapsUrl && (
                                <a
                                    href={googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black text-lg text-white transition-all hover:scale-[1.02] hover:shadow-2xl shadow-xl group"
                                    style={{ backgroundColor: 'var(--guide-primary)' }}
                                >
                                    <MapPin className="h-6 w-6 transition-transform group-hover:-translate-y-1" />
                                    {t.how_to_get_there}
                                </a>
                            )}
                            {booking?.check_in_url && (
                                <a
                                    href={booking.check_in_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black text-lg transition-all hover:scale-[1.02] hover:shadow-lg border-2 bg-white/50 backdrop-blur-sm group"
                                    style={{
                                        borderColor: 'var(--guide-primary)',
                                        color: 'var(--guide-primary)'
                                    }}
                                >
                                    <Sparkles className="h-6 w-6 transition-transform group-hover:rotate-12" />
                                    {t.do_check_in}
                                </a>
                            )}
                        </div>

                        {/* Elemento decorativo detrás */}
                        <div
                            className="absolute -top-4 -right-4 w-full h-full border-2 rounded-2xl -z-10"
                            style={{ borderColor: 'var(--guide-primary)', opacity: 0.3 }}
                        />
                    </div>

                    {/* Fallback móvil para imagen */}
                    <div className="md:hidden w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-100 mt-4">
                        {mainImage ? (
                            <img src={mainImage} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                <Sparkles className="h-8 w-8" />
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </section>
    )
}
