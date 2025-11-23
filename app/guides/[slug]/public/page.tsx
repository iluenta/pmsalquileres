import { PropertyGuidePublicNew } from "@/components/guides/PropertyGuidePublicNew"
import { getPropertyBySlugPublic } from "@/lib/api/properties-public"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { cache } from "react"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Cachear la función para evitar llamadas duplicadas entre generateMetadata y el componente
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
      description: "Guía de la propiedad",
    }
  }
  
  return {
    title: `Guía - ${result.property.name}`,
    description: result.property.description || "Guía de la propiedad",
  }
}

export default async function GuidePublicPage({ params }: PageProps) {
  try {
    const awaitedParams = await params
    const { slug } = awaitedParams

    const result = await getCachedProperty(slug)
    
    if (!result) {
      notFound()
    }

    // Pasar el propertyId al componente (mantiene compatibilidad)
    return <PropertyGuidePublicNew propertyId={result.id} />
  } catch (error) {
    console.error("[GuidePublicPage] Error:", error)
    notFound()
  }
}

