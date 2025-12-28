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
  Shopping,
  Activity,
  CreateApartmentSectionData,
  UpdateApartmentSectionData,
  CreateBeachData,
  UpdateBeachData,
  CreateRestaurantData,
  UpdateRestaurantData,
  CreateShoppingData,
  UpdateShoppingData,
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
    order_index: data.order_index || 0,
    amenities: data.amenities || []
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
    order_index: data.order_index,
    amenities: data.amenities
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
  const insertData: any = {
    tenant_id: tenantId,
    guide_id: data.guide_id,
    name: data.name,
    place_type: "beach",
    order_index: data.order_index || 0,
  }

  // Agregar campos opcionales solo si tienen valor
  if (data.description !== undefined && data.description !== null) {
    insertData.description = data.description
  }
  if (data.address !== undefined && data.address !== null && data.address !== '') {
    insertData.address = data.address
  }
  if (data.rating !== undefined && data.rating !== null) {
    insertData.rating = data.rating
  }
  if (data.review_count !== undefined && data.review_count !== null) {
    insertData.review_count = data.review_count
  }
  if (data.price_range !== undefined && data.price_range !== null && data.price_range !== '') {
    insertData.price_range = data.price_range
  }
  if (data.distance !== undefined && data.distance !== null) {
    insertData.distance = data.distance
  }
  if (data.badge !== undefined && data.badge !== null && data.badge !== '') {
    insertData.badge = data.badge
  }
  if (data.image_url !== undefined && data.image_url !== null && data.image_url !== '') {
    insertData.image_url = data.image_url
  }
  if (data.url !== undefined && data.url !== null && data.url !== '') {
    insertData.url = data.url
  }
  if (data.amenities !== undefined && data.amenities !== null && data.amenities.length > 0) {
    insertData.amenities = data.amenities
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
  // Filtrar campos undefined/null para evitar errores
  const insertData: any = {
    tenant_id: tenantId,
    guide_id: data.guide_id,
    name: data.name,
    place_type: "restaurant",
    order_index: data.order_index || 0,
  }

  // Agregar campos opcionales solo si tienen valor
  if (data.description !== undefined && data.description !== null) {
    insertData.description = data.description
  }
  if (data.address !== undefined && data.address !== null && data.address !== '') {
    insertData.address = data.address
  }
  if (data.rating !== undefined && data.rating !== null) {
    insertData.rating = data.rating
  }
  if (data.review_count !== undefined && data.review_count !== null) {
    insertData.review_count = data.review_count
  }
  if (data.price_range !== undefined && data.price_range !== null && data.price_range !== '') {
    insertData.price_range = data.price_range
  }
  if (data.cuisine_type !== undefined && data.cuisine_type !== null && data.cuisine_type !== '') {
    insertData.cuisine_type = data.cuisine_type
  }
  if (data.distance !== undefined && data.distance !== null) {
    insertData.distance = data.distance
  }
  if (data.badge !== undefined && data.badge !== null && data.badge !== '') {
    insertData.badge = data.badge
  }
  if (data.image_url !== undefined && data.image_url !== null && data.image_url !== '') {
    insertData.image_url = data.image_url
  }
  // Solo agregar url si el campo existe en la tabla (puede no existir si no se ejecutó el script SQL)
  // Intentar agregarlo, si falla el error será más claro
  if (data.url !== undefined && data.url !== null && data.url !== '') {
    insertData.url = data.url
  }

  console.log("[v0] Creating restaurant with data:", insertData)

  const { data: result, error } = await supabase
    .from("guide_places")
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating restaurant:")
    console.error("- Error object:", error)
    console.error("- Error message:", error.message)
    console.error("- Error details:", error.details)
    console.error("- Error hint:", error.hint)
    console.error("- Error code:", error.code)
    console.error("- Insert data:", insertData)
    return null
  }

  console.log("[v0] Restaurant created successfully:", result)
  return result
}

export async function updateRestaurant(id: string, data: UpdateRestaurantData): Promise<Restaurant | null> {
  const supabase = getSupabaseBrowserClient()

  console.log("[v0] Updating restaurant with id:", id)
  console.log("[v0] Update data:", data)

  // Filtrar campos undefined para evitar errores
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  ) as UpdateRestaurantData

  console.log("[v0] Cleaned data:", cleanData)

  const { data: result, error } = await supabase
    .from("guide_places")
    .update(cleanData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating restaurant:")
    console.error("- Error object:", error)
    console.error("- Error message:", error.message)
    console.error("- Error details:", error.details)
    console.error("- Error hint:", error.hint)
    console.error("- Error code:", error.code)
    return null
  }

  if (!result) {
    console.error("[v0] No result returned from update")
    return null
  }

  console.log("[v0] Restaurant updated successfully:", result)
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
// SHOPPING CRUD (Client-side)
// ============================================================================

