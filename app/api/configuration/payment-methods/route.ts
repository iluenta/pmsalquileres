import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getConfigurationTypes, getConfigurationValues } from "@/lib/api/configuration"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "No se pudo conectar con la base de datos" }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { data: userInfo } = await supabase.rpc("get_user_info", {
      p_user_id: user.id,
    })

    if (!userInfo || userInfo.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const tenantId = userInfo[0].tenant_id

    // Buscar el tipo de configuración "Método de Pago"
    const configTypes = await getConfigurationTypes(tenantId, { includeCounts: false })
    const paymentMethodConfig = configTypes.find(
      (type) =>
        type.name === "payment_method" ||
        type.name === "Método de Pago" ||
        type.name === "Métodos de Pago"
    )

    if (!paymentMethodConfig) {
      return NextResponse.json([])
    }

    // Obtener los valores de método de pago
    const paymentMethods = await getConfigurationValues(paymentMethodConfig.id)

    return NextResponse.json(paymentMethods)
  } catch (error: any) {
    console.error("Error in /api/configuration/payment-methods:", error)
    return NextResponse.json(
      { error: error.message || "Error al obtener los métodos de pago" },
      { status: 500 }
    )
  }
}

