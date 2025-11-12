import { getServiceProviders } from "@/lib/api/service-providers"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { ServiceProvidersTable } from "@/components/service-providers/ServiceProvidersTable"

export default async function ServiceProvidersPage() {
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
  // Mostrar todos los proveedores (activos e inactivos) en el CRUD
  const providers = await getServiceProviders(tenantId, true)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proveedores de Servicios</h1>
          <p className="text-muted-foreground">
            Gestiona los proveedores de servicios externos (limpieza, mantenimiento, jardinería, etc.)
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/service-providers/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proveedor
          </Link>
        </Button>
      </div>

      <ServiceProvidersTable providers={providers} />
    </div>
  )
}

