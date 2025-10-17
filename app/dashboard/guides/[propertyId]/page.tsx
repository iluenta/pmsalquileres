import { PropertyGuideManager } from "@/components/guides/PropertyGuideManager"

interface GuidePageProps {
  params: Promise<{ propertyId: string }>
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { propertyId } = await params

  return <PropertyGuideManager propertyId={propertyId} />
}