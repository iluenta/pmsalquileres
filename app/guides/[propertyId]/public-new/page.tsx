import { PropertyGuidePublicNew } from "@/components/guides/PropertyGuidePublicNew"

interface PageProps {
  params: Promise<{
    propertyId: string
  }>
}

export default async function PublicGuideNewPage({ params }: PageProps) {
  const awaitedParams = await params
  return <PropertyGuidePublicNew propertyId={awaitedParams.propertyId} />
}
