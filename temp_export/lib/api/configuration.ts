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
}

export async function getConfigurationTypes(tenantId: string): Promise<ConfigurationType[]> {
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

  const { data, error } = await supabase
    .from("configuration_values")
    .select("*")
    .eq("configuration_type_id", typeId)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching configuration values:", error)
    return []
  }

  return data || []
}
