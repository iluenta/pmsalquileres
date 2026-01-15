import { getSupabaseServerClient } from "@/lib/supabase/server"
import { CONFIG_CODES } from "@/lib/constants/config"

export interface Property {
  id: string
  property_code: string
  name: string
  slug?: string // Slug único para URLs de guías públicas (opcional hasta que se ejecute el script SQL)
  description: string | null
  image_url: string | null // URL de la imagen principal de la propiedad
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
  min_nights: number | null // Número mínimo de noches para reservas comerciales
  base_price_per_night: number | null
  check_in_instructions: string | null
  landing_config: any | null
  is_active: boolean
  created_at: string
}

export interface CreatePropertyData {
  property_code: string
  name: string
  slug?: string // Opcional, se genera automáticamente si no se proporciona
  description?: string | null
  image_url?: string | null // URL de la imagen principal de la propiedad
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
  slug?: string // Opcional, se valida unicidad si se proporciona
  description?: string | null
  image_url?: string | null // URL de la imagen principal de la propiedad
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

export async function getProperties(): Promise<Property[]> {
  const supabase = await getSupabaseServerClient()

  // Seleccionar campos explícitamente para evitar errores si slug o image_url no existen todavía
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
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching properties:", error)
    // Si el error es porque slug o image_url no existen, intentar sin ellos
    if (error.message?.includes('slug') || error.message?.includes('image_url') || error.code === '42703') {
      console.log("[v0] Slug or image_url column not found, fetching without them")
      const { data: dataWithoutOptional, error: errorWithoutOptional } = await supabase
        .from("properties")
        .select(
          `
          id,
          property_code,
          name,
          description,
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
          is_active,
          created_at,
          property_type:configuration_values!properties_property_type_id_fkey(label, color)
        `,
        )
        .order("created_at", { ascending: false })

      if (errorWithoutOptional) {
        console.error("[v0] Error fetching properties without optional columns:", errorWithoutOptional)
        return []
      }

      return (dataWithoutOptional || []) as Property[]
    }
    return []
  }

  return data || []
}

export async function getProperty(propertyId: string): Promise<Property | null> {
  const supabase = await getSupabaseServerClient()

  // Seleccionar campos explícitamente
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
    .single()

  if (error) {
    console.error("[v0] Error fetching property:", error)
    // Si el error es porque slug o image_url no existen, intentar sin ellos
    if (error.message?.includes('slug') || error.message?.includes('image_url') || error.code === '42703') {
      const { data: dataWithoutOptional, error: errorWithoutOptional } = await supabase
        .from("properties")
        .select(
          `
          id,
          property_code,
          name,
          description,
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
          is_active,
          created_at,
          property_type:configuration_values!properties_property_type_id_fkey(label, color)
        `,
        )
        .eq("id", propertyId)
        .single()

      if (errorWithoutOptional) {
        console.error("[v0] Error fetching property without optional columns:", errorWithoutOptional)
        return null
      }

      return dataWithoutOptional as Property | null
    }
    return null
  }

  return data
}

export async function getPropertyById(propertyId: string, tenantId: string) {
  const supabase = await getSupabaseServerClient()

  // Seleccionar campos explícitamente
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
    .single()

  if (error) {
    console.error("[v0] Error fetching property:", error)
    // Si el error es porque slug o image_url no existen, intentar sin ellos
    if (error.message?.includes('slug') || error.message?.includes('image_url') || error.code === '42703') {
      const { data: dataWithoutOptional, error: errorWithoutOptional } = await supabase
        .from("properties")
        .select(
          `
          id,
          property_code,
          name,
          description,
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
          is_active,
          created_at,
          property_type:configuration_values!properties_property_type_id_fkey(label, color)
        `,
        )
        .eq("id", propertyId)
        .eq("tenant_id", tenantId)
        .single()

      if (errorWithoutOptional) {
        console.error("[v0] Error fetching property without optional columns:", errorWithoutOptional)
        return null
      }

      return dataWithoutOptional
    }
    return null
  }

  return data
}

