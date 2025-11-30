// Funciones API para gestionar highlights de propiedades

import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { PropertyHighlight, CreatePropertyHighlightData, UpdatePropertyHighlightData } from "@/types/property-highlights"

/**
 * Obtiene todos los highlights de una propiedad
 */
export async function getPropertyHighlights(
  propertyId: string,
  tenantId: string
): Promise<PropertyHighlight[]> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("property_highlights")
    .select("*")
    .eq("property_id", propertyId)
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("[getPropertyHighlights] Error:", error)
    throw new Error(`Error al obtener highlights: ${error.message}`)
  }

  return (data || []) as PropertyHighlight[]
}

/**
 * Obtiene highlights públicos de una propiedad (para landing)
 */
export async function getPropertyHighlightsPublic(propertyId: string): Promise<PropertyHighlight[]> {
  const { createClient } = await import("@supabase/supabase-js")
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabasePublic = createClient(supabaseUrl, supabaseAnonKey)

  const { data, error } = await supabasePublic
    .from("property_highlights")
    .select("*")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("[getPropertyHighlightsPublic] Error:", error)
    return []
  }

  return (data || []) as PropertyHighlight[]
}

/**
 * Obtiene un highlight por ID
 */
export async function getPropertyHighlight(id: string, tenantId: string): Promise<PropertyHighlight | null> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("property_highlights")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single()

  if (error) {
    console.error("[getPropertyHighlight] Error:", error)
    return null
  }

  return data as PropertyHighlight
}

/**
 * Crea un nuevo highlight
 */
export async function createPropertyHighlight(data: CreatePropertyHighlightData): Promise<PropertyHighlight> {
  const supabase = await getSupabaseServerClient()

  // Si no se proporciona sort_order, usar el máximo + 1
  if (data.sort_order === undefined) {
    const existing = await getPropertyHighlights(data.property_id, data.tenant_id)
    data.sort_order = existing.length > 0 ? Math.max(...existing.map(h => h.sort_order)) + 1 : 0
  }

  const { data: highlight, error } = await supabase
    .from("property_highlights")
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error("[createPropertyHighlight] Error:", error)
    throw new Error(`Error al crear highlight: ${error.message}`)
  }

  return highlight as PropertyHighlight
}

/**
 * Actualiza un highlight existente
 */
export async function updatePropertyHighlight(
  id: string,
  data: UpdatePropertyHighlightData,
  tenantId: string
): Promise<PropertyHighlight> {
  const supabase = await getSupabaseServerClient()

  // Verificar que el highlight pertenece al tenant
  const existing = await getPropertyHighlight(id, tenantId)
  if (!existing) {
    throw new Error("Highlight no encontrado o no tienes permisos")
  }

  const { data: highlight, error } = await supabase
    .from("property_highlights")
    .update(data)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .select()
    .single()

  if (error) {
    console.error("[updatePropertyHighlight] Error:", error)
    throw new Error(`Error al actualizar highlight: ${error.message}`)
  }

  return highlight as PropertyHighlight
}

/**
 * Elimina un highlight
 */
export async function deletePropertyHighlight(id: string, tenantId: string): Promise<void> {
  const supabase = await getSupabaseServerClient()

  // Verificar que el highlight pertenece al tenant
  const existing = await getPropertyHighlight(id, tenantId)
  if (!existing) {
    throw new Error("Highlight no encontrado o no tienes permisos")
  }

  const { error } = await supabase
    .from("property_highlights")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenantId)

  if (error) {
    console.error("[deletePropertyHighlight] Error:", error)
    throw new Error(`Error al eliminar highlight: ${error.message}`)
  }
}

/**
 * Actualiza el orden de múltiples highlights
 */
export async function updatePropertyHighlightsOrder(
  highlights: Array<{ id: string; sort_order: number }>,
  tenantId: string
): Promise<void> {
  const supabase = await getSupabaseServerClient()

  // Actualizar cada highlight
  for (const highlight of highlights) {
    const { error } = await supabase
      .from("property_highlights")
      .update({ sort_order: highlight.sort_order })
      .eq("id", highlight.id)
      .eq("tenant_id", tenantId)

    if (error) {
      console.error("[updatePropertyHighlightsOrder] Error:", error)
      throw new Error(`Error al actualizar orden: ${error.message}`)
    }
  }
}


