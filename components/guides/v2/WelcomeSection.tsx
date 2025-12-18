import type { PropertyGuide } from "@/types/guides"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, MapPin } from "lucide-react"

interface WelcomeSectionProps {
    guide: PropertyGuide
    images?: string[]
    property?: {
        address: string
        name: string
    }
}

export function WelcomeSection({ guide, images = [], property }: WelcomeSectionProps) {
    if (!guide.welcome_message) return null

    // Usar la primera imagen como principal, o un placeholder si no hay
    const mainImage = images[0]


    return (
        <section className="bg-white py-8 md:py-12 px-4 md:px-8 overflow-hidden">
            <div className="max-w-7xl w-full mx-auto bg-white relative">

                {/* Decoración superior turquesa más sutil */}
                <div className="absolute top-0 right-0 w-24 h-24 md:w-48 md:h-48 bg-[#67E8F9] -z-10 opacity-10 rounded-bl-full" />

                <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">

                    {/* Columna Izquierda: Contenido Textual */}
                    <div className="flex flex-col relative z-10">

                        {/* Cabecera compacta */}
                        <div className="mb-6 relative">
                            {/* Título ajustado para no romperse */}
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-wide uppercase leading-tight text-balance">
                                Bienvenid<span className="text-[#22d3ee]">o</span>s
                            </h2>
                        </div>

                        {/* Texto de Bienvenida */}
                        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed text-pretty">
                            <p className="whitespace-pre-wrap font-light text-base md:text-lg">
                                {guide.welcome_message}
                            </p>
                        </div>

                    </div>

                    {/* Columna Derecha: Imágenes y Dirección */}
                    <div className="relative mt-4 md:mt-0 hidden md:block space-y-8">
                        {/* Contenedor de imagen principal con Aspect Ratio controlado y fallback de color */}
                        <div className="relative z-10 w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl bg-gray-100 ring-8 ring-white">
                            {mainImage ? (
                                <img
                                    src={mainImage}
                                    alt="Vista de la propiedad"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Fallback visual si falla la imagen
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement!.classList.add('flex', 'items-center', 'justify-center');
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Sparkles className="h-12 w-12" />
                                </div>
                            )}
                        </div>

                        {/* Dirección de la Propiedad (Movida desde Apartamento) */}
                        {property?.address && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative z-10">
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-50 p-2 rounded-full mt-1">
                                        <MapPin className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">Dirección</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {property.address}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Elemento decorativo detrás */}
                        <div className="absolute -top-4 -right-4 w-full h-full border-2 border-[#67E8F9] rounded-2xl -z-10 md:block hidden" />
                    </div>

                    {/* Versión móvil de imagen (debajo del texto) */}
                    <div className="md:hidden w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-100">
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
