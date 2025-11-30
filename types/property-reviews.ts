// Tipos para el sistema de reseñas de propiedades

export interface PropertyReview {
  id: string
  property_id: string
  tenant_id: string
  guest_name: string
  person_id: string | null
  booking_id: string | null
  rating: number // 1-5
  comment: string
  review_date: string // ISO date string
  is_approved: boolean
  source: 'manual' | 'external' | 'booking'
  external_id: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface CreatePropertyReviewData {
  property_id: string
  tenant_id: string
  guest_name: string
  person_id?: string | null
  booking_id?: string | null
  rating: number
  comment: string
  review_date: string // ISO date string
  is_approved?: boolean
  source?: 'manual' | 'external' | 'booking'
  external_id?: string | null
}

export interface UpdatePropertyReviewData {
  guest_name?: string
  person_id?: string | null
  booking_id?: string | null
  rating?: number
  comment?: string
  review_date?: string
  is_approved?: boolean
  source?: 'manual' | 'external' | 'booking'
  external_id?: string | null
}


