// Tipos para el sistema de planes de precios de propiedades

export type PricingPlanType = 'night' | 'week' | 'fortnight'
export type PricingSeason = 'high' | 'low' | 'all'

export interface PropertyPricingPlan {
  id: string
  property_id: string
  tenant_id: string
  plan_type: PricingPlanType
  season: PricingSeason
  base_price: number
  discount_percentage: number // 0-100
  final_price: number // Calculado: base_price * (1 - discount_percentage/100)
  description: string | null
  features: string[] // Array de características incluidas
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CreatePropertyPricingPlanData {
  property_id: string
  tenant_id: string
  plan_type: PricingPlanType
  season: PricingSeason
  base_price: number
  discount_percentage?: number // Default 0, solo para week/fortnight
  description?: string | null
  features?: string[]
  is_active?: boolean
  sort_order?: number
}

export interface UpdatePropertyPricingPlanData {
  plan_type?: PricingPlanType
  season?: PricingSeason
  base_price?: number
  discount_percentage?: number
  description?: string | null
  features?: string[]
  is_active?: boolean
  sort_order?: number
}


