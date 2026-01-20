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
  const allProperties = await getProperties(tenantId)
  const properties = allProperties.filter((p) => p.is_active)

  return (
    <div className="h-full overflow-hidden bg-slate-50/30">
      <PropertyCalendarDashboard properties={properties} tenantId={tenantId} />
    </div>
  )
}
