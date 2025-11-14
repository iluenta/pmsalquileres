import { getTreasuryAccountById } from "@/lib/api/treasury-accounts"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TreasuryAccountForm } from "@/components/treasury/TreasuryAccountForm"

export default async function EditTreasuryAccountPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
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
  const { id } = await params
  const account = await getTreasuryAccountById(id, tenantId)

  if (!account) {
    redirect("/dashboard/treasury-accounts")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Cuenta de Tesorería</h1>
        <p className="text-muted-foreground">
          Modifica la información de la cuenta de tesorería
        </p>
      </div>

      <div className="max-w-2xl">
        <TreasuryAccountForm account={account} tenantId={tenantId} />
      </div>
    </div>
  )
}

