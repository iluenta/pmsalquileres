import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getSalesChannelById, updateSalesChannel } from "@/lib/api/sales-channels"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SalesChannelForm } from "@/components/sales-channels/SalesChannelForm"
import type { UpdateSalesChannelData } from "@/types/sales-channels"

export default async function EditSalesChannelPage({
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

  // Obtener el canal
  const channel = await getSalesChannelById(id, tenantId)

  if (!channel) {
    redirect("/dashboard/sales-channels")
  }

  const handleSave = async (data: UpdateSalesChannelData): Promise<boolean> => {
    "use server"
    const result = await updateSalesChannel(id, data, tenantId)
    return result !== null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/sales-channels">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Editar Canal {channel.person.full_name}
          </h1>
          <p className="text-muted-foreground">
            Modifica los datos del canal de venta
          </p>
        </div>
      </div>

      <SalesChannelForm channel={channel} tenantId={tenantId} onSave={handleSave} />
    </div>
  )
}

