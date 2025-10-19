import { getSupabaseBrowserClient } from "@/lib/supabase/client"

// Helper function to get current user's tenant_id
async function getCurrentUserTenantId(): Promise<string | null> {
  const supabase = getSupabaseBrowserClient()
  
  console.log("[v0] Getting current user tenant_id...")
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error("[v0] No authenticated user found")
    return null
  }

  console.log("[v0] User found:", user.id)

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    console.error("[v0] Error fetching user tenant:")
    console.error("- User error:", userError)
    console.error("- User data:", userData)
    return null
  }

  console.log("[v0] Tenant ID found:", userData.tenant_id)
  return userData.tenant_id
}
import type {
  ApartmentSection,
  Beach,
  Restaurant,
  Activity,
  CreateApartmentSectionData,
  UpdateApartmentSectionData,
  CreateBeachData,
  UpdateBeachData,
  CreateRestaurantData,
  UpdateRestaurantData,
  CreateActivityData,
  UpdateActivityData,
} from "@/types/guides"

// ============================================================================
// APARTMENT SECTIONS CRUD (Client-side)
// ============================================================================

export async function getApartmentSections(guideId: string): Promise<ApartmentSection[]> {
  const supabase = getSupabaseBrowserClient()
  
  const { data, error } = await supabase
    .from("apartment_sections")
    .select("*")
    .eq("guide_id", guideId)
    .order("order_index", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching apartment sections:", error)
    return []
  }

  return data || []
}

export async function createApartmentSection(data: CreateApartmentSectionData): Promise<ApartmentSection | null> {
  const supabase = getSupabaseBrowserClient()
  
  const tenantId = await getCurrentUserTenantId()
  if (!tenantId) {
    return null
  }
  
  // Insertar directamente en apartment_sections
  const insertData = {
    tenant_id: tenantId,
    guide_id: data.guide_id,
    section_type: data.section_type,
    title: data.title,
    description: data.description,
    details: data.details,
    image_url: data.image_url,
    icon: data.icon,
    order_index: data.order_index || 0
  }
  
  const { data: result, error } = await supabase
    .from("apartment_sections")
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating apartment section:", error)
    console.error("[v0] Insert data:", insertData)
    return null
  }

  return result
}

export async function updateApartmentSection(id: string, data: UpdateApartmentSectionData): Promise<ApartmentSection | null> {
  const supabase = getSupabaseBrowserClient()
  
  // Actualizar directamente en apartment_sections
  const updateData = {
    section_type: data.section_type,
    title: data.title,
    description: data.description,
    details: data.details,
    image_url: data.image_url,
    icon: data.icon,
    order_index: data.order_index
  }
  
  const { data: result, error } = await supabase
    .from("apartment_sections")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating apartment section:", error)
    console.error("[v0] Update data:", updateData)
    return null
  }

  return result
}

export async function deleteApartmentSection(id: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient()
  
  const { error } = await supabase
    .from("apartment_sections")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[v0] Error deleting apartment section:", error)
    return false
  }

  return true
}

// ============================================================================
// BEACHES CRUD (Client-side)
// ============================================================================

export async function createBeach(data: CreateBeachData): Promise<Beach | null> {
  const supabase = getSupabaseBrowserClient()
  
  const tenantId = await getCurrentUserTenantId()
  if (!tenantId) {
    return null
  }
  
  // Mapear los campos correctamente para guide_places
  const insertData = {
    tenant_id: tenantId,
    guide_id: data.guide_id,
    name: data.name,
    description: data.description,
    distance: data.distance,
    rating: data.rating,
    badge: data.badge,
    image_url: data.image_url,
    order_index: data.order_index || 0,
    place_type: "beach"
  }
  
  console.log("[v0] Creating beach with data:", insertData)
  
  const { data: result, error } = await supabase
    .from("guide_places")
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating beach:", error)
    console.error("[v0] Insert data:", insertData)
    return null
  }

  console.log("[v0] Beach created successfully:", result)
  return result
}

export async function updateBeach(id: string, data: UpdateBeachData): Promise<Beach | null> {
  const supabase = getSupabaseBrowserClient()
  
  const { data: result, error } = await supabase
    .from("guide_places")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating beach:", error)
    return null
  }

  return result
}

export async function deleteBeach(id: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient()
  
  const { error } = await supabase
    .from("guide_places")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[v0] Error deleting beach:", error)
    return false
  }

  return true
}

// ============================================================================
// RESTAURANTS CRUD (Client-side)
// ============================================================================

export async function createRestaurant(data: CreateRestaurantData): Promise<Restaurant | null> {
  const supabase = getSupabaseBrowserClient()
  
  const tenantId = await getCurrentUserTenantId()
  if (!tenantId) {
    return null
  }
  
  // Mapear los campos correctamente para guide_places
  const insertData = {
    tenant_id: tenantId,
    guide_id: data.guide_id,
    name: data.name,
    description: data.description,
    rating: data.rating,
    badge: data.badge,
    image_url: data.image_url,
    order_index: data.order_index || 0,
    place_type: "restaurant"
  }
  
  console.log("[v0] Creating restaurant with data:", insertData)
  
  const { data: result, error } = await supabase
    .from("guide_places")
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating restaurant:", error)
    console.error("[v0] Insert data:", insertData)
    return null
  }

  console.log("[v0] Restaurant created successfully:", result)
  return result
}

export async function updateRestaurant(id: string, data: UpdateRestaurantData): Promise<Restaurant | null> {
  const supabase = getSupabaseBrowserClient()
  
  const { data: result, error } = await supabase
    .from("guide_places")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating restaurant:", error)
    return null
  }

  return result
}

