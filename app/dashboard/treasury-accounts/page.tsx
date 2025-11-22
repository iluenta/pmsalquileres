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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Cuentas de Tesorería</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gestiona las cuentas bancarias donde se registran los movimientos financieros
          </p>
        </div>
        <Button asChild className="w-full md:w-auto">
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

