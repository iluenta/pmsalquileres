import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProperties } from "@/lib/api/properties"
import { PropertyCalendarDashboard } from "@/components/calendar/PropertyCalendarDashboard"

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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Calendario de Disponibilidad</h1>
          <p className="text-sm text-muted-foreground">
            Visualiza la disponibilidad de las propiedades y verifica disponibilidad rápida
          </p>
        </div>
      </header>
      
      <main className="p-6">
        <PropertyCalendarDashboard properties={properties} tenantId={tenantId} />
      </main>
    </div>
  )
}

