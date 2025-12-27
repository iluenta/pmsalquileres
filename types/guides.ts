// Tipos para el sistema de guías de propiedades

export interface Property {
  id: string
  property_code: string
  name: string
  slug?: string // Slug único para URLs de guías públicas (opcional hasta que se ejecute el script SQL)
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
  locality: string | null
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
  tenant_id: string
  section_type: "apartment" | "rules" | "house_guide" | "tips" | "contact"
  title: string
  content: string
  icon: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GuidePlace {
  id: string
  guide_id: string
  tenant_id: string
  name: string
  description: string | null
  place_type: string
  distance: number | null
  rating: number | null
  image_url: string | null
  order_index: number
  created_at: string
  updated_at: string
}

export interface ApartmentSection {
  id: string
  guide_id: string
  tenant_id: string
  section_type: string
  title: string
  description: string
  details: string
  image_url: string
  icon: string
  order_index: number
  amenities: string[]
  created_at: string
  updated_at: string
}

export interface Beach {
  id: string
  guide_id: string
  tenant_id: string
  name: string
  description: string | null
  address: string | null // Dirección de la playa
  distance: number | null
  amenities: string[] | null
  image_url: string | null
  rating: number | null
  review_count: number | null
  price_range: string | null
  badge: string | null
  url: string | null // URL de la playa (Google Maps o website)
  order_index: number
  created_at: string
  updated_at: string
}

export interface Restaurant {
  id: string
  guide_id: string
  tenant_id: string
  name: string
  description: string | null
  address: string | null // Dirección del restaurante
  cuisine_type: string | null
  price_range: string | null
  distance: number | null
  image_url: string | null
  rating: number | null
  review_count: number | null
  badge: string | null
  url: string | null // URL del restaurante (Google Maps o website)
  order_index: number
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  guide_id: string
  tenant_id: string
  name: string
  description: string | null
  address: string | null // Dirección de la actividad
  activity_type: string | null
  duration: string | null
  distance: number | null
  price_info: string | null
  price_range: string | null
  rating: number | null
  review_count: number | null
  badge: string | null
  image_url: string | null
  url: string | null // URL de la actividad (Google Maps o website)
  order_index: number
  created_at: string
  updated_at: string
}

export interface HouseRule {
  id: string
  guide_id: string
  tenant_id: string
  title: string
  description: string
  icon: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface HouseGuideItem {
  id: string
  guide_id: string
  tenant_id: string
  title: string
  description: string
  details: string
  icon: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface Tip {
  id: string
  guide_id: string
  tenant_id: string
  title: string
  description: string
  details: string
  icon: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface ContactInfo {
  id: string
  contact_type: string
  value: string
  icon: string
  order_index: number
  created_at: string
}

export interface InterestPhoneContact {
  name: string
  phone: string
  address?: string | null
  description?: string | null
}

export interface InterestPhoneCategory {
  category: 'emergencias' | 'policia' | 'bomberos' | 'farmacia' | 'veterinario' | 'medico' | 'otros'
  contacts: InterestPhoneContact[]
}

export interface GuideContactInfo {
  id: string
  guide_id: string
  tenant_id: string
  host_names: string | null
  phone: string | null
  email: string | null
  whatsapp: string | null
  host_message?: string | null
  support_person_name?: string | null
  support_person_phone?: string | null
  support_person_whatsapp?: string | null
  emergency_numbers: {
    emergencias: string
    policia_local: string
    guardia_civil: string
    bomberos: string
  } | null
  interest_phones?: InterestPhoneCategory[] | null
  emergency_phone: string | null
  medical_contact: string | null
  police_contact: string | null
  fire_contact: string | null
  service_issues: string[] | null
  created_at: string
  updated_at: string
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
  locality?: string
}

export interface UpdateGuideData {
  title?: string
  welcome_message?: string
  host_names?: string
  host_signature?: string
  latitude?: number
  longitude?: number
  locality?: string
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
  section_type?: "apartment" | "rules" | "house_guide" | "tips" | "contact"
  title?: string
  content?: string
  icon?: string
  order_index?: number
}

export interface CreateApartmentSectionData {
  guide_id: string
  section_type: string
  title: string
  description: string
  details: string
  content: string
  image_url: string
  icon: string
  order_index?: number
  amenities: string[]
}

export interface UpdateApartmentSectionData {
  section_type?: string
  title?: string
  description?: string
  details?: string
  content?: string
  image_url?: string
  icon?: string
  order_index?: number
  amenities?: string[]
}

export interface CreateBeachData {
  guide_id: string
  name: string
  description?: string | null
  address?: string | null
  distance?: number | null
  amenities?: string[] | null
  image_url?: string | null
  rating?: number | null
  review_count?: number | null
  price_range?: string | null
  badge?: string | null
  url?: string | null
  order_index?: number
}

export interface UpdateBeachData {
  name?: string
  description?: string | null
  address?: string | null
  distance?: number | null
  amenities?: string[] | null
  image_url?: string | null
  rating?: number | null
  review_count?: number | null
  price_range?: string | null
  badge?: string | null
  url?: string | null
  order_index?: number
}

export interface CreateRestaurantData {
  guide_id: string
  name: string
  description?: string | null
  address?: string | null
  cuisine_type?: string | null
  price_range?: string | null
  distance?: number | null
  image_url?: string | null
  rating?: number | null
  review_count?: number | null
  badge?: string | null
  url?: string | null
  order_index?: number
}

export interface UpdateRestaurantData {
  name?: string
  description?: string | null
  address?: string | null
  cuisine_type?: string | null
  price_range?: string | null
  distance?: number | null
  image_url?: string | null
  rating?: number | null
  review_count?: number | null
  badge?: string | null
  url?: string | null
  order_index?: number
}

export interface CreateActivityData {
  guide_id: string
  name: string
  description?: string | null
  address?: string | null
  activity_type?: string | null
  duration?: string | null
  distance?: number | null
  price_info?: string | null
  price_range?: string | null
  rating?: number | null
  review_count?: number | null
  badge?: string | null
  image_url?: string | null
  url?: string | null
  order_index?: number
}

export interface UpdateActivityData {
  name?: string
  description?: string | null
  address?: string | null
  activity_type?: string | null
  duration?: string | null
  distance?: number | null
  price_info?: string | null
  price_range?: string | null
  rating?: number | null
  review_count?: number | null
  badge?: string | null
  image_url?: string | null
  url?: string | null
  order_index?: number
}

export interface CreateGuidePlaceData {
  guide_id: string
  name: string
  description?: string | null
  place_type: string
  distance?: number | null
  rating?: number | null
  badge?: string | null
  image_url?: string | null
  order_index?: number
}

export interface UpdateGuidePlaceData {
  name?: string
  description?: string | null
  place_type?: string
  distance?: number | null
  rating?: number | null
  badge?: string | null
  image_url?: string | null
  order_index?: number
}

export interface CreateHouseRuleData {
  guide_id: string
  title: string
  description: string
  icon: string
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
  description: string
  details: string
  icon: string
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
  host_names?: string | null
  phone?: string | null
  email?: string | null
  whatsapp?: string | null
  host_message?: string | null
  support_person_name?: string | null
  support_person_phone?: string | null
  support_person_whatsapp?: string | null
  emergency_numbers?: {
    emergencias: string
    policia_local: string
    guardia_civil: string
    bomberos: string
  } | null
  interest_phones?: InterestPhoneCategory[] | null
  emergency_phone?: string | null
  medical_contact?: string | null
  police_contact?: string | null
  fire_contact?: string | null
  service_issues?: string[] | null
}

export interface UpdateContactInfoData {
  host_names?: string | null
  phone?: string | null
  email?: string | null
  whatsapp?: string | null
  host_message?: string | null
  support_person_name?: string | null
  support_person_phone?: string | null
  support_person_whatsapp?: string | null
  emergency_numbers?: {
    emergencias: string
    policia_local: string
    guardia_civil: string
    bomberos: string
  } | null
  interest_phones?: InterestPhoneCategory[] | null
  emergency_phone?: string | null
  medical_contact?: string | null
  police_contact?: string | null
  fire_contact?: string | null
  service_issues?: string[] | null
}

export interface CreatePracticalInfoData {
  guide_id: string
  category: string
  title: string
  description?: string | null
  details?: string | null
  icon?: string | null
  image_url?: string | null
  order_index?: number
}

export interface UpdatePracticalInfoData {
  category?: string
  title?: string
  description?: string | null
  details?: string | null
  icon?: string | null
  image_url?: string | null
  order_index?: number
}

export interface CreateTipData {
  guide_id: string
  title: string
  description: string
  details: string
  icon: string
  order_index?: number
}

export interface UpdateTipData {
  title?: string
  description?: string
  details?: string
  icon?: string
  order_index?: number
}

// Tipos para datos completos
export interface CompleteGuideData {
  guide: Guide
  property: Property
  sections: GuideSection[]
  apartment_sections: ApartmentSection[]
  beaches: Beach[]
  restaurants: Restaurant[]
  activities: Activity[]
  house_rules: HouseRule[]
  house_guide_items: HouseGuideItem[]
  tips: Tip[]
  contact_info: ContactInfo[]
  practical_info: PracticalInfo[]
}

export interface CompleteGuideDataResponse {
  property: {
    id: string
    name: string
    address: string
    description: string | null
    locality: string | null
    latitude: number | null
    longitude: number | null
  }
  guide: PropertyGuide
  sections: GuideSection[]
  apartment_sections: ApartmentSection[]
  beaches: Beach[]
  restaurants: Restaurant[]
  activities: Activity[]
  house_rules: HouseRule[]
  house_guide_items: HouseGuideItem[]
  tips: Tip[]
  contact_info: GuideContactInfo | null
  practical_info: PracticalInfo[]
}

export interface GuideData {
  guide: Guide | null
  property: Property | null
  sections: GuideSection[]
  apartment_sections: ApartmentSection[]
  beaches: Beach[]
  restaurants: Restaurant[]
  activities: Activity[]
  house_rules: HouseRule[]
  house_guide_items: HouseGuideItem[]
  tips: Tip[]
  contact_info: GuideContactInfo | null
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
  locality: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
