import { getProperties } from "@/lib/api/properties"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { PropertiesTable } from "@/components/properties/properties-table"

export default async function PropertiesPage() {
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
  const properties = await getProperties(tenantId)

  return (
    <div className="p-6 h-full overflow-y-auto space-y-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between py-2">
        <div className="flex-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Propiedades</h1>
          <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mt-2">
            Gestiona tu cartera de propiedades vacacionales
          </p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-12 px-8 font-black uppercase text-[11px] tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-95">
          <Link href="/dashboard/properties/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Propiedad
          </Link>
        </Button>
      </div>

      <PropertiesTable properties={properties} />
    </div>
  )
}
