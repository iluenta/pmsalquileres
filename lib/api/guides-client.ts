import { getSupabaseBrowserClient } from "@/lib/supabase/client"

// Helper function to get current user's tenant_id
async function getCurrentUserTenantId(): Promise<string | null> {
  const supabase = getSupabaseBrowserClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error("[v0] No authenticated user found")
    return null
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    console.error("[v0] Error fetching user tenant:", userError)
    return null
  }

  return userData.tenant_id
}
import {
  getApartmentSectionsClient,
  getBeachesClient,
  getRestaurantsClient,
  getShoppingClient,
  getActivitiesClient,
  getTipsClient,
  getContactInfoClient
} from "./guides-client-additional"
import {
  getApartmentSections,
  createApartmentSection,
  updateApartmentSection,
  deleteApartmentSection,
  createBeach,
  updateBeach,
  deleteBeach,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  createShopping,
  updateShopping,
  deleteShopping,
  createActivity,
  updateActivity,
  deleteActivity,
  getHouseGuideItems,
  createHouseGuideItem,
  updateHouseGuideItem,
  deleteHouseGuideItem,
  getHouseRules,
  createHouseRule,
  updateHouseRule,
  deleteHouseRule,
  getTips,
  createTip,
  updateTip,
  deleteTip
} from "./guides-client-missing"
import type {
  PropertyGuide,
  GuideSection,
  GuidePlace,
  HouseRule,
  HouseGuideItem,
  GuideContactInfo,
  PracticalInfo,
  CreateGuideData,
  UpdateGuideData,
  CreateGuideSectionData,
  UpdateGuideSectionData,
  CreateGuidePlaceData,
  UpdateGuidePlaceData,
  CreateHouseRuleData,
  UpdateHouseRuleData,
  CreateHouseGuideItemData,
  UpdateHouseGuideItemData,
  CreateContactInfoData,
  UpdateContactInfoData,
  CreatePracticalInfoData,
  UpdatePracticalInfoData,
} from "@/types/guides"

// ============================================================================
// PROPERTY GUIDES (Client-side)
// ============================================================================

export async function getPropertyGuideClient(propertyId: string): Promise<PropertyGuide | null> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("property_guides")
    .select("*")
    .eq("property_id", propertyId)
    .maybeSingle()

  if (error) {
    console.error("[v0] Error fetching property guide:", error)
    return null
  }

  return data
}

