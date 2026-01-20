import { createClient } from '@supabase/supabase-js'

// Cliente de Supabase para acceso público (sin autenticación)
// Solo para lectura de guías públicas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabasePublic = createClient(supabaseUrl, supabaseAnonKey)

export async function getCompleteGuideDataPublic(propertyIdOrSlug: string) {
  try {
    console.log('[v0] Fetching complete guide data for property (public):', propertyIdOrSlug)
    console.log('[v0] Property ID/Slug type:', typeof propertyIdOrSlug)
    console.log('[v0] Property ID/Slug length:', propertyIdOrSlug?.length)

    if (!supabasePublic) {
      console.error('[v0] No Supabase public client available')
      return null
    }

    console.log('[v0] Supabase public client created successfully')

    // Primero intentar buscar por slug (si no es un UUID)
    let propertyId = propertyIdOrSlug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(propertyIdOrSlug)

    if (!isUUID) {
      // Usar la función optimizada de properties-public en lugar de hacer query directa
      const { getPropertyBySlugPublic } = await import('./properties-public')
      const property = await getPropertyBySlugPublic(propertyIdOrSlug)

      if (property) {
        propertyId = property.id
      } else {
        return null
      }
    }

    // Obtener la guía (que contiene la información básica de la propiedad)
    const { data: guide, error: guideError } = await supabasePublic
      .from('property_guides')
      .select('*')
      .eq('property_id', propertyId)
      .maybeSingle()

    if (guideError) {
      console.error('[v0] Error fetching guide (public):', guideError)
      throw guideError
    }

    if (!guide) {
      console.log('[v0] No guide found for property (public), returning null')
      return null
    }

    console.log('[v0] Guide found (public):', guide)

    // Obtener coordenadas y datos de la propiedad desde la tabla properties
    // Intentar primero con coordenadas, si falla intentar sin ellas
    let propertyData: any = null
    const { data: propertyWithCoords, error: errorWithCoords } = await supabasePublic
      .from('properties')
      .select('id, name, description, street, city, province, country, latitude, longitude, check_in_instructions')
      .eq('id', propertyId)
      .maybeSingle()

    if (errorWithCoords) {
      // Si el error es por columnas que no existen, intentar sin coordenadas
      if (errorWithCoords.message?.includes('latitude') || errorWithCoords.message?.includes('longitude') || errorWithCoords.code === '42703') {
        console.log('[v0] Coordinates columns not found, fetching without them')
        const { data: propertyWithoutCoords, error: errorWithoutCoords } = await supabasePublic
          .from('properties')
          .select('id, name, description, street, city, province, country')
          .eq('id', propertyId)
          .maybeSingle()

        if (!errorWithoutCoords) {
          propertyData = propertyWithoutCoords
          propertyData.latitude = null
          propertyData.longitude = null
        } else {
          console.error('[v0] Error fetching property data (public):', errorWithoutCoords)
        }
      } else {
        console.error('[v0] Error fetching property data (public):', errorWithCoords)
      }
    } else {
      propertyData = propertyWithCoords
    }

    // Crear un objeto property con la información disponible
    const property = {
      id: propertyId,
      name: propertyData?.name || guide.title || "Propiedad",
      description: propertyData?.description || guide.welcome_message,
      street: propertyData?.street || null,
      city: propertyData?.city || null,
      province: propertyData?.province || null,
      country: propertyData?.country || null,
      locality: guide.locality,
      // Coordenadas desde la tabla properties (único punto de verdad)
      latitude: propertyData?.latitude || null,
      longitude: propertyData?.longitude || null,
      check_in_instructions: propertyData?.check_in_instructions || null
    }

    console.log('[v0] Property info created from guide:', property)
    console.log('[v0] Fetching related data...')

    // Obtener todos los datos relacionados usando el cliente público
    // Usar guide_id en lugar de property_id para las tablas que lo requieren
    const [
      apartmentSections,
      beaches,
      restaurants,
      shopping,
      activities,
      houseRules,
      houseGuideItems,
      tips,
      guideSections,
      contactInfo,
      practicalInfo
    ] = await Promise.all([
      // 1. Apartment sections
      supabasePublic
        .from('apartment_sections')
        .select('*')
        .eq('guide_id', guide.id)
        .order('order_index', { ascending: true }),

      // 2. Playas
      supabasePublic
        .from('guide_places')
        .select('*')
        .eq('guide_id', guide.id)
        .eq('place_type', 'beach'),

      // 3. Restaurantes
      supabasePublic
        .from('guide_places')
        .select('*')
        .eq('guide_id', guide.id)
        .eq('place_type', 'restaurant'),

      // 4. Compras
      supabasePublic
        .from('guide_places')
        .select('*')
        .eq('guide_id', guide.id)
        .eq('place_type', 'shopping'),

      // 5. Actividades
      supabasePublic
        .from('guide_places')
        .select('*')
        .eq('guide_id', guide.id)
        .eq('place_type', 'activity'),

      // 6. Normas
      supabasePublic
        .from('house_rules')
        .select('*')
        .eq('guide_id', guide.id)
        .order('order_index', { ascending: true }),

      // 7. Guía de la casa (electrodomésticos, etc)
      supabasePublic
        .from('house_guide_items')
        .select('*')
        .eq('guide_id', guide.id)
        .order('order_index', { ascending: true }),

      // 8. Consejos (específicos)
      supabasePublic
        .from('guide_sections')
        .select('*')
        .eq('guide_id', guide.id)
        .eq('section_type', 'tips')
        .order('order_index', { ascending: true }),

      // 9. Secciones personalizadas generales (todas)
      supabasePublic
        .from('guide_sections')
        .select('*')
        .eq('guide_id', guide.id)
        .order('order_index', { ascending: true }),

      // 10. Información de contacto
      supabasePublic
        .from('guide_contact_info')
        .select('*')
        .eq('guide_id', guide.id)
        .maybeSingle(),

      // 11. Información práctica
      supabasePublic
        .from('guide_sections')
        .select('*')
        .eq('guide_id', guide.id)
        .eq('section_type', 'practical')
        .order('order_index', { ascending: true }),
    ])

    console.log('[v0] Apartment sections data:', apartmentSections.data)
    console.log('[v0] Apartment sections error:', apartmentSections.error)
    if (beaches.error) {
      console.error('[v0] Error fetching beaches:', beaches.error)
    }
    if (restaurants.error) {
      console.error('[v0] Error fetching restaurants:', restaurants.error)
    }
    if (shopping.error) {
      console.error('[v0] Error fetching shopping:', shopping.error)
    }
    if (activities.error) {
      console.error('[v0] Error fetching activities:', activities.error)
    }
    if (houseRules.error) {
      console.error('[v0] Error fetching house rules:', houseRules.error)
    }
    if (houseGuideItems.error) {
      console.error('[v0] Error fetching house guide items:', houseGuideItems.error)
    }
    if (tips.error) {
      console.error('[v0] Error fetching tips:', tips.error)
    }
    if (contactInfo.error) {
      console.error('[v0] Error fetching contact info:', contactInfo.error)
    }
    if (practicalInfo.error) {
      console.error('[v0] Error fetching practical info:', practicalInfo.error)
    }

    const errors = [
      apartmentSections.error,
      beaches.error,
      restaurants.error,
      shopping.error,
      activities.error,
      houseRules.error,
      houseGuideItems.error,
      tips.error,
      contactInfo.error,
      practicalInfo.error
    ].filter(Boolean)

    if (errors.length > 0) {
      console.error('[v0] Total errors fetching related data (public):', errors.length)
      console.error('[v0] First error details:', errors[0])
    }

    const result = {
      property,
      guide,
      sections: guideSections.data || [],
      apartment_sections: apartmentSections.data || [],
      beaches: beaches.data || [],
      restaurants: restaurants.data || [],
      shopping: shopping.data || [],
      activities: activities.data || [],
      house_rules: houseRules.data || [],
      house_guide_items: houseGuideItems.data || [],
      tips: tips.data || [],
      contact_info: contactInfo.data || null,
      practical_info: practicalInfo.data || []
    }

    console.log('[v0] Complete guide data fetched successfully (public):', result)
    console.log('[v0] Apartment sections count:', result.apartment_sections.length)
    console.log('[v0] Apartment sections details:', result.apartment_sections)
    return result

  } catch (error) {
    console.error('[v0] Error in getCompleteGuideDataPublic:', error)
    throw error
  }
}

export async function getGuideThemePublic(propertyIdOrSlug: string): Promise<{ theme: string, title?: string } | null> {
  try {
    let propertyId = propertyIdOrSlug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(propertyIdOrSlug)

    if (!isUUID) {
      const { getPropertyBySlugPublic } = await import('./properties-public')
      const property = await getPropertyBySlugPublic(propertyIdOrSlug)
      if (property) propertyId = property.id
      else return null
    }

    const { data, error } = await supabasePublic
      .from('property_guides')
      .select('theme, title')
      .eq('property_id', propertyId)
      .maybeSingle()

    if (error) throw error
    if (!data) return null

    return {
      theme: (data as any).theme || 'default',
      title: data.title
    }
  } catch (error) {
    console.error('[v0] Error in getGuideThemePublic:', error)
    return null
  }
}
