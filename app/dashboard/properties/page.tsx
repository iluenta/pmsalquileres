import { getProperties } from "@/lib/api/properties"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { PropertiesTable } from "@/components/properties/properties-table"

export default async function PropertiesPage() {
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

  const properties = await getProperties()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Propiedades</h1>
          <p className="text-muted-foreground">
            Gestiona tu cartera de propiedades vacacionales
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/properties/new">
            <Plus className="w-4 h-4" />
            Nueva Propiedad
          </Link>
        </Button>
      </div>

      <PropertiesTable properties={properties} />
    </div>
  )
}
