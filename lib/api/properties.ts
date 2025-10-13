import { getSupabaseServerClient } from "@/lib/supabase/server"

export interface Property {
  id: string
  property_code: string
  name: string
  description: string | null
  property_type_id: string | null
  property_type?: {
    label: string
    color: string | null
  }
  street: string | null
  city: string | null
  province: string | null
  country: string | null
  bedrooms: number | null
  bathrooms: number | null
  max_guests: number | null
  base_price_per_night: number | null
  is_active: boolean
  created_at: string
}

export async function getProperties(tenantId: string): Promise<Property[]> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("properties")
    .select(
      `
      *,
      property_type:configuration_values!properties_property_type_id_fkey(label, color)
    `,
    )
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching properties:", error)
    return []
  }

  return data || []
}

export async function getPropertyById(propertyId: string, tenantId: string) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("properties")
    .select(
      `
      *,
      property_type:configuration_values!properties_property_type_id_fkey(label, color)
    `,
    )
    .eq("id", propertyId)
    .eq("tenant_id", tenantId)
    .single()

  if (error) {
    console.error("[v0] Error fetching property:", error)
    return null
  }

  return data
}

export async function getPropertyTypes(tenantId: string) {
  const supabase = await getSupabaseServerClient()

  // Get property type configuration - try multiple possible names
  const { data: configType } = await supabase
    .from("configuration_types")
    .select("id, name")
    .eq("tenant_id", tenantId)
    .or("name.eq.Tipo de Propiedad,name.eq.property_type,name.eq.Tipos de Propiedades,name.eq.property_types")
    .single()

  if (!configType) {
    console.error("[v0] No property type configuration found for tenant:", tenantId)
    return []
  }

  console.log("[v0] Found property type config:", configType.name, "for tenant:", tenantId)

  const { data, error } = await supabase
    .from("configuration_values")
    .select("*")
    .eq("configuration_type_id", configType.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching property types:", error)
    return []
  }

  console.log("[v0] Found property types:", data?.length || 0)
  return data || []
}
