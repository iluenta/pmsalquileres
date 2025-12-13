import { getMovementById } from "@/lib/api/movements"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MovementForm } from "@/components/movements/MovementForm"

export default async function EditExpensePage({
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
  const movement = await getMovementById(id, tenantId)

  if (!movement) {
    redirect("/dashboard/expenses")
  }

  // Verificar que el movimiento es un gasto, si no, redirigir a ingresos
  const movementType = movement.movement_type
  const isIncome = 
    movementType?.value === "income" || 
    movementType?.label === "Ingreso" || 
    movementType?.label?.toLowerCase().includes("ingreso")

  if (isIncome) {
    redirect(`/dashboard/incomes/${id}/edit`)
  }

  return <MovementForm movement={movement} tenantId={tenantId} />
}
