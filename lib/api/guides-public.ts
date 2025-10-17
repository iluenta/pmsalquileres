import { createClient } from '@supabase/supabase-js'

// Cliente de Supabase para acceso público (sin autenticación)
// Solo para lectura de guías públicas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabasePublic = createClient(supabaseUrl, supabaseAnonKey)

export async function getCompleteGuideDataPublic(propertyId: string) {
  try {
    console.log('[v0] Fetching complete guide data for property (public):', propertyId)
    console.log('[v0] Property ID type:', typeof propertyId)
    console.log('[v0] Property ID length:', propertyId?.length)
    
    if (!supabasePublic) {
      console.error('[v0] No Supabase public client available')
      return null
    }
    
    console.log('[v0] Supabase public client created successfully')
    
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

    // Crear un objeto property básico con la información disponible en la guía
    const property = {
      id: propertyId,
      name: guide.title || "Propiedad",
      // Usar información de la guía en lugar de la tabla properties
      street: null,
      city: null,
      description: guide.welcome_message,
      // Coordenadas desde la tabla property_guides (accesible públicamente)
      latitude: guide.latitude,
      longitude: guide.longitude
    }

    console.log('[v0] Property info created from guide:', property)
    console.log('[v0] Fetching related data...')

    // Obtener todos los datos relacionados usando el cliente público
    // Usar guide_id en lugar de property_id para las tablas que lo requieren
    const [
      apartmentSections,
      beaches,
      restaurants,
      activities,
      houseRules,
      houseGuideItems,
      tips,
      contactInfo,
      practicalInfo
    ] = await Promise.all([
      // Secciones del apartamento
      supabasePublic
        .from('guide_sections')
        .select('*')
        .eq('guide_id', guide.id)
        .eq('section_type', 'apartment'),
      
      // Playas
      supabasePublic
        .from('guide_places')
        .select('*')
        .eq('guide_id', guide.id)
        .eq('place_type', 'beach'),
      
      // Restaurantes
      supabasePublic
        .from('guide_places')
        .select('*')
        .eq('guide_id', guide.id)
        .eq('place_type', 'restaurant'),
      
      // Actividades
      supabasePublic
        .from('guide_places')
        .select('*')
        .eq('guide_id', guide.id)
        .eq('place_type', 'activity'),
      
      // Normas de la casa
      supabasePublic
        .from('house_rules')
        .select('*')
        .eq('guide_id', guide.id),
      
      // Elementos de la guía de la casa
      supabasePublic
        .from('house_guide_items')
        .select('*')
        .eq('guide_id', guide.id),
      
      // Consejos
      supabasePublic
        .from('guide_sections')
        .select('*')
        .eq('guide_id', guide.id)
        .eq('section_type', 'tips'),
      
      // Información de contacto
      supabasePublic
        .from('guide_contact_info')
        .select('*')
        .eq('guide_id', guide.id),
      
      // Información práctica
      supabasePublic
        .from('practical_info')
        .select('*')
        .eq('guide_id', guide.id)
    ])

    // Verificar errores individualmente para mejor debugging
    if (apartmentSections.error) {
      console.error('[v0] Error fetching apartment sections:', apartmentSections.error)
    }
    if (beaches.error) {
      console.error('[v0] Error fetching beaches:', beaches.error)
    }
    if (restaurants.error) {
      console.error('[v0] Error fetching restaurants:', restaurants.error)
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
      apartmentSections: apartmentSections.data || [],
      beaches: beaches.data || [],
      restaurants: restaurants.data || [],
      activities: activities.data || [],
      houseRules: houseRules.data || [],
      houseGuideItems: houseGuideItems.data || [],
      tips: tips.data || [],
      contactInfo: contactInfo.data || [],
      practicalInfo: practicalInfo.data || []
    }

    console.log('[v0] Complete guide data fetched successfully (public):', result)
    return result

  } catch (error) {
    console.error('[v0] Error in getCompleteGuideDataPublic:', error)
    throw error
  }
}