export async function createPropertyGuideClient(data: CreateGuideData): Promise<PropertyGuide | null> {
  const supabase = getSupabaseBrowserClient()

  const tenantId = await getCurrentUserTenantId()
  if (!tenantId) {
    return null
  }
  // Intentar heredar locality desde properties si no viene en data
  let inheritedLocality: string | null = data.locality ?? null
  if (!inheritedLocality && data.property_id) {
    const { data: prop } = await supabase
      .from('properties')
      .select('city')
      .eq('id', data.property_id)
      .maybeSingle()
    inheritedLocality = (prop?.city as string) || null
  }

  const { data: result, error } = await supabase
    .from("property_guides")
    .insert({
      tenant_id: tenantId,
      property_id: data.property_id,
      title: data.title || "Guía del Huésped",
      welcome_message: data.welcome_message,
      host_names: data.host_names,
      host_signature: data.host_signature,
      latitude: data.latitude,
      longitude: data.longitude,
      locality: inheritedLocality,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating property guide:", error)
    return null
  }

  return result
}

// Alias para compatibilidad con el código existente
export const createGuide = createPropertyGuideClient
export const updateGuide = updatePropertyGuideClient
export const createGuideSection = createGuideSectionClient
export const updateGuideSection = updateGuideSectionClient
export const deleteGuideSection = deleteGuideSectionClient

// Exportar todas las funciones CRUD
export {
  getApartmentSections,
  createApartmentSection,
  updateApartmentSection,
  deleteApartmentSection,
  createBeach,
  updateBeach,
  deleteBeach,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  createShopping,
  updateShopping,
  deleteShopping,
  createActivity,
  updateActivity,
  deleteActivity,
  getHouseGuideItems,
  createHouseGuideItem,
  updateHouseGuideItem,
  deleteHouseGuideItem,
  getHouseRules,
  createHouseRule,
  updateHouseRule,
  deleteHouseRule,
  getTips,
  createTip,
  updateTip,
  deleteTip
}

// ============================================================================
// COMPLETE GUIDE DATA (Client-side)
// ============================================================================

export async function getCompleteGuideData(propertyId: string) {
  try {
    console.log('[v0] Fetching complete guide data for property:', propertyId)
    console.log('[v0] Property ID type:', typeof propertyId)
    console.log('[v0] Property ID length:', propertyId?.length)

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(propertyId)
    if (!isUUID) {
      console.log('[v0] Property ID is not a UUID, likely a slug. Skipping private fetch.')
      return null
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      console.error('[v0] No Supabase client available')
      return null
    }

    console.log('[v0] Supabase client created successfully')

    // Obtener la propiedad (intentar con diferentes combinaciones de campos)
    let property: any = null
    let propertyError: any = null

    // Intentar primero con todos los campos posibles
    const { data: propertyWithAll, error: errorWithAll } = await supabase
      .from('properties')
      .select('id, name, slug, street, number, city, province, postal_code, country, description, latitude, longitude')
      .eq('id', propertyId)
      .maybeSingle()

    if (errorWithAll) {
      // Si el error es por columnas que no existen o error de sintaxis de UUID (aunque ya lo validamos), intentar sin ellas
      // Códigos: 42703 (undefined_column), 22P02 (invalid_text_representation)
      if (errorWithAll.message?.includes('slug') ||
        errorWithAll.message?.includes('latitude') ||
        errorWithAll.message?.includes('longitude') ||
        errorWithAll.code === '42703' ||
        errorWithAll.code === '22P02') {

        console.log('[v0] Expected issue during initial fetch, trying with basic fields. Code:', errorWithAll.code)

        // Intentar sin slug ni coordenadas
        const { data: propertyBasic, error: errorBasic } = await supabase
          .from('properties')
          .select('id, name, street, number, city, province, postal_code, country, description')
          .eq('id', propertyId)
          .maybeSingle()

        if (errorBasic) {
          // Si falla incluso el básico, solo entonces marcamos propertyError si no es un 42501 (RLS)
          if (errorBasic.code !== '42501') {
            propertyError = errorBasic
          }
        } else {
          property = propertyBasic
          if (property) {
            // Añadir campos opcionales como null si no existen
            property.slug = property.slug || null
            property.latitude = property.latitude || null
            property.longitude = property.longitude || null
          }
        }
      } else if (errorWithAll.code !== '42501') {
        // Ignorar errores de RLS (42501) ya que son esperados para guests
        propertyError = errorWithAll
      }
    } else {
      property = propertyWithAll
    }

    if (propertyError) {
      console.error('[v0] Error fetching property:')
      console.error('- Property error:', propertyError)
      console.error('- Error message:', propertyError.message)
      console.error('- Error details:', propertyError.details)
      console.error('- Error hint:', propertyError.hint)
      console.error('- Error code:', propertyError.code)
      console.error('- Property ID:', propertyId)
      // No lanzar el error, retornar null para que el componente maneje el error
      return null
    }

    if (!property) {
      console.log('[v0] Property not found for ID:', propertyId)
      return null
    }

    console.log('[v0] Property found:', property)

    // Obtener la guía
    const guide = await getPropertyGuideClient(propertyId)
    if (!guide) {
      console.log('No guide found for property, returning null')
      return null
    }

    console.log('Guide found, fetching related data...')

    // Obtener todos los datos relacionados
    const [
      sections,
      apartmentSections,
      beaches,
      restaurants,
      shopping,
      activities,
      houseRules,
      houseGuideItems,
      tips,
      contactInfo,
      practicalInfo
    ] = await Promise.all([
      getGuideSectionsClient(guide.id),
      getApartmentSectionsClient(guide.id),
      getBeachesClient(guide.id),
      getRestaurantsClient(guide.id),
      getShoppingClient(guide.id),
      getActivitiesClient(guide.id),
      getHouseRulesClient(guide.id),
      getHouseGuideItemsClient(guide.id),
      getTipsClient(guide.id),
      getContactInfoClient(guide.id),
      getPracticalInfoClient(guide.id)
    ])

    // Construir dirección completa
    const addressParts = [
      property.street ? `${property.street}${property.number ? ` ${property.number}` : ''}` : null,
      property.postal_code,
      property.city,
      property.province,
      property.country
    ].filter(Boolean)

    const fullAddress = addressParts.length > 0
      ? addressParts.join(', ')
      : (property.address || property.street || property.city || '')

    const result = {
      property: {
        id: property.id,
        name: property.name,
        address: fullAddress,
        description: property.description,
        locality: guide.locality,
        // Coordenadas desde la tabla properties (único punto de verdad)
        latitude: property.latitude || null,
        longitude: property.longitude || null
      },
      guide,
      sections,
      apartment_sections: apartmentSections,
      beaches,
      restaurants,
      shopping,
      activities,
      house_rules: houseRules,
      house_guide_items: houseGuideItems,
      tips,
      contact_info: contactInfo,
      practical_info: practicalInfo
    }

    console.log('Complete guide data fetched successfully:', result)
    return result
  } catch (error) {
    console.error('Error fetching complete guide data:', error)
    return null
  }
}

export async function updatePropertyGuideClient(
  id: string,
  data: UpdateGuideData
): Promise<PropertyGuide | null> {
  const supabase = getSupabaseBrowserClient()

  const { data: result, error } = await supabase
    .from("property_guides")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating property guide:", error)
    return null
  }

  return result
}

