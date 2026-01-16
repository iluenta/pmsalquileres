import { getSupabaseServerClient } from "@/lib/supabase/server"

export interface ConfigurationType {
  id: string
  name: string
  description: string | null
  is_active: boolean
  sort_order: number
  values_count?: number
}

export interface ConfigurationValue {
  id: string
  configuration_type_id: string
  value: string
  label: string
  description: string | null
  is_active: boolean
  sort_order: number
  color: string | null
  icon: string | null
  is_default?: boolean
}

export async function getConfigurationTypes(
  tenantId: string,
  options: { includeCounts?: boolean } = { includeCounts: true }
): Promise<ConfigurationType[]> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("configuration_types")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching configuration types:", error)
    return []
  }

  if (!options.includeCounts) {
    return (data || []).map((type: any) => ({
      ...type,
      values_count: 0,
    }))
  }

  // Get count of values for each type
  const typesWithCounts = await Promise.all(
    (data || []).map(async (type: any) => {
      const { count } = await supabase
        .from("configuration_values")
        .select("*", { count: "exact", head: true })
        .eq("configuration_type_id", type.id)

      return {
        ...type,
        values_count: count || 0,
      }
    }),
  )

  return typesWithCounts
}

export async function getConfigurationValues(typeId: string): Promise<ConfigurationValue[]> {
  const supabase = await getSupabaseServerClient()

  // Intentar ordenar por is_default primero, pero si la columna no existe, solo ordenar por sort_order
  let query = supabase
    .from("configuration_values")
    .select("*")
    .eq("configuration_type_id", typeId)
    .order("sort_order", { ascending: true })

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching configuration values:", error)
    return []
  }

  // Si tenemos datos y la columna is_default existe, ordenar manualmente
  // para poner los valores por defecto primero
  if (data && data.length > 0 && 'is_default' in (data[0] || {})) {
    return data.sort((a: any, b: any) => {
      // Primero por is_default (true primero)
      if (a.is_default && !b.is_default) return -1
      if (!a.is_default && b.is_default) return 1
      // Luego por sort_order
      return (a.sort_order || 0) - (b.sort_order || 0)
    })
  }

  return data || []
}

/**
 * Obtiene el valor de configuración por defecto para un tipo dado
 * @param typeId ID del tipo de configuración
 * @returns El valor por defecto si existe, null en caso contrario
 */
export async function getDefaultConfigurationValue(typeId: string): Promise<ConfigurationValue | null> {
  const supabase = await getSupabaseServerClient()

  // Primero verificar si la columna is_default existe
  const { data: allValues, error: checkError } = await supabase
    .from("configuration_values")
    .select("*")
    .eq("configuration_type_id", typeId)
    .eq("is_active", true)
    .limit(1)

  if (checkError || !allValues || allValues.length === 0) {
    return null
  }

  // Verificar si la columna is_default existe
  if (!allValues[0] || !('is_default' in allValues[0])) {
    return null
  }

  // Si existe, buscar el valor por defecto
  const { data, error } = await supabase
    .from("configuration_values")
    .select("*")
    .eq("configuration_type_id", typeId)
    .eq("is_default", true)
    .eq("is_active", true)
    .single()

  if (error) {
    // No es un error si no hay valor por defecto
    if (error.code === "PGRST116") {
      return null
    }
    console.error("[v0] Error fetching default configuration value:", error)
    return null
  }

  return data || null
}
