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

    // Buscar el tipo de configuración "Tipo de Persona"
    const configTypes = await getConfigurationTypes(tenantId, { includeCounts: false })
    const personTypeConfig = configTypes.find(
      (type) =>
        type.name === "person_type" ||
        type.name === "Tipo de Persona" ||
        type.name === "Tipos de Persona"
    )

    if (!personTypeConfig) {
      return NextResponse.json([])
    }

    // Obtener los valores de tipo de persona
    const personTypes = await getConfigurationValues(personTypeConfig.id)

    return NextResponse.json(personTypes)
  } catch (error: any) {
    console.error("Error in /api/configuration/person-types:", error)
    return NextResponse.json(
      { error: error.message || "Error al obtener los tipos de persona" },
      { status: 500 }
    )
  }
}

