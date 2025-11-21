import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getServiceProviderById, updateServiceProvider } from "@/lib/api/service-providers"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ServiceProviderForm } from "@/components/service-providers/ServiceProviderForm"
import type { UpdateServiceProviderData } from "@/types/service-providers"

export default async function EditServiceProviderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
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

  // Obtener el proveedor
  const provider = await getServiceProviderById(id, tenantId)

  if (!provider) {
    redirect("/dashboard/service-providers")
  }

  const handleSave = async (data: UpdateServiceProviderData): Promise<boolean> => {
    "use server"
    const result = await updateServiceProvider(id, data, tenantId)
    return result !== null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/service-providers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Editar Proveedor {provider.person.full_name}
          </h1>
          <p className="text-muted-foreground">
            Modifica los datos del proveedor de servicios
          </p>
        </div>
      </div>

      <ServiceProviderForm provider={provider} tenantId={tenantId} onSave={handleSave} />
    </div>
  )
}

