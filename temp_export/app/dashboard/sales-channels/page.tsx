import { getSalesChannels } from "@/lib/api/sales-channels"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { SalesChannelsTable } from "@/components/sales-channels/SalesChannelsTable"

export default async function SalesChannelsPage() {
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
  // Mostrar todos los canales (activos e inactivos) en el CRUD
  const channels = await getSalesChannels(tenantId, true)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Canales de Venta</h1>
          <p className="text-muted-foreground">
            Gestiona los canales de venta (Booking, Airbnb, propio, etc.)
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/sales-channels/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Canal
          </Link>
        </Button>
      </div>

      <SalesChannelsTable channels={channels} />
    </div>
  )
}

