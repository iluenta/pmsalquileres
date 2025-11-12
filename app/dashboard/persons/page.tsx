import { getPersons } from "@/lib/api/persons"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { PersonsTable } from "@/components/persons/PersonsTable"

export default async function PersonsPage() {
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
  // Mostrar todas las personas (activas e inactivas) en el CRUD
  const persons = await getPersons(tenantId, { includeInactive: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personas</h1>
          <p className="text-muted-foreground">
            Gestiona todas las personas del sistema (huéspedes, propietarios, contactos, proveedores, etc.)
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/persons/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Persona
          </Link>
        </Button>
      </div>

      <PersonsTable persons={persons} />
    </div>
  )
}

