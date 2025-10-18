// Tipos para el sistema de guías de propiedades

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
  latitude?: number | null
  longitude?: number | null
}

export interface Guide {
  id: string
  property_id: string
  title: string
  welcome_message: string | null
  host_names: string | null
  host_signature: string | null
  latitude: number | null
  longitude: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GuideSection {
  id: string
  guide_id: string
  section_type: "apartment" | "rules" | "house_guide" | "tips" | "contact"
  title: string
  content: string
  icon: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface Beach {
  id: string
  name: string
  description: string | null
  distance: number | null
  amenities: string[] | null
  created_at: string
}

export interface Restaurant {
  id: string
  name: string
  description: string | null
  cuisine_type: string | null
  price_range: string | null
  distance: number | null
  created_at: string
}

export interface Activity {
  id: string
  name: string
  description: string | null
  activity_type: string | null
  duration: string | null
  distance: number | null
  created_at: string
}

export interface HouseRule {
  id: string
  title: string
  description: string
  icon: string
  order_index: number
  created_at: string
}

export interface HouseGuideItem {
  id: string
  title: string
  description: string
  icon: string
  order_index: number
  created_at: string
}

export interface Tip {
  id: string
  title: string
  description: string
  icon: string
  order_index: number
  created_at: string
}

export interface ContactInfo {
  id: string
  contact_type: string
  value: string
  icon: string
  order_index: number
  created_at: string
}

export interface PracticalInfo {
  id: string
  title: string
  description: string
  icon: string
  order_index: number
  created_at: string
}

// Tipos para operaciones CRUD
export interface CreateGuideData {
  property_id: string
  title: string
  welcome_message?: string
  host_names?: string
  host_signature?: string
  latitude?: number
  longitude?: number
}

export interface UpdateGuideData {
  title?: string
  welcome_message?: string
  host_names?: string
  host_signature?: string
  latitude?: number
  longitude?: number
  is_active?: boolean
}

export interface CreateGuideSectionData {
  guide_id: string
  section_type: "apartment" | "rules" | "house_guide" | "tips" | "contact"
  title: string
  content: string
  icon: string
  order_index?: number
}

export interface UpdateGuideSectionData {
  title?: string
  content?: string
  icon?: string
  order_index?: number
}

// Tipos para datos completos
export interface CompleteGuideData {
  guide: Guide
  property: Property
  sections: GuideSection[]
  beaches: Beach[]
  restaurants: Restaurant[]
  activities: Activity[]
  house_rules: HouseRule[]
  house_guide_items: HouseGuideItem[]
  tips: Tip[]
  contact_info: ContactInfo[]
  practical_info: PracticalInfo[]
}

export interface PropertyGuide {
  id: string
  property_id: string
  title: string
  welcome_message: string | null
  host_names: string | null
  host_signature: string | null
  latitude: number | null
  longitude: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}