export async function deletePropertyGuideClient(id: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient()

  const { error } = await supabase
    .from("property_guides")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[v0] Error deleting property guide:", error)
    return false
  }

  return true
}

// ============================================================================
// GUIDE SECTIONS (Client-side)
// ============================================================================

export async function getGuideSectionsClient(guideId: string): Promise<GuideSection[]> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("guide_sections")
    .select("*")
    .eq("guide_id", guideId)
    .order("order_index", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching guide sections:", error)
    return []
  }

  return data || []
}

export async function createGuideSectionClient(data: CreateGuideSectionData): Promise<GuideSection | null> {
  const supabase = getSupabaseBrowserClient()

  const tenantId = await getCurrentUserTenantId()
  if (!tenantId) {
    return null
  }

  const { data: result, error } = await supabase
    .from("guide_sections")
    .insert({
      tenant_id: tenantId,
      guide_id: data.guide_id,
      section_type: data.section_type,
      title: data.title,
      content: data.content,
      icon: data.icon,
      order_index: data.order_index || 0,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating guide section:", error)
    return null
  }

  return result
}

export async function updateGuideSectionClient(
  id: string,
  data: UpdateGuideSectionData
): Promise<GuideSection | null> {
  const supabase = getSupabaseBrowserClient()

  const { data: result, error } = await supabase
    .from("guide_sections")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating guide section:", error)
    return null
  }

  return result
}

export async function deleteGuideSectionClient(id: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient()

  const { error } = await supabase
    .from("guide_sections")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[v0] Error deleting guide section:", error)
    return false
  }

  return true
}

// ============================================================================
// GUIDE PLACES (Client-side)
// ============================================================================

export async function getGuidePlacesClient(guideId: string): Promise<GuidePlace[]> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("guide_places")
    .select("*")
    .eq("guide_id", guideId)
    .order("order_index", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching guide places:", error)
    return []
  }

  return data || []
}

export async function createGuidePlaceClient(data: CreateGuidePlaceData): Promise<GuidePlace | null> {
  const supabase = getSupabaseBrowserClient()

  const tenantId = await getCurrentUserTenantId()
  if (!tenantId) {
    return null
  }

  const { data: result, error } = await supabase
    .from("guide_places")
    .insert({
      tenant_id: tenantId,
      guide_id: data.guide_id,
      name: data.name,
      description: data.description,
      distance: data.distance,
      rating: data.rating,
      badge: data.badge,
      image_url: data.image_url,
      place_type: data.place_type || "beach",
      order_index: data.order_index || 0,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating guide place:", error)
    return null
  }

  return result
}

export async function updateGuidePlaceClient(
  id: string,
  data: UpdateGuidePlaceData
): Promise<GuidePlace | null> {
  const supabase = getSupabaseBrowserClient()

  const { data: result, error } = await supabase
    .from("guide_places")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating guide place:", error)
    return null
  }

  return result
}

export async function deleteGuidePlaceClient(id: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient()

  const { error } = await supabase
    .from("guide_places")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[v0] Error deleting guide place:", error)
    return false
  }

  return true
}

// ============================================================================
// HOUSE RULES (Client-side)
// ============================================================================

export async function getHouseRulesClient(guideId: string): Promise<HouseRule[]> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("house_rules")
    .select("*")
    .eq("guide_id", guideId)
    .order("order_index", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching house rules:", error)
    return []
  }

  return data || []
}

export async function createHouseRuleClient(data: CreateHouseRuleData): Promise<HouseRule | null> {
  const supabase = getSupabaseBrowserClient()

  const { data: result, error } = await supabase
    .from("house_rules")
    .insert({
      guide_id: data.guide_id,
      title: data.title,
      description: data.description,
      icon: data.icon,
      order_index: data.order_index || 0,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating house rule:", error)
    return null
  }

  return result
}

export async function updateHouseRuleClient(
  id: string,
  data: UpdateHouseRuleData
): Promise<HouseRule | null> {
  const supabase = getSupabaseBrowserClient()

  const { data: result, error } = await supabase
    .from("house_rules")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating house rule:", error)
    return null
  }

  return result
}

