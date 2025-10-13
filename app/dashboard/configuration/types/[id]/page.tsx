import { getConfigurationValues } from "@/lib/api/configuration"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ConfigurationValuesList } from "@/components/configuration/configuration-values-list"

export default async function ConfigurationTypePage({ params }: { params: Promise<{ id: string }> }) {
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

  // Get configuration type
  const { data: configType } = await supabase
    .from("configuration_types")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single()

  if (!configType) {
    redirect("/dashboard/configuration")
  }

  const configValues = await getConfigurationValues(id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/configuration">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{configType.name}</h1>
          <p className="text-muted-foreground">{configType.description || "Gestiona los valores de configuración"}</p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/configuration/types/${id}/values/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Valor
          </Link>
        </Button>
      </div>

      <ConfigurationValuesList values={configValues} typeId={id} />
    </div>
  )
}
