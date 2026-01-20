import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ServiceProviderForm } from "@/components/service-providers/ServiceProviderForm"
import { createServiceProvider } from "@/lib/api/service-providers"
import type { CreateServiceProviderData, UpdateServiceProviderData } from "@/types/service-providers"

export default async function NewServiceProviderPage() {
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

  const handleSave = async (data: CreateServiceProviderData | UpdateServiceProviderData): Promise<boolean> => {
    "use server"
    // Asegurar que tenemos los campos requeridos para CreateServiceProviderData
    if (!data.full_name) {
      throw new Error("Faltan campos requeridos para crear el proveedor de servicios")
    }
    const createData: CreateServiceProviderData = {
      full_name: data.full_name,
      document_type: data.document_type,
      document_number: data.document_number,
      email: data.email,
      phone: data.phone,
      logo_url: data.logo_url,
      notes: data.notes,
      is_active: data.is_active ?? true,
    }
    const result = await createServiceProvider(createData, tenantId)
    return result !== null
  }

  return (
    <div className="h-full">
      <ServiceProviderForm
        tenantId={tenantId}
        onSave={handleSave}
        title="Nuevo Proveedor"
        subtitle="Registra una nueva empresa o profesional de servicios"
      />
    </div>
  )
}