export async function deleteHouseRuleClient(id: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient()

  const { error } = await supabase
    .from("house_rules")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[v0] Error deleting house rule:", error)
    return false
  }

  return true
}

// ============================================================================
// HOUSE GUIDE ITEMS (Client-side)
// ============================================================================

export async function getHouseGuideItemsClient(guideId: string): Promise<HouseGuideItem[]> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("house_guide_items")
    .select("*")
    .eq("guide_id", guideId)
    .order("order_index", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching house guide items:", error)
    return []
  }

  return data || []
}

export async function createHouseGuideItemClient(data: CreateHouseGuideItemData): Promise<HouseGuideItem | null> {
  const supabase = getSupabaseBrowserClient()

  const { data: result, error } = await supabase
    .from("house_guide_items")
    .insert({
      guide_id: data.guide_id,
      title: data.title,
      description: data.description,
      details: data.details,
      icon: data.icon,
      order_index: data.order_index || 0,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating house guide item:", error)
    return null
  }

  return result
}

export async function updateHouseGuideItemClient(
  id: string,
  data: UpdateHouseGuideItemData
): Promise<HouseGuideItem | null> {
  const supabase = getSupabaseBrowserClient()

  const { data: result, error } = await supabase
    .from("house_guide_items")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating house guide item:", error)
    return null
  }

  return result
}

export async function deleteHouseGuideItemClient(id: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient()

  const { error } = await supabase
    .from("house_guide_items")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[v0] Error deleting house guide item:", error)
    return false
  }

  return true
}

// ============================================================================
// CONTACT INFO (Client-side)
// ============================================================================

export async function getGuideContactInfoClient(guideId: string): Promise<GuideContactInfo | null> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("guide_contact_info")
    .select("*")
    .eq("guide_id", guideId)
    .maybeSingle()

  if (error) {
    console.error("[v0] Error fetching guide contact info:", error)
    return null
  }

  return data
}

export async function createGuideContactInfoClient(data: CreateContactInfoData): Promise<GuideContactInfo | null> {
  const supabase = getSupabaseBrowserClient()

  const tenantId = await getCurrentUserTenantId()
  if (!tenantId) {
    return null
  }

  const { data: result, error } = await supabase
    .from("guide_contact_info")
    .insert({
      tenant_id: tenantId,
      guide_id: data.guide_id,
      host_names: data.host_names,
      phone: data.phone,
      email: data.email,
      whatsapp: data.whatsapp,
      host_message: data.host_message,
      support_person_name: data.support_person_name,
      support_person_phone: data.support_person_phone,
      support_person_whatsapp: data.support_person_whatsapp,
      emergency_numbers: data.emergency_numbers,
      interest_phones: data.interest_phones,
      service_issues: data.service_issues,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating guide contact info:", error)
    return null
  }

  return result
}

export async function updateGuideContactInfoClient(
  id: string,
  data: UpdateContactInfoData
): Promise<GuideContactInfo | null> {
  const supabase = getSupabaseBrowserClient()

  const { data: result, error } = await supabase
    .from("guide_contact_info")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating guide contact info:", error)
    return null
  }

  return result
}

// ============================================================================
// PRACTICAL INFO (Client-side)
// ============================================================================

export async function getPracticalInfoClient(guideId: string): Promise<PracticalInfo[]> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("practical_info")
    .select("*")
    .eq("guide_id", guideId)
    .order("order_index", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching practical info:", error)
    return []
  }

  return data || []
}

export async function createPracticalInfoClient(data: CreatePracticalInfoData): Promise<PracticalInfo | null> {
  const supabase = getSupabaseBrowserClient()

  const tenantId = await getCurrentUserTenantId()
  if (!tenantId) {
    return null
  }

  const { data: result, error } = await supabase
    .from("practical_info")
    .insert({
      tenant_id: tenantId,
      guide_id: data.guide_id,
      category: data.category,
      title: data.title,
      description: data.description,
      details: data.details,
      icon: data.icon,
      order_index: data.order_index || 0,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating practical info:", error)
    return null
  }

  return result
}

export async function updatePracticalInfoClient(
  id: string,
  data: UpdatePracticalInfoData
): Promise<PracticalInfo | null> {
  const supabase = getSupabaseBrowserClient()

  const { data: result, error } = await supabase
    .from("practical_info")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating practical info:", error)
    return null
  }

  return result
}

export async function deletePracticalInfoClient(id: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient()

  const { error } = await supabase
    .from("practical_info")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[v0] Error deleting practical info:", error)
    return false
  }

  return true
}
