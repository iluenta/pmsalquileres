import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getPersons } from "@/lib/api/persons"
import { getConfigurationTypes, getConfigurationValues } from "@/lib/api/configuration"

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "No supabase client" }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userInfo } = await supabase.rpc("get_user_info", {
      p_user_id: user.id,
    })

    if (!userInfo || userInfo.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const tenantId = userInfo[0].tenant_id

    // Obtener parámetros de búsqueda de la URL
    const { searchParams } = new URL(request.url)
    const personType = searchParams.get("personType") || undefined
    const category = searchParams.get("category") // 'guest', 'contact', etc.
    const search = searchParams.get("search") || undefined
    const searchName = searchParams.get("searchName") || search || undefined
    const searchDocument = searchParams.get("searchDocument") || undefined
    const searchEmail = searchParams.get("searchEmail") || undefined
    const searchPhone = searchParams.get("searchPhone") || undefined
    const isActiveParam = searchParams.get("isActive")
    const isActive = isActiveParam === null ? null : isActiveParam === "true"

    // Si se especifica category=guest, buscar el tipo de persona "guest"
    let finalPersonType = personType
    if (category === "guest" && !personType) {
      try {
        const configTypes = await getConfigurationTypes(tenantId, { includeCounts: false })
        const personTypeConfig = configTypes.find(
          (type) =>
            type.name === "person_type" ||
            type.name === "Tipo de Persona" ||
            type.name === "Tipos de Persona"
        )

        if (personTypeConfig) {
          const personTypes = await getConfigurationValues(personTypeConfig.id)
          const guestType = personTypes.find(
            (pt) =>
              pt.value === "guest" ||
              pt.label?.toLowerCase() === "huésped" ||
              pt.label?.toLowerCase() === "guest"
          )
          if (guestType) {
            finalPersonType = guestType.id
          }
        }
      } catch (error) {
        console.error("Error getting guest person type:", error)
      }
    }

    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0

    const persons = await getPersons(tenantId, {
      includeInactive: false, // Solo activos para búsqueda
      personType: finalPersonType,
      searchName,
      searchDocument,
      searchEmail,
      searchPhone,
      isActive: isActive !== null ? isActive : true,
      limit,
      offset,
      enriched: false, // No necesitamos contactos/direcciones para el listado de búsqueda
    })

    return NextResponse.json(persons)
  } catch (error: any) {
    console.error("Error in /api/persons/search GET:", error)
    return NextResponse.json(
      { error: error.message || "Error al buscar personas" },
      { status: 500 }
    )
  }
}
