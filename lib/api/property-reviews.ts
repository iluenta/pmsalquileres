// Funciones API para gestionar reseñas de propiedades

import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { PropertyReview, CreatePropertyReviewData, UpdatePropertyReviewData } from "@/types/property-reviews"

/**
 * Obtiene todas las reseñas de una propiedad (solo aprobadas para público)
 */
export async function getPropertyReviews(
  propertyId: string,
  tenantId: string,
  includeUnapproved: boolean = false
): Promise<PropertyReview[]> {
  const supabase = await getSupabaseServerClient()

  let query = supabase
    .from("property_reviews")
    .select("*")
    .eq("property_id", propertyId)
    .eq("tenant_id", tenantId)
    .order("review_date", { ascending: false })

  if (!includeUnapproved) {
    query = query.eq("is_approved", true)
  }

  const { data, error } = await query

  if (error) {
    console.error("[getPropertyReviews] Error:", error)
    throw new Error(`Error al obtener reseñas: ${error.message}`)
  }

  return (data || []) as PropertyReview[]
}

/**
 * Obtiene reseñas públicas aprobadas de una propiedad (para landing)
 */
export async function getPropertyReviewsPublic(propertyId: string): Promise<PropertyReview[]> {
  const { createClient } = await import("@supabase/supabase-js")
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabasePublic = createClient(supabaseUrl, supabaseAnonKey)

  const { data, error } = await supabasePublic
    .from("property_reviews")
    .select("*")
    .eq("property_id", propertyId)
    .eq("is_approved", true)
    .order("review_date", { ascending: false })

  if (error) {
    console.error("[getPropertyReviewsPublic] Error:", error)
    return []
  }

  return (data || []) as PropertyReview[]
}

/**
 * Calcula el rating promedio de una propiedad
 */
export async function getPropertyAverageRating(propertyId: string, tenantId: string): Promise<number | null> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("property_reviews")
    .select("rating")
    .eq("property_id", propertyId)
    .eq("tenant_id", tenantId)
    .eq("is_approved", true)

  if (error) {
    console.error("[getPropertyAverageRating] Error:", error)
    return null
  }

  if (!data || data.length === 0) {
    return null
  }

  const sum = data.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0)
  return Math.round((sum / data.length) * 10) / 10 // Redondear a 1 decimal
}

/**
 * Obtiene una reseña por ID
 */
export async function getPropertyReview(id: string, tenantId: string): Promise<PropertyReview | null> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("property_reviews")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single()

  if (error) {
    console.error("[getPropertyReview] Error:", error)
    return null
  }

  return data as PropertyReview
}

/**
 * Crea una nueva reseña
 */
export async function createPropertyReview(
  data: CreatePropertyReviewData,
  userId?: string
): Promise<PropertyReview> {
  const supabase = await getSupabaseServerClient()

  const { data: review, error } = await supabase
    .from("property_reviews")
    .insert({
      ...data,
      is_approved: data.is_approved ?? false,
      source: data.source ?? 'manual',
      created_by: userId || null,
    })
    .select()
    .single()

  if (error) {
    console.error("[createPropertyReview] Error:", error)
    throw new Error(`Error al crear reseña: ${error.message}`)
  }

  return review as PropertyReview
}

/**
 * Actualiza una reseña existente
 */
export async function updatePropertyReview(
  id: string,
  data: UpdatePropertyReviewData,
  tenantId: string
): Promise<PropertyReview> {
  const supabase = await getSupabaseServerClient()

  // Verificar que la reseña pertenece al tenant
  const existing = await getPropertyReview(id, tenantId)
  if (!existing) {
    throw new Error("Reseña no encontrada o no tienes permisos")
  }

  const { data: review, error } = await supabase
    .from("property_reviews")
    .update(data)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .select()
    .single()

  if (error) {
    console.error("[updatePropertyReview] Error:", error)
    throw new Error(`Error al actualizar reseña: ${error.message}`)
  }

  return review as PropertyReview
}

/**
 * Elimina una reseña
 */
export async function deletePropertyReview(id: string, tenantId: string): Promise<void> {
  const supabase = await getSupabaseServerClient()

  // Verificar que la reseña pertenece al tenant
  const existing = await getPropertyReview(id, tenantId)
  if (!existing) {
    throw new Error("Reseña no encontrada o no tienes permisos")
  }

  const { error } = await supabase
    .from("property_reviews")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenantId)

  if (error) {
    console.error("[deletePropertyReview] Error:", error)
    throw new Error(`Error al eliminar reseña: ${error.message}`)
  }
}

/**
 * Aprueba una reseña
 */
export async function approvePropertyReview(id: string, tenantId: string): Promise<PropertyReview> {
  return updatePropertyReview(id, { is_approved: true }, tenantId)
}

/**
 * Rechaza una reseña
 */
export async function rejectPropertyReview(id: string, tenantId: string): Promise<PropertyReview> {
  return updatePropertyReview(id, { is_approved: false }, tenantId)
}


