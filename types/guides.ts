// Tipos para el sistema de guías de propiedades en VERAPMS

export interface PropertyGuide {
  id: string
  tenant_id: string
  property_id: string
  title: string
  welcome_message?: string
  host_names?: string
  host_signature?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GuideSection {
  id: string
  tenant_id: string
  guide_id: string
  section_type: "apartment" | "rules" | "house_guide" | "tips" | "contact" | "local_info"
  title?: string
  content?: string
  icon?: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GuidePlace {
  id: string
  tenant_id: string
  guide_id: string
  name: string
  description?: string
  distance?: string
  rating?: number
  badge?: string
  image_url?: string
  place_type: "beach" | "restaurant" | "activity" | "attraction"
  order_index: number
  created_at: string
}

export interface HouseRule {
  id: string
  tenant_id: string
  guide_id: string
  title: string
  description?: string
  icon?: string
  order_index: number
  created_at: string
}

export interface HouseGuideItem {
  id: string
  tenant_id: string
  guide_id: string
  title: string
  description?: string
  details?: string
  icon?: string
  order_index: number
  created_at: string
}

export interface GuideContactInfo {
  id: string
  tenant_id: string
  guide_id: string
  host_names?: string
  phone?: string
  email?: string
  whatsapp?: string
  emergency_numbers?: {
    emergencias: string
    policia_local: string
    guardia_civil: string
    bomberos: string
  }
  service_issues?: string[]
  created_at: string
  updated_at: string
}

export interface PracticalInfo {
  id: string
  tenant_id: string
  guide_id: string
  category: string
  title: string
  description?: string
  details?: Record<string, any>
  icon?: string
  order_index: number
  created_at: string
}

// Tipo principal que agrupa todos los datos de una guía
export interface GuideData {
  property: {
    id: string
    name: string
    address?: string
    description?: string
  }
  guide: PropertyGuide
  sections: GuideSection[]
  places: GuidePlace[]
  house_rules: HouseRule[]
  house_guide_items: HouseGuideItem[]
  contact_info: GuideContactInfo | null
  practical_info: PracticalInfo[]
}

// Tipos para operaciones CRUD
export interface CreateGuideData {
  property_id: string
  title?: string
  welcome_message?: string
  host_names?: string
  host_signature?: string
}

export interface UpdateGuideData {
  title?: string
  welcome_message?: string
  host_names?: string
  host_signature?: string
  is_active?: boolean
}

export interface CreateGuideSectionData {
  guide_id: string
  section_type: "apartment" | "rules" | "house_guide" | "tips" | "contact" | "local_info"
  title?: string
  content?: string
  icon?: string
  order_index?: number
}

export interface UpdateGuideSectionData {
  section_type?: "apartment" | "rules" | "house_guide" | "tips" | "contact" | "local_info"
  title?: string
  content?: string
  icon?: string
  order_index?: number
  is_active?: boolean
}

export interface CreateGuidePlaceData {
  guide_id: string
  name: string
  description?: string
  distance?: string
  rating?: number
  badge?: string
  image_url?: string
  place_type?: "beach" | "restaurant" | "activity" | "attraction"
  order_index?: number
}

export interface UpdateGuidePlaceData {
  name?: string
  description?: string
  distance?: string
  rating?: number
  badge?: string
  image_url?: string
  place_type?: "beach" | "restaurant" | "activity" | "attraction"
  order_index?: number
}

export interface CreateHouseRuleData {
  guide_id: string
  title: string
  description?: string
  icon?: string
  order_index?: number
}

export interface UpdateHouseRuleData {
  title?: string
  description?: string
  icon?: string
  order_index?: number
}

export interface CreateHouseGuideItemData {
  guide_id: string
  title: string
  description?: string
  details?: string
  icon?: string
  order_index?: number
}

export interface UpdateHouseGuideItemData {
  title?: string
  description?: string
  details?: string
  icon?: string
  order_index?: number
}

export interface CreateContactInfoData {
  guide_id: string
  host_names?: string
  phone?: string
  email?: string
  whatsapp?: string
  emergency_numbers?: {
    emergencias: string
    policia_local: string
    guardia_civil: string
    bomberos: string
  }
  service_issues?: string[]
}

export interface UpdateContactInfoData {
  host_names?: string
  phone?: string
  email?: string
  whatsapp?: string
  emergency_numbers?: {
    emergencias: string
    policia_local: string
    guardia_civil: string
    bomberos: string
  }
  service_issues?: string[]
}

export interface CreatePracticalInfoData {
  guide_id: string
  category: string
  title: string
  description?: string
  details?: Record<string, any>
  icon?: string
  order_index?: number
}

export interface UpdatePracticalInfoData {
  category?: string
  title?: string
  description?: string
  details?: Record<string, any>
  icon?: string
  order_index?: number
}
