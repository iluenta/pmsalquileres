import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TreasuryAccountForm } from "@/components/treasury/TreasuryAccountForm"

export default async function NewTreasuryAccountPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nueva Cuenta de Tesorería</h1>
        <p className="text-muted-foreground">
          Añade una nueva cuenta bancaria para registrar movimientos financieros
        </p>
      </div>

      <div className="max-w-2xl">
        <TreasuryAccountForm tenantId={tenantId} />
      </div>
    </div>
  )
}

