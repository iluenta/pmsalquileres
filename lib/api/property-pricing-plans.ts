// Funciones API para gestionar planes de precios de propiedades

import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { PropertyPricingPlan, CreatePropertyPricingPlanData, UpdatePropertyPricingPlanData, PricingSeason } from "@/types/property-pricing-plans"

/**
 * Obtiene todos los planes de precios de una propiedad
 */
export async function getPropertyPricingPlans(
  propertyId: string,
  tenantId: string,
  includeInactive: boolean = false
): Promise<PropertyPricingPlan[]> {
  const supabase = await getSupabaseServerClient()

  let query = supabase
    .from("property_pricing_plans")
    .select("*")
    .eq("property_id", propertyId)
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true })
    .order("plan_type", { ascending: true })

  if (!includeInactive) {
    query = query.eq("is_active", true)
  }

  const { data, error } = await query

  if (error) {
    console.error("[getPropertyPricingPlans] Error:", error)
    throw new Error(`Error al obtener planes de precios: ${error.message}`)
  }

  return (data || []) as PropertyPricingPlan[]
}

/**
 * Obtiene planes de precios públicos activos de una propiedad (para landing)
 */
export async function getPropertyPricingPlansPublic(
  propertyId: string,
  season?: PricingSeason
): Promise<PropertyPricingPlan[]> {
  const { createClient } = await import("@supabase/supabase-js")
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabasePublic = createClient(supabaseUrl, supabaseAnonKey)

  let query = supabasePublic
    .from("property_pricing_plans")
    .select("*")
    .eq("property_id", propertyId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("plan_type", { ascending: true })

  // Filtrar por temporada si se proporciona
  if (season) {
    query = query.or(`season.eq.${season},season.eq.all`)
  }

  const { data, error } = await query

  if (error) {
    console.error("[getPropertyPricingPlansPublic] Error:", error)
    return []
  }

  return (data || []) as PropertyPricingPlan[]
}

/**
 * Obtiene un plan de precios por ID
 */
export async function getPropertyPricingPlan(id: string, tenantId: string): Promise<PropertyPricingPlan | null> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("property_pricing_plans")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single()

  if (error) {
    console.error("[getPropertyPricingPlan] Error:", error)
    return null
  }

  return data as PropertyPricingPlan
}

/**
 * Crea un nuevo plan de precios
 */
export async function createPropertyPricingPlan(data: CreatePropertyPricingPlanData): Promise<PropertyPricingPlan> {
  const supabase = await getSupabaseServerClient()

  // Validar que discount_percentage solo se use en week/fortnight
  if (data.plan_type === 'night' && (data.discount_percentage || 0) > 0) {
    throw new Error('El plan tipo "night" no puede tener descuento')
  }

  // Si no se proporciona sort_order, usar el máximo + 1
  if (data.sort_order === undefined) {
    const existing = await getPropertyPricingPlans(data.property_id, data.tenant_id, true)
    data.sort_order = existing.length > 0 ? Math.max(...existing.map(p => p.sort_order)) + 1 : 0
  }

  const { data: plan, error } = await supabase
    .from("property_pricing_plans")
    .insert({
      ...data,
      discount_percentage: data.discount_percentage ?? 0,
      features: data.features ?? [],
      is_active: data.is_active ?? true,
    })
    .select()
    .single()

  if (error) {
    console.error("[createPropertyPricingPlan] Error:", error)
    throw new Error(`Error al crear plan de precios: ${error.message}`)
  }

  return plan as PropertyPricingPlan
}

/**
 * Actualiza un plan de precios existente
 */
export async function updatePropertyPricingPlan(
  id: string,
  data: UpdatePropertyPricingPlanData,
  tenantId: string
): Promise<PropertyPricingPlan> {
  const supabase = await getSupabaseServerClient()

  // Verificar que el plan pertenece al tenant
  const existing = await getPropertyPricingPlan(id, tenantId)
  if (!existing) {
    throw new Error("Plan de precios no encontrado o no tienes permisos")
  }

  // Validar que discount_percentage solo se use en week/fortnight
  const planType = data.plan_type ?? existing.plan_type
  if (planType === 'night' && (data.discount_percentage ?? existing.discount_percentage) > 0) {
    throw new Error('El plan tipo "night" no puede tener descuento')
  }

  const { data: plan, error } = await supabase
    .from("property_pricing_plans")
    .update(data)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .select()
    .single()

  if (error) {
    console.error("[updatePropertyPricingPlan] Error:", error)
    throw new Error(`Error al actualizar plan de precios: ${error.message}`)
  }

  return plan as PropertyPricingPlan
}

/**
 * Elimina un plan de precios
 */
export async function deletePropertyPricingPlan(id: string, tenantId: string): Promise<void> {
  const supabase = await getSupabaseServerClient()

  // Verificar que el plan pertenece al tenant
  const existing = await getPropertyPricingPlan(id, tenantId)
  if (!existing) {
    throw new Error("Plan de precios no encontrado o no tienes permisos")
  }

  const { error } = await supabase
    .from("property_pricing_plans")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenantId)

  if (error) {
    console.error("[deletePropertyPricingPlan] Error:", error)
    throw new Error(`Error al eliminar plan de precios: ${error.message}`)
  }
}

/**
 * Detecta la temporada actual (alta/baja) basándose en el mes
 * Por defecto, considera alta temporada: junio, julio, agosto, diciembre
 */
export function detectCurrentSeason(): 'high' | 'low' {
  const month = new Date().getMonth() + 1 // 1-12
  // Alta temporada: junio (6), julio (7), agosto (8), diciembre (12)
  const highSeasonMonths = [6, 7, 8, 12]
  return highSeasonMonths.includes(month) ? 'high' : 'low'
}


