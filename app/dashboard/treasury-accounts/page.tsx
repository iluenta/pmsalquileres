import { getTreasuryAccounts } from "@/lib/api/treasury-accounts"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { TreasuryAccountsTable } from "@/components/treasury/TreasuryAccountsTable"

export default async function TreasuryAccountsPage() {
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
  const accounts = await getTreasuryAccounts(tenantId, { includeInactive: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cuentas de Tesorería</h1>
          <p className="text-muted-foreground">
            Gestiona las cuentas bancarias donde se registran los movimientos financieros
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/treasury-accounts/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cuenta
          </Link>
        </Button>
      </div>

      <TreasuryAccountsTable accounts={accounts} />
    </div>
  )
}

