import type {
  PlaceSearchResult,
  PlaceDetails,
  GooglePlacesTextSearchResponse,
  GooglePlacesDetailsResponse,
} from '@/types/google-places'
import type { Restaurant } from '@/types/guides'

const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place'
// Nota: La API key se usa en las API routes del servidor, no directamente aquí

/**
 * Extrae el nombre del restaurante de una URL de búsqueda de Google
 */
export function extractRestaurantNameFromGoogleUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const queryParam = urlObj.searchParams.get('q')
    if (queryParam) {
      // Decodificar el parámetro (puede estar URL encoded)
      return decodeURIComponent(queryParam)
    }
    return null
  } catch (error) {
    console.error('[Google Places] Error extracting name from URL:', error)
    return null
  }
}

/**
 * Busca un restaurante por nombre usando Google Places Text Search API
 * Usa API route de Next.js para evitar problemas de CORS
 */
export async function searchRestaurantByName(
  name: string
): Promise<PlaceSearchResult | null> {
  try {
    const encodedName = encodeURIComponent(name)
    const url = `/api/google-places/search?query=${encodedName}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: GooglePlacesTextSearchResponse = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('[Google Places] Error en búsqueda:', data.status, data.error_message)
      return null
    }

    if (data.results && data.results.length > 0) {
      return data.results[0] // Retornar el primer resultado
    }

    return null
  } catch (error) {
    console.error('[Google Places] Error searching restaurant:', error)
    return null
  }
}

/**
 * Obtiene los detalles completos de un lugar usando su Place ID
 * Usa API route de Next.js para evitar problemas de CORS
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  try {
    const url = `/api/google-places/details?place_id=${placeId}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: GooglePlacesDetailsResponse = await response.json()

    if (data.status !== 'OK') {
      console.error('[Google Places] Error obteniendo detalles:', data.status, data.error_message)
      return null
    }

    // Log para debugging: ver todos los campos disponibles
    if (data.result) {
      console.log('[Google Places] Campos disponibles en la respuesta:', Object.keys(data.result))
      console.log('[Google Places] price_level recibido:', data.result.price_level)
      console.log('[Google Places] Respuesta completa:', JSON.stringify(data.result, null, 2))
    }

    return data.result
  } catch (error) {
    console.error('[Google Places] Error getting place details:', error)
    return null
  }
}

/**
 * Genera la URL de una foto del lugar
 * Nota: Las fotos de Google Places requieren una API route para evitar CORS
 * Por ahora retornamos una URL que se servirá desde el servidor
 */
export function getPlacePhoto(photoReference: string, maxWidth: number = 400): string {
  // Usar API route para servir la foto (evita CORS)
  return `/api/google-places/photo?photo_reference=${photoReference}&maxwidth=${maxWidth}`
}

/**
 * Mapea los datos de Google Places al formato de Restaurant
 */
export function mapPlaceDetailsToRestaurant(
  placeDetails: PlaceDetails
): Partial<Restaurant> {
  // Mapear price_level (0-4) a price_range con rangos específicos de precios
  // Escala basada en price_level de Google Places:
  // 1 = Económico (€10-€20)
  // 2 = Moderado (€20-€40)
  // 3 = Caro (€40-€80)
  // 4 = Muy Caro (€80+)
  const priceLevelToRange = (level?: number): string => {
    if (level === undefined || level === null) return ''
    const ranges: Record<number, string> = {
      0: '',              // No definido
      1: '€10-€20',       // Económico
      2: '€20-€40',       // Moderado
      3: '€40-€80',       // Caro
      4: '€80+'           // Muy Caro
    }
    return ranges[level] || ''
  }

  // Generar badge basado en rating o tipos especiales
  const generateBadge = (rating?: number, types?: string[]): string | null => {
    if (rating && rating >= 4.5) {
      return 'Recomendado'
    }
    if (rating && rating >= 4.0) {
      return 'Muy bueno'
    }
    // Verificar si es un tipo especial de restaurante
    if (types) {
      if (types.includes('meal_takeaway')) {
        return 'Para llevar'
      }
      if (types.includes('meal_delivery')) {
        return 'Delivery'
      }
    }
    return null
  }

  // Extraer tipo de cocina de los types
  const extractCuisineType = (types?: string[]): string | null => {
    if (!types) return null
    // Filtrar tipos relevantes de restaurante
    const cuisineTypes = types.filter(
      (type) =>
        type.startsWith('restaurant') ||
        type.includes('food') ||
        type.includes('cuisine')
    )
    if (cuisineTypes.length > 0) {
      // Tomar el primer tipo relevante y formatearlo
      return cuisineTypes[0].replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    }
    return null
  }

  // Obtener URL de imagen si hay fotos
  const imageUrl =
    placeDetails.photos && placeDetails.photos.length > 0
      ? getPlacePhoto(placeDetails.photos[0].photo_reference, 680)
      : null

  // Obtener descripción (preferir editorial_summary)
  const description =
    placeDetails.editorial_summary?.overview || null

  // Obtener dirección formateada
  const address = placeDetails.formatted_address || null

  // Obtener URL (preferir website, sino usar url de Google Maps)
  const restaurantUrl = placeDetails.website || placeDetails.url || null

  return {
    name: placeDetails.name,
    description: description,
    address: address,
    cuisine_type: extractCuisineType(placeDetails.types),
    rating: placeDetails.rating || null,
    review_count: placeDetails.user_ratings_total || null,
    price_range: priceLevelToRange(placeDetails.price_level),
    image_url: imageUrl,
    badge: generateBadge(placeDetails.rating, placeDetails.types),
    url: restaurantUrl,
  }
}

/**
 * Función principal que obtiene información completa de un restaurante desde una URL de Google
 */
export async function getRestaurantFromGoogleUrl(
  url: string
): Promise<Partial<Restaurant> | null> {
  // 1. Extraer nombre de la URL
  const restaurantName = extractRestaurantNameFromGoogleUrl(url)
  if (!restaurantName) {
    console.error('[Google Places] No se pudo extraer el nombre de la URL')
    return null
  }

  // 2. Buscar el restaurante
  const searchResult = await searchRestaurantByName(restaurantName)
  if (!searchResult || !searchResult.place_id) {
    console.error('[Google Places] No se encontró el restaurante')
    return null
  }

  // 3. Obtener detalles completos
  const placeDetails = await getPlaceDetails(searchResult.place_id)
  if (!placeDetails) {
    console.error('[Google Places] No se pudieron obtener los detalles')
    return null
  }

  // 4. Mapear a formato Restaurant
  return mapPlaceDetailsToRestaurant(placeDetails)
}

