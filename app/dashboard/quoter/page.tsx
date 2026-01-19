import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProperties } from "@/lib/api/properties"
import { QuoterScreen } from "@/components/quoter/QuoterScreen"

/**
 * Page to render the Express Quoter.
 * Fixed tenant fetching logic.
 */
export default async function QuoterPage() {
    const supabase = await getSupabaseServerClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Get user info with tenant using RPC for reliability
    const { data: userInfo } = await supabase.rpc("get_user_info", {
        p_user_id: user.id,
    })

    if (!userInfo || userInfo.length === 0) {
        redirect("/login")
    }

    const tenantId = userInfo[0].tenant_id
    const properties = await getProperties(tenantId)

    return (
        <div className="h-full bg-slate-50 flex flex-col">
            <QuoterScreen properties={properties} tenantId={tenantId} />
        </div>
    )
}