export async function getPropertyTypes(tenantId: string) {
  const supabase = await getSupabaseServerClient()

  // Get property type configuration using the stable code
  const { data: configType } = await supabase
    .from("configuration_types")
    .select("id, name")
    .eq("tenant_id", tenantId)
    .eq("code", CONFIG_CODES.PROPERTY_TYPE)
    .single()

  let finalConfigTypeId: string

  if (!configType) {
    console.warn("[v0] No property type configuration found with code:", CONFIG_CODES.PROPERTY_TYPE, "for tenant:", tenantId)
    // Fallback to name-based search for legacy support
    const { data: legacyConfigType } = await supabase
      .from("configuration_types")
      .select("id, name")
      .eq("tenant_id", tenantId)
      .or("name.eq.Tipo de Propiedad,name.eq.property_type,name.eq.Tipos de Propiedades,name.eq.property_types")
      .single()

    if (!legacyConfigType) {
      console.error("[v0] No property type configuration found for tenant:", tenantId)
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

  console.log("[v0] Found property types:", data?.length || 0)
  return data || []
}

/**
 * Obtiene una propiedad por su slug usando el cliente público (sin autenticación)
 * Para uso en páginas públicas
 * @param slug Slug de la propiedad
 * @returns Propiedad encontrada o null
 */
/**
 * @deprecated Usar getPropertyBySlugPublic de lib/api/properties-public.ts en su lugar
 * Esta función se mantiene solo para compatibilidad
 */
export async function getPropertyBySlugPublic(slug: string): Promise<Property | null> {
  // Re-exportar la función limpia desde properties-public
  const { getPropertyBySlugPublic: getPropertyBySlugPublicClean } = await import('./properties-public')
  return getPropertyBySlugPublicClean(slug)
}

/**
 * Obtiene una propiedad por su slug (requiere autenticación)
 * Para uso en páginas privadas del dashboard
 * @param slug Slug de la propiedad
 * @returns Propiedad encontrada o null
 */
export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const supabase = await getSupabaseServerClient()

  // Normalizar el slug a minúsculas para la búsqueda (los slugs se guardan en minúsculas)
  const normalizedSlug = slug.toLowerCase().trim()

  // Verificar primero si la columna slug existe
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
    .maybeSingle()

  if (error) {
    // Si el error es porque la columna slug o image_url no existe, retornar null
    if (error.message?.includes('slug') || error.message?.includes('image_url') || error.code === '42703') {
      console.log("[v0] Slug or image_url column does not exist yet. Please run the migration script.")
      return null
    }
    console.error("[v0] Error fetching property by slug:", error)
    return null
  }

  return data
}

/**
 * Valida si un slug es único
 * @param slug Slug a validar
 * @param excludePropertyId ID de propiedad a excluir (para actualizaciones)
 * @returns true si el slug es único, false si ya existe
 */
export async function validateSlugUniqueness(
  slug: string,
  excludePropertyId?: string
): Promise<boolean> {
  const supabase = await getSupabaseServerClient()

  let query = supabase
    .from("properties")
    .select("id")
    .eq("slug", slug)
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

/**
 * Crea una nueva propiedad
 * @param data Datos de la propiedad
 * @param tenantId ID del tenant
 * @returns Propiedad creada o null
 */
export async function createProperty(
  data: CreatePropertyData,
  tenantId: string
): Promise<Property | null> {
  const supabase = await getSupabaseServerClient()

  // El slug se generará automáticamente por el trigger si no se proporciona
  const propertyData = {
    ...data,
    tenant_id: tenantId,
    slug: data.slug || null, // Si no se proporciona, el trigger lo generará
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
    .single()

  if (error) {
    console.error("[v0] Error creating property:", error)
    throw error
  }

  return property
}

/**
 * Actualiza una propiedad existente
 * @param propertyId ID de la propiedad
 * @param data Datos a actualizar
 * @param tenantId ID del tenant
 * @returns Propiedad actualizada o null
 */
export async function updateProperty(
  propertyId: string,
  data: UpdatePropertyData,
  tenantId: string
): Promise<Property | null> {
  const supabase = await getSupabaseServerClient()

  // Si se proporciona un slug, validar unicidad
  if (data.slug) {
    const isUnique = await validateSlugUniqueness(data.slug, propertyId)
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
    .single()

  if (error) {
    console.error("[v0] Error updating property:", error)
    throw error
  }

  return property
}
