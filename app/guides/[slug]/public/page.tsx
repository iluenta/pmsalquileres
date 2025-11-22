import { PropertyGuidePublicNew } from "@/components/guides/PropertyGuidePublicNew"
import { getPropertyBySlug } from "@/lib/api/properties"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const awaitedParams = await params
  const { slug } = awaitedParams
  
  // Verificar si es un UUID (formato antiguo) o un slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)
  
  let property
  
  if (!isUUID) {
    property = await getPropertyBySlug(slug)
  }
  
  return {
    title: property ? `Guía - ${property.name}` : "Guía de la Propiedad",
    description: property?.description || "Guía de la propiedad",
  }
}

export default async function GuidePublicPage({ params }: PageProps) {
  try {
    const awaitedParams = await params
    const { slug } = awaitedParams

    // Verificar si es un UUID (formato antiguo) o un slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)
    
    let propertyId: string

    if (isUUID) {
      // Si es un UUID, usarlo directamente (compatibilidad con URLs antiguas)
      propertyId = slug
    } else {
      // Buscar propiedad por slug
      const property = await getPropertyBySlug(slug)
      
      if (!property) {
        console.error(`[GuidePublicPage] Property not found with slug: ${slug}`)
        notFound()
      }
      
      propertyId = property.id
    }

    // Pasar el propertyId al componente (mantiene compatibilidad)
    return <PropertyGuidePublicNew propertyId={propertyId} />
  } catch (error) {
    console.error("[GuidePublicPage] Error:", error)
    notFound()
  }
}