export async function createShopping(data: CreateShoppingData): Promise<Shopping | null> {
  const supabase = getSupabaseBrowserClient()

  const tenantId = await getCurrentUserTenantId()
  if (!tenantId) {
    return null
  }

  // Mapear los campos correctamente para guide_places
  // Filtrar campos undefined/null para evitar errores
  const insertData: any = {
    tenant_id: tenantId,
    guide_id: data.guide_id,
    name: data.name,
    place_type: "shopping",
    order_index: data.order_index || 0,
  }

  // Agregar campos opcionales solo si tienen valor
  if (data.description !== undefined && data.description !== null) {
    insertData.description = data.description
  }
  if (data.address !== undefined && data.address !== null && data.address !== '') {
    insertData.address = data.address
  }
  if (data.rating !== undefined && data.rating !== null) {
    insertData.rating = data.rating
  }
  if (data.review_count !== undefined && data.review_count !== null) {
    insertData.review_count = data.review_count
  }
  if (data.price_range !== undefined && data.price_range !== null && data.price_range !== '') {
    insertData.price_range = data.price_range
  }
  // Agregar shopping_type solo si tiene valor
  // NOTA: Si obtienes un error sobre columna no encontrada, ejecuta el script:
  // scripts/079_add_shopping_type_to_guide_places.sql
  if (data.shopping_type !== undefined && data.shopping_type !== null && data.shopping_type !== '') {
    insertData.shopping_type = data.shopping_type
  }
  if (data.distance !== undefined && data.distance !== null) {
    insertData.distance = data.distance
  }
  if (data.badge !== undefined && data.badge !== null && data.badge !== '') {
    insertData.badge = data.badge
  }
  if (data.image_url !== undefined && data.image_url !== null && data.image_url !== '') {
    insertData.image_url = data.image_url
  }
  if (data.url !== undefined && data.url !== null && data.url !== '') {
    insertData.url = data.url
  }

  console.log("[v0] Creating shopping with data:", insertData)

  const { data: result, error } = await supabase
    .from("guide_places")
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating shopping:")
    console.error("- Error object:", error)
    console.error("- Error message:", error.message)
    console.error("- Error details:", error.details)
    console.error("- Error hint:", error.hint)
    console.error("- Error code:", error.code)
    console.error("- Insert data:", insertData)
    
    // Si el error es sobre columna no encontrada, dar instrucciones claras
    if (error.message?.includes('shopping_type') || error.message?.includes('column') || error.code === '42703') {
      console.error("[v0] ⚠️ IMPORTANTE: La columna 'shopping_type' no existe en la tabla 'guide_places'.")
      console.error("[v0] Por favor, ejecuta el script SQL: scripts/079_add_shopping_type_to_guide_places.sql")
      console.error("[v0] Este script agregará la columna necesaria para lugares de compras.")
    }
    
    return null
  }

  console.log("[v0] Shopping created successfully:", result)
  return result
}

export async function updateShopping(id: string, data: UpdateShoppingData): Promise<Shopping | null> {
  const supabase = getSupabaseBrowserClient()

  console.log("[v0] Updating shopping with id:", id)
  console.log("[v0] Update data:", data)

  // Filtrar campos undefined para evitar errores
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  ) as UpdateShoppingData

  console.log("[v0] Cleaned data:", cleanData)

  const { data: result, error } = await supabase
    .from("guide_places")
    .update(cleanData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating shopping:")
    console.error("- Error object:", error)
    console.error("- Error message:", error.message)
    console.error("- Error details:", error.details)
    console.error("- Error hint:", error.hint)
    console.error("- Error code:", error.code)
    return null
  }

  if (!result) {
    console.error("[v0] No result returned from update")
    return null
  }

  console.log("[v0] Shopping updated successfully:", result)
  return result
}

export async function deleteShopping(id: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient()

  const { error } = await supabase
    .from("guide_places")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[v0] Error deleting shopping:", error)
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
  const insertData: any = {
    tenant_id: tenantId,
    guide_id: data.guide_id,
    name: data.name,
    place_type: "activity",
    order_index: data.order_index || 0,
  }

  // Agregar campos opcionales solo si tienen valor
  if (data.description !== undefined && data.description !== null) {
    insertData.description = data.description
  }
  if (data.address !== undefined && data.address !== null && data.address !== '') {
    insertData.address = data.address
  }
  if (data.activity_type !== undefined && data.activity_type !== null && data.activity_type !== '') {
    insertData.activity_type = data.activity_type
  }
  if (data.duration !== undefined && data.duration !== null && data.duration !== '') {
    insertData.duration = data.duration
  }
  if (data.rating !== undefined && data.rating !== null) {
    insertData.rating = data.rating
  }
  if (data.review_count !== undefined && data.review_count !== null) {
    insertData.review_count = data.review_count
  }
  if (data.price_range !== undefined && data.price_range !== null && data.price_range !== '') {
    insertData.price_range = data.price_range
  }
  if (data.price_info !== undefined && data.price_info !== null && data.price_info !== '') {
    insertData.price_info = data.price_info
  }
  if (data.distance !== undefined && data.distance !== null) {
    insertData.distance = data.distance
  }
  if (data.badge !== undefined && data.badge !== null && data.badge !== '') {
    insertData.badge = data.badge
  }
  if (data.image_url !== undefined && data.image_url !== null && data.image_url !== '') {
    insertData.image_url = data.image_url
  }
  if (data.url !== undefined && data.url !== null && data.url !== '') {
    insertData.url = data.url
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
    .from("tips")
    .select("*")
    .eq("guide_id", guideId)
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

  const insertData = {
    tenant_id: tenantId,
    guide_id: data.guide_id,
    title: data.title,
    description: data.description,
    details: data.details,
    icon: data.icon,
    order_index: data.order_index || 0
  }

  const { data: result, error } = await supabase
    .from("tips")
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

  const updateData = {
    title: data.title,
    description: data.description,
    details: data.details,
    icon: data.icon,
    order_index: data.order_index
  }

  console.log("[v0] Attempting to update tip:", id, updateData)

  const { data: result, error } = await supabase
    .from("tips")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating tip:", error)
    console.error("[v0] Error details:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    console.error("[v0] Update data was:", updateData)
    return null
  }

  console.log("[v0] Tip updated successfully:", result)
  return result
}

export async function deleteTip(id: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient()

  const { error } = await supabase
    .from("tips")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[v0] Error deleting tip:", error)
    return false
  }

  return true
}

