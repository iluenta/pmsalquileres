import { getProperty } from "@/lib/api/properties"
import { PropertyGuideManager } from "@/components/guides/PropertyGuideManager"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface GuidePropertyPageProps {
  params: Promise<{ propertyId: string }>
}

export default async function GuidePropertyPage({ params }: GuidePropertyPageProps) {
  const { propertyId } = await params
  const property = await getProperty(propertyId)

  if (!property) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href="/dashboard/guides">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Guías
          </Button>
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-sm text-gray-600">{property.name}</span>
      </div>

      {/* Property Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold">{property.name}</h2>
        <p className="text-gray-600">
          {property.address || "Sin dirección especificada"}
        </p>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span>{property.property_type || "Tipo no especificado"}</span>
          <span>•</span>
          <span>{property.max_guests || 0} huéspedes máx.</span>
        </div>
      </div>

      {/* Guide Manager */}
      <PropertyGuideManager 
        propertyId={property.id} 
        propertyName={property.name}
      />
    </div>
  )
}
