import { GuideClientWrapper } from "@/components/guides/v2/GuideClientWrapper"
import { getPropertyBySlugPublic } from "@/lib/api/properties-public"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { cache } from "react"
import Link from "next/link"

interface PageProps {
    params: Promise<{
        slug: string
    }>
}

// Cachear la función para evitar llamadas duplicadas
const getCachedProperty = cache(async (slug: string) => {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)

    if (isUUID) {
        return { id: slug, isUUID: true }
    }

    const normalizedSlug = slug.toLowerCase().trim()
    const property = await getPropertyBySlugPublic(normalizedSlug)

    if (!property) {
        return null
    }

    return { id: property.id, property, isUUID: false }
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const awaitedParams = await params
    const { slug } = awaitedParams

    const result = await getCachedProperty(slug)

    if (!result || result.isUUID || !result.property) {
        return {
            title: "Guía de la Propiedad",
            description: "Guía interactiva del huésped",
        }
    }

    return {
        title: `Guía - ${result.property.name}`,
        description: result.property.description || "Guía de la propiedad",
    }
}



export default async function GuidePublicPage({ params }: PageProps) {
    const awaitedParams = await params
    const { slug } = awaitedParams

    const result = await getCachedProperty(slug)

    if (!result) {
        // Verificar si la propiedad existe pero no está activa
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)

        if (!isUUID) {
            const { getPropertyBySlugPublic } = await import('@/lib/api/properties-public')
            const inactiveProperty = await getPropertyBySlugPublic(slug, true) // includeInactive = true

            if (inactiveProperty && !inactiveProperty.is_active) {
                // La propiedad existe pero no está activa
                return (
                    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                        <div className="text-center max-w-md">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Guía no disponible
                            </h1>
                            <p className="text-gray-600 mb-6">
                                La guía de esta propiedad no está disponible en este momento.
                            </p>
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Volver al Panel
                            </Link>
                        </div>
                    </div>
                )
            }
        }

        notFound()
    }

    return <GuideClientWrapper propertyId={result.id} propertyName={result.property?.name} />
}
