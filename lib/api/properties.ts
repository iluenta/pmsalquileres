import { getSupabaseServerClient } from "@/lib/supabase/server"
import { CONFIG_CODES } from "@/lib/constants/config"

export interface Property {
  id: string
  property_code: string
  name: string
  slug?: string
  description: string | null
  image_url: string | null
  property_type_id: string | null
  property_type?: {
    label: string
    color: string | null
  }
  street: string | null
  number: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  country: string | null
  bedrooms: number | null
  bathrooms: number | null
  max_guests: number | null
  min_nights: number | null
  base_price_per_night: number | null
  check_in_instructions: string | null
  landing_config: any | null
  is_active: boolean
  created_at: string
}

export interface CreatePropertyData {
  property_code: string
  name: string
  slug?: string
  description?: string | null
  image_url?: string | null
  property_type_id?: string | null
  street?: string | null
  number?: string | null
  city?: string | null
  province?: string | null
  postal_code?: string | null
  country?: string | null
  bedrooms?: number | null
  bathrooms?: number | null
  max_guests?: number | null
  min_nights?: number | null
  base_price_per_night?: number | null
  check_in_instructions?: string | null
  landing_config?: any | null
  is_active?: boolean
}

export interface UpdatePropertyData {
  property_code?: string
  name?: string
  slug?: string
  description?: string | null
  image_url?: string | null
  property_type_id?: string | null
  street?: string | null
  number?: string | null
  city?: string | null
  province?: string | null
  postal_code?: string | null
  country?: string | null
  bedrooms?: number | null
  bathrooms?: number | null
  max_guests?: number | null
  min_nights?: number | null
  base_price_per_night?: number | null
  check_in_instructions?: string | null
  landing_config?: any | null
  is_active?: boolean
}

export async function getProperties(tenantId: string): Promise<Property[]> {
  const supabase = await getSupabaseServerClient()

  let query = supabase
    .from("properties")
    .select(
      `
      id,
      property_code,
      name,
      slug,
      description,
      image_url,
      property_type_id,
      street,
      number,
      city,
      province,
      postal_code,
      country,
      bedrooms,
      bathrooms,
      max_guests,
      min_nights,
      base_price_per_night,
      check_in_instructions,
      landing_config,
      is_active,
      created_at,
      property_type:configuration_values!properties_property_type_id_fkey(label, color)
    `,
    )
    .eq("tenant_id", tenantId)

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching properties:", error)
    // Fallback logic kept for compatibility with older schema if migration is pending
    if (error.message?.includes('slug') || error.message?.includes('image_url') || error.code === '42703') {
      const { data: dataWithoutOptional } = await supabase
        .from("properties")
        .select(`
          id, property_code, name, description, property_type_id, street, number, 
          city, province, postal_code, country, bedrooms, bathrooms, 
          max_guests, min_nights, base_price_per_night, is_active, created_at,
          property_type:configuration_values!properties_property_type_id_fkey(label, color)
        `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })

      return (dataWithoutOptional || []) as Property[]
    }
    return []
  }

  return data || []
}

export async function getPropertyById(propertyId: string, tenantId: string): Promise<Property | null> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("properties")
    .select(
      `
      id,
      property_code,
      name,
      slug,
      description,
      image_url,
      property_type_id,
      street,
      number,
      city,
      province,
      postal_code,
      country,
      bedrooms,
      bathrooms,
      max_guests,
      min_nights,
      base_price_per_night,
      check_in_instructions,
      landing_config,
      is_active,
      created_at,
      property_type:configuration_values!properties_property_type_id_fkey(label, color)
    `,
    )
    .eq("id", propertyId)
    .eq("tenant_id", tenantId)
    .maybeSingle()

  if (error) {
    console.error("[v0] Error fetching property:", error)
    if (error.message?.includes('slug') || error.message?.includes('image_url') || error.code === '42703') {
      const { data: dataWithoutOptional } = await supabase
        .from("properties")
        .select(`
          id, property_code, name, description, property_type_id, street, number,
          city, province, postal_code, country, bedrooms, bathrooms,
          max_guests, min_nights, base_price_per_night, is_active, created_at,
          property_type:configuration_values!properties_property_type_id_fkey(label, color)
        `)
        .eq("id", propertyId)
        .eq("tenant_id", tenantId)
        .maybeSingle()

      return dataWithoutOptional as Property | null
    }
    return null
  }

  return data
}


