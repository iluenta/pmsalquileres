import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProperties } from "@/lib/api/properties"
import { CalendarView } from "@/components/calendar/CalendarView"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function CalendarPage() {
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

  // Obtener propiedades activas
  const allProperties = await getProperties()
  const properties = allProperties.filter((p) => p.is_active)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendario de Disponibilidad</h1>
          <p className="text-muted-foreground">
            Visualiza la disponibilidad de las propiedades y verifica disponibilidad rápida
          </p>
        </div>
      </div>

      <CalendarView properties={properties} tenantId={tenantId} />
    </div>
  )
}

