import { getPropertyById, getPropertyTypes } from "@/lib/api/properties"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PropertyForm } from "@/components/properties/property-form"

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userInfo } = await supabase.rpc("get_user_info", {
    p_user_id: user.id,
  })

  if (!userInfo || userInfo.length === 0) {
    redirect("/login")
  }

  const tenantId = userInfo[0].tenant_id
  const property = await getPropertyById(id, tenantId)

  if (!property) {
    redirect("/dashboard/properties")
  }

  const propertyTypes = await getPropertyTypes(tenantId)

  return <PropertyForm propertyTypes={propertyTypes} tenantId={tenantId} property={property} />
}
