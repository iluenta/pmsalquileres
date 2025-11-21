import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SalesChannelForm } from "@/components/sales-channels/SalesChannelForm"
import { createSalesChannel } from "@/lib/api/sales-channels"
import type { CreateSalesChannelData, UpdateSalesChannelData } from "@/types/sales-channels"

export default async function NewSalesChannelPage() {
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

  const handleSave = async (data: CreateSalesChannelData | UpdateSalesChannelData): Promise<boolean> => {
    "use server"
    // Asegurar que tenemos los campos requeridos para CreateSalesChannelData
    if (!data.full_name || !data.email) {
      throw new Error("Faltan campos requeridos para crear el canal de venta")
    }
    const createData: CreateSalesChannelData = {
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      logo_url: data.logo_url,
      sales_commission: data.sales_commission ?? 0,
      collection_commission: data.collection_commission ?? 0,
      apply_tax: data.apply_tax ?? false,
      tax_type_id: data.tax_type_id,
    }
    const result = await createSalesChannel(createData, tenantId)
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
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Canal de Venta</h1>
          <p className="text-muted-foreground">
            Crea un nuevo canal de venta (Booking, Airbnb, propio, etc.)
          </p>
        </div>
      </div>

      <SalesChannelForm tenantId={tenantId} onSave={handleSave} />
    </div>
  )
}