export async function deleteRestaurant(id: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient()
  
  const { error } = await supabase
    .from("guide_places")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[v0] Error deleting restaurant:", error)
    return false
  }

  return true
}

// ============================================================================
// ACTIVITIES CRUD (Client-side)
// ============================================================================

export async function createActivity(data: CreateActivityData): Promise<Activity | null> {
  console.log("[v0] Starting createActivity function...")
  console.log("[v0] Input data:", data)
  
  const supabase = getSupabaseBrowserClient()
  console.log("[v0] Supabase client created")
  
  const tenantId = await getCurrentUserTenantId()
  console.log("[v0] Tenant ID result:", tenantId)
  
  if (!tenantId) {
    console.error("[v0] No tenant ID found, returning null")
    return null
  }
  
  // Mapear los campos correctamente para guide_places
  const insertData = {
    tenant_id: tenantId,
    guide_id: data.guide_id,
    name: data.name,
    description: data.description,
    distance: data.distance,
    badge: data.badge,
    image_url: data.image_url,
    order_index: data.order_index || 0,
    place_type: "activity"
  }
  
  console.log("[v0] Creating activity with data:", insertData)
  console.log("[v0] Data validation:")
  console.log("- guide_id:", insertData.guide_id)
  console.log("- name:", insertData.name)
  console.log("- tenant_id:", insertData.tenant_id)
  
  const { data: result, error } = await supabase
    .from("guide_places")
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating activity:")
    console.error("- Error object:", error)
    console.error("- Error message:", error.message)
    console.error("- Error details:", error.details)
    console.error("- Error hint:", error.hint)
    console.error("- Error code:", error.code)
    console.error("- Insert data:", insertData)
    return null
  }

  console.log("[v0] Activity created successfully:", result)
  return result
}

export async function updateActivity(id: string, data: UpdateActivityData): Promise<Activity | null> {
  const supabase = getSupabaseBrowserClient()
  
  const { data: result, error } = await supabase
    .from("guide_places")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating activity:", error)
    return null
  }

  return result
}

export async function deleteActivity(id: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient()
  
  const { error } = await supabase
    .from("guide_places")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[v0] Error deleting activity:", error)
    return false
  }

  return true
}

// ============================================================================
// HOUSE GUIDE ITEMS CRUD (Client-side)
// ============================================================================

export async function getHouseGuideItems(guideId: string): Promise<any[]> {
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

export async function createHouseGuideItem(data: any): Promise<any | null> {
  const supabase = getSupabaseBrowserClient()
  
  const tenantId = await getCurrentUserTenantId()
  if (!tenantId) {
    return null
  }
  
  const { data: result, error } = await supabase
    .from("house_guide_items")
    .insert({
      tenant_id: tenantId,
      ...data
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating house guide item:", error)
    return null
  }

  return result
}

export async function updateHouseGuideItem(id: string, data: any): Promise<any | null> {
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

export async function deleteHouseGuideItem(id: string): Promise<boolean> {
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
// HOUSE RULES CRUD (Client-side)
// ============================================================================

export async function getHouseRules(guideId: string): Promise<any[]> {
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

export async function createHouseRule(data: any): Promise<any | null> {
  const supabase = getSupabaseBrowserClient()
  
  const tenantId = await getCurrentUserTenantId()
  if (!tenantId) {
    return null
  }
  
  const { data: result, error } = await supabase
    .from("house_rules")
    .insert({
      tenant_id: tenantId,
      ...data
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating house rule:", error)
    return null
  }

  return result
}

export async function updateHouseRule(id: string, data: any): Promise<any | null> {
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

export async function deleteHouseRule(id: string): Promise<boolean> {
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
// TIPS CRUD (Client-side)
// ============================================================================

export async function getTips(guideId: string): Promise<any[]> {
  const supabase = getSupabaseBrowserClient()
  
  const { data, error } = await supabase
    .from("guide_sections")
    .select("*")
    .eq("guide_id", guideId)
    .eq("section_type", "tips")
    .order("order_index", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching tips:", error)
    return []
  }

  return data || []
}

export async function createTip(data: any): Promise<any | null> {
  const supabase = getSupabaseBrowserClient()
  
  const tenantId = await getCurrentUserTenantId()
  if (!tenantId) {
    return null
  }
  
  // Mapear los campos correctamente para guide_sections
  const insertData = {
    tenant_id: tenantId,
    guide_id: data.guide_id,
    section_type: "tips",
    title: data.title,
    content: data.description || data.content, // Usar description como content
    icon: data.icon,
    order_index: data.order_index || 0
  }
  
  const { data: result, error } = await supabase
    .from("guide_sections")
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating tip:", error)
    console.error("[v0] Insert data:", insertData)
    return null
  }

  return result
}

export async function updateTip(id: string, data: any): Promise<any | null> {
  const supabase = getSupabaseBrowserClient()
  
  // Mapear los campos correctamente para guide_sections
  const updateData = {
    title: data.title,
    content: data.description || data.content, // Usar description como content
    icon: data.icon,
    order_index: data.order_index
  }
  
  const { data: result, error } = await supabase
    .from("guide_sections")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating tip:", error)
    console.error("[v0] Update data:", updateData)
    return null
  }

  return result
}

export async function deleteTip(id: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient()
  
  const { error } = await supabase
    .from("guide_sections")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[v0] Error deleting tip:", error)
    return false
  }

  return true
}