export async function getPropertyTypes(tenantId: string) {
  const supabase = await getSupabaseServerClient()

  const { data: configType } = await supabase
    .from("configuration_types")
    .select("id, name")
    .eq("tenant_id", tenantId)
    .eq("code", CONFIG_CODES.PROPERTY_TYPE)
    .maybeSingle()

  let finalConfigTypeId: string

  if (!configType) {
    const { data: legacyConfigType } = await supabase
      .from("configuration_types")
      .select("id, name")
      .eq("tenant_id", tenantId)
      .or("name.eq.Tipo de Propiedad,name.eq.property_type,name.eq.Tipos de Propiedades,name.eq.property_types")
      .maybeSingle()

    if (!legacyConfigType) {
      return []
    }
    finalConfigTypeId = legacyConfigType.id
  } else {
    finalConfigTypeId = configType.id
  }

  const { data, error } = await supabase
    .from("configuration_values")
    .select("*")
    .eq("configuration_type_id", finalConfigTypeId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching property types:", error)
    return []
  }

  if (data && data.length > 0 && 'is_default' in (data[0] || {})) {
    return data.sort((a: any, b: any) => {
      if (a.is_default && !b.is_default) return -1
      if (!a.is_default && b.is_default) return 1
      return (a.sort_order || 0) - (b.sort_order || 0)
    })
  }

  return data || []
}

export async function getPropertyBySlugPublic(slug: string): Promise<Property | null> {
  const { getPropertyBySlugPublic: getPropertyBySlugPublicClean } = await import('./properties-public')
  return getPropertyBySlugPublicClean(slug)
}

export async function getPropertyBySlug(slug: string, tenantId: string): Promise<Property | null> {
  const supabase = await getSupabaseServerClient()
  const normalizedSlug = slug.toLowerCase().trim()

  const { data, error } = await supabase
    .from("properties")
    .select(
      `
      id,
      property_code,
      name,
      slug,
      description,
      image_url,
      property_type_id,
      street,
      number,
      city,
      province,
      postal_code,
      country,
      bedrooms,
      bathrooms,
      max_guests,
      min_nights,
      base_price_per_night,
      check_in_instructions,
      landing_config,
      is_active,
      created_at,
      property_type:configuration_values!properties_property_type_id_fkey(label, color)
    `,
    )
    .eq("slug", normalizedSlug)
    .eq("tenant_id", tenantId)
    .maybeSingle()

  if (error) {
    console.error("[v0] Error fetching property by slug:", error)
    return null
  }

  return data
}

export async function validateSlugUniqueness(
  slug: string,
  tenantId: string,
  excludePropertyId?: string
): Promise<boolean> {
  const supabase = await getSupabaseServerClient()

  let query = supabase
    .from("properties")
    .select("id")
    .eq("slug", slug)
    .eq("tenant_id", tenantId)
    .limit(1)

  if (excludePropertyId) {
    query = query.neq("id", excludePropertyId)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error validating slug uniqueness:", error)
    return false
  }

  return !data || data.length === 0
}

export async function createProperty(
  data: CreatePropertyData,
  tenantId: string
): Promise<Property | null> {
  const supabase = await getSupabaseServerClient()

  const propertyData = {
    ...data,
    tenant_id: tenantId,
    slug: data.slug || null,
  }

  const { data: property, error } = await supabase
    .from("properties")
    .insert(propertyData)
    .select(
      `
      *,
      property_type:configuration_values!properties_property_type_id_fkey(label, color)
    `,
    )
    .maybeSingle()

  if (error) {
    console.error("[v0] Error creating property:", error)
    throw error
  }

  return property
}

export async function updateProperty(
  propertyId: string,
  data: UpdatePropertyData,
  tenantId: string
): Promise<Property | null> {
  const supabase = await getSupabaseServerClient()

  if (data.slug) {
    const isUnique = await validateSlugUniqueness(data.slug, tenantId, propertyId)
    if (!isUnique) {
      throw new Error("El slug ya está en uso por otra propiedad")
    }
  }

  const { data: property, error } = await supabase
    .from("properties")
    .update(data)
    .eq("id", propertyId)
    .eq("tenant_id", tenantId)
    .select(
      `
      *,
      property_type:configuration_values!properties_property_type_id_fkey(label, color)
    `,
    )
    .maybeSingle()

  if (error) {
    console.error("[v0] Error updating property:", error)
    throw error
  }

  return property
}
