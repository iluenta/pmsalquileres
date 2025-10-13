import { getSupabaseServerClient } from "@/lib/supabase/server"
import type {
  PropertyGuide,
  GuideSection,
  GuidePlace,
  HouseRule,
  HouseGuideItem,
  GuideContactInfo,
  PracticalInfo,
  GuideData,
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
// PROPERTY GUIDES
// ============================================================================

export async function getPropertyGuide(propertyId: string): Promise<PropertyGuide | null> {
  const supabase = await getSupabaseServerClient()
  
  const { data, error } = await supabase
    .from("property_guides")
    .select("*")
    .eq("property_id", propertyId)
    .single()

  if (error) {
    console.error("[v0] Error fetching property guide:", error)
    return null
  }

  return data
}

export async function createPropertyGuide(data: CreateGuideData): Promise<PropertyGuide | null> {
  const supabase = await getSupabaseServerClient()
  
  const { data: result, error } = await supabase
    .from("property_guides")
    .insert({
      property_id: data.property_id,
      title: data.title || "Guía del Huésped",
      welcome_message: data.welcome_message,
      host_names: data.host_names,
      host_signature: data.host_signature,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating property guide:", error)
    return null
  }

  return result
}

export async function updatePropertyGuide(
  id: string,
  data: UpdateGuideData
): Promise<PropertyGuide | null> {
  const supabase = await getSupabaseServerClient()
  
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

export async function deletePropertyGuide(id: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient()
  
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
// GUIDE SECTIONS
// ============================================================================

export async function getGuideSections(guideId: string): Promise<GuideSection[]> {
  const supabase = await getSupabaseServerClient()
  
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

export async function createGuideSection(data: CreateGuideSectionData): Promise<GuideSection | null> {
  const supabase = await getSupabaseServerClient()
  
  const { data: result, error } = await supabase
    .from("guide_sections")
    .insert({
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

export async function updateGuideSection(
  id: string,
  data: UpdateGuideSectionData
): Promise<GuideSection | null> {
  const supabase = await getSupabaseServerClient()
  
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

export async function deleteGuideSection(id: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient()
  
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
// GUIDE PLACES
// ============================================================================

export async function getGuidePlaces(guideId: string): Promise<GuidePlace[]> {
  const supabase = await getSupabaseServerClient()
  
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

export async function createGuidePlace(data: CreateGuidePlaceData): Promise<GuidePlace | null> {
  const supabase = await getSupabaseServerClient()
  
  const { data: result, error } = await supabase
    .from("guide_places")
    .insert({
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

export async function updateGuidePlace(
  id: string,
  data: UpdateGuidePlaceData
): Promise<GuidePlace | null> {
  const supabase = await getSupabaseServerClient()
  
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

export async function deleteGuidePlace(id: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient()
  
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
// HOUSE RULES
// ============================================================================

export async function getHouseRules(guideId: string): Promise<HouseRule[]> {
  const supabase = await getSupabaseServerClient()
  
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

export async function createHouseRule(data: CreateHouseRuleData): Promise<HouseRule | null> {
  const supabase = await getSupabaseServerClient()
  
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

export async function updateHouseRule(
  id: string,
  data: UpdateHouseRuleData
): Promise<HouseRule | null> {
  const supabase = await getSupabaseServerClient()
  
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

export async function deleteHouseRule(id: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient()
  
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
// HOUSE GUIDE ITEMS
// ============================================================================

export async function getHouseGuideItems(guideId: string): Promise<HouseGuideItem[]> {
  const supabase = await getSupabaseServerClient()
  
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

export async function createHouseGuideItem(data: CreateHouseGuideItemData): Promise<HouseGuideItem | null> {
  const supabase = await getSupabaseServerClient()
  
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

export async function updateHouseGuideItem(
  id: string,
  data: UpdateHouseGuideItemData
): Promise<HouseGuideItem | null> {
  const supabase = await getSupabaseServerClient()
  
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

export async function deleteHouseGuideItem(id: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient()
  
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
// CONTACT INFO
// ============================================================================

export async function getGuideContactInfo(guideId: string): Promise<GuideContactInfo | null> {
  const supabase = await getSupabaseServerClient()
  
  const { data, error } = await supabase
    .from("guide_contact_info")
    .select("*")
    .eq("guide_id", guideId)
    .single()

  if (error) {
    console.error("[v0] Error fetching guide contact info:", error)
    return null
  }

  return data
}

export async function createGuideContactInfo(data: CreateContactInfoData): Promise<GuideContactInfo | null> {
  const supabase = await getSupabaseServerClient()
  
  const { data: result, error } = await supabase
    .from("guide_contact_info")
    .insert({
      guide_id: data.guide_id,
      host_names: data.host_names,
      phone: data.phone,
      email: data.email,
      whatsapp: data.whatsapp,
      emergency_numbers: data.emergency_numbers,
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

export async function updateGuideContactInfo(
  id: string,
  data: UpdateContactInfoData
): Promise<GuideContactInfo | null> {
  const supabase = await getSupabaseServerClient()
  
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
// PRACTICAL INFO
// ============================================================================

export async function getPracticalInfo(guideId: string): Promise<PracticalInfo[]> {
  const supabase = await getSupabaseServerClient()
  
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

export async function createPracticalInfo(data: CreatePracticalInfoData): Promise<PracticalInfo | null> {
  const supabase = await getSupabaseServerClient()
  
  const { data: result, error } = await supabase
    .from("practical_info")
    .insert({
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

export async function updatePracticalInfo(
  id: string,
  data: UpdatePracticalInfoData
): Promise<PracticalInfo | null> {
  const supabase = await getSupabaseServerClient()
  
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

export async function deletePracticalInfo(id: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient()
  
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

// ============================================================================
// COMPLETE GUIDE DATA
// ============================================================================

export async function getCompleteGuideData(propertyId: string): Promise<GuideData | null> {
  const supabase = await getSupabaseServerClient()
  
  // Get property info
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id, name, address, description")
    .eq("id", propertyId)
    .single()

  if (propertyError) {
    console.error("[v0] Error fetching property:", propertyError)
    return null
  }

  // Get guide
  const guide = await getPropertyGuide(propertyId)
  if (!guide) {
    return null
  }

  // Get all related data in parallel
  const [
    sections,
    places,
    houseRules,
    houseGuideItems,
    contactInfo,
    practicalInfo,
  ] = await Promise.all([
    getGuideSections(guide.id),
    getGuidePlaces(guide.id),
    getHouseRules(guide.id),
    getHouseGuideItems(guide.id),
    getGuideContactInfo(guide.id),
    getPracticalInfo(guide.id),
  ])

  return {
    property,
    guide,
    sections,
    places,
    house_rules: houseRules,
    house_guide_items: houseGuideItems,
    contact_info: contactInfo,
    practical_info: practicalInfo,
  }
}
