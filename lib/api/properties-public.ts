import { createClient } from '@supabase/supabase-js'
import type { Property } from './properties'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabasePublic = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Obtiene una propiedad por su slug (acceso público)
 * @param slug Slug de la propiedad
 * @returns Propiedad encontrada o null
 */
export async function getPropertyBySlugPublic(slug: string): Promise<Property | null> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[properties-public] Missing Supabase environment variables')
      return null
    }

    const normalizedSlug = slug.toLowerCase().trim()

    const { data, error } = await supabasePublic
      .from('properties')
      .select(`
        id,
        property_code,
        name,
        slug,
        description,
        image_url,
        property_type_id,
        street,
        city,
        province,
        country,
        bedrooms,
        bathrooms,
        max_guests,
        min_nights,
        base_price_per_night,
        is_active,
        created_at,
        tenant_id
      `)
      .eq('slug', normalizedSlug)
      .eq('is_active', true)
      .maybeSingle()

    if (error) {
      console.error('[properties-public] Error fetching property by slug:', error)
      return null
    }

    return data as Property & { tenant_id: string } | null
  } catch (error) {
    console.error('[properties-public] Exception fetching property by slug:', error)
    return null
  }
}

/**
 * Obtiene el tenant_id de una propiedad por su ID
 * @param propertyId ID de la propiedad
 * @returns tenant_id o null
 */
export async function getPropertyTenantId(propertyId: string): Promise<string | null> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[properties-public] Missing Supabase environment variables')
      return null
    }

    const { data, error } = await supabasePublic
      .from('properties')
      .select('tenant_id')
      .eq('id', propertyId)
      .maybeSingle()

    if (error) {
      console.error('[properties-public] Error fetching tenant_id:', error)
      return null
    }

    return data?.tenant_id || null
  } catch (error) {
    console.error('[properties-public] Exception fetching tenant_id:', error)
    return null
  }
}

