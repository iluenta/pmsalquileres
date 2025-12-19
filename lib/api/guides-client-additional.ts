import { getSupabaseBrowserClient } from "@/lib/supabase/client"

// ============================================================================
// APARTMENT SECTIONS (Client-side)
// ============================================================================

export async function getApartmentSectionsClient(guideId: string): Promise<any[]> {
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

  console.log("[v0] Apartment sections fetched:", data)
  return data || []
}

// ============================================================================
// BEACHES (Client-side)
// ============================================================================

export async function getBeachesClient(guideId: string): Promise<any[]> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("guide_places")
    .select("*")
    .eq("guide_id", guideId)
    .eq("place_type", "beach")
    .order("order_index", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching beaches:", error)
    return []
  }

  return data || []
}

// ============================================================================
// RESTAURANTS (Client-side)
// ============================================================================

export async function getRestaurantsClient(guideId: string): Promise<any[]> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("guide_places")
    .select("*")
    .eq("guide_id", guideId)
    .eq("place_type", "restaurant")
    .order("order_index", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching restaurants:", error)
    return []
  }

  return data || []
}

// ============================================================================
// ACTIVITIES (Client-side)
// ============================================================================

export async function getActivitiesClient(guideId: string): Promise<any[]> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("guide_places")
    .select("*")
    .eq("guide_id", guideId)
    .eq("place_type", "activity")
    .order("order_index", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching activities:", error)
    return []
  }

  return data || []
}

// ============================================================================
// TIPS (Client-side)
// ============================================================================

export async function getTipsClient(guideId: string): Promise<any[]> {
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

// ============================================================================
// CONTACT INFO (Client-side)
// ============================================================================

export async function getContactInfoClient(guideId: string): Promise<any | null> {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("guide_contact_info")
    .select("*")
    .eq("guide_id", guideId)
    .maybeSingle()

  if (error) {
    console.error("[v0] Error fetching contact info:", error)
    return null
  }

  return data
}

