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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 px-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Proveedores</h1>
          <p className="text-slate-500 font-medium mt-1">
            Ecosistema de servicios profesionales y mantenimiento
          </p>
        </div>
        <Button asChild className="w-full md:w-auto h-12 px-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Link href="/dashboard/service-providers/new">
            <Plus className="mr-2 h-5 w-5 stroke-[3]" />
            Nuevo Socio
          </Link>
        </Button>
      </div>

      <ServiceProvidersTable providers={providers} />
    </div>
  )
}

