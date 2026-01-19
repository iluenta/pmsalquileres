import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SalesChannelForm } from "@/components/sales-channels/SalesChannelForm"
import { handleCreateSalesChannelAction } from "./actions"
import type { CreateSalesChannelData } from "@/types/sales-channels"

/**
 * Page to create a new sales channel.
 * Recreated after purging corrupted file.
 */
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

    if (!tenantId) {
        redirect("/login")
    }

    return (
        <div className="h-full">
            <SalesChannelForm
                tenantId={tenantId}
                onSave={(data) => handleCreateSalesChannelAction(data as CreateSalesChannelData, tenantId)}
                title="Nuevo Canal de Venta"
                subtitle="Registra un nuevo portal o canal directo para tus reservas"
            />
        </div>
    )
}
