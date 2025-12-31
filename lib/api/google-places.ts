import type {
  PlaceSearchResult,
  PlaceDetails,
  GooglePlacesTextSearchResponse,
  GooglePlacesDetailsResponse,
} from '@/types/google-places'
import type { Restaurant, Beach, Activity, Shopping } from '@/types/guides'

const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place'
// Nota: La API key se usa en las API routes del servidor, no directamente aquí

/**
 * Extrae el nombre del lugar de una URL de Google Maps
 * Soporta múltiples formatos:
 * 1. URL de búsqueda: https://www.google.com/maps/search/?q=Nombre+del+Lugar
 * 2. URL directa: https://www.google.com/maps/place/Nombre+del+Lugar/@lat,lng
 * 3. Maneja correctamente caracteres especiales y acentos (UTF-8)
 */
export function extractRestaurantNameFromGoogleUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)

    // Formato 1: URL de búsqueda con parámetro 'q'
    const queryParam = urlObj.searchParams.get('q')
    if (queryParam) {
      try {
        return decodeURIComponent(queryParam)
      } catch {
        // Si falla, intentar decodificar manualmente
        return queryParam.replace(/\+/g, ' ').replace(/%([0-9A-F]{2})/gi, (match, hex) => {
          return String.fromCharCode(parseInt(hex, 16))
        })
      }
    }

    // Formato 2: URL directa de Google Maps con /place/ en la ruta
    // Ejemplo: https://www.google.com/maps/place/Playa+de+M%C3%B3nsul/@36.7307815,-2.1558116
    // Ejemplo: https://www.google.com/maps/place/El+Playazo/@37.2148849,-1.8061523
    // Ejemplo: https://www.google.com/maps/place/Oasis+caf%C3%A9/@37.2204993,-1.812117
    // Nota: El pathname puede venir parcialmente decodificado por el navegador
    // Intentar primero con el pathname (puede estar decodificado)
    const pathname = urlObj.pathname
    const placeMatch = pathname.match(/\/place\/([^/@]+)/)

    if (placeMatch && placeMatch[1]) {
      let encodedName = placeMatch[1]

      // Reemplazar + por espacios
      encodedName = encodedName.replace(/\+/g, ' ')

      // Si el nombre contiene caracteres codificados (%XX), decodificarlo
      if (encodedName.includes('%')) {
        try {
          return decodeURIComponent(encodedName)
        } catch (decodeError: any) {
          // Decodificar manualmente solo los caracteres %XX bien formados
          return encodedName.replace(/%([0-9A-F]{2})/gi, (match, hex) => {
            return String.fromCharCode(parseInt(hex, 16))
          })
        }
      } else {
        // El nombre ya está decodificado, solo devolverlo
        return encodedName
      }
    }

    // Fallback: Intentar extraer directamente de la URL string original
    // Esto es útil si el navegador ha decodificado el pathname completamente
    const urlString = url.toString()
    const directMatch = urlString.match(/\/place\/([^/@]+)/)
    if (directMatch && directMatch[1]) {
      let directName = directMatch[1]
      directName = directName.replace(/\+/g, ' ')

      if (directName.includes('%')) {
        try {
          return decodeURIComponent(directName)
        } catch {
          return directName.replace(/%([0-9A-F]{2})/gi, (match, hex) => {
            return String.fromCharCode(parseInt(hex, 16))
          })
        }
      }
      return directName
    }

    return null
  } catch (error) {
    console.error('[Google Places] Error extracting name from URL:', error)
    return null
  }
}

/**
 * Resuelve una URL corta de Google Maps (maps.app.goo.gl) a la URL completa
 */
export async function resolveGoogleShortUrl(url: string): Promise<string> {
  if (!url.includes('maps.app.goo.gl') && !url.includes('goo.gl/maps')) {
    return url
  }

  try {
    const response = await fetch(`/api/google-places/resolve-url?url=${encodeURIComponent(url)}`)
    if (!response.ok) return url
    const data = await response.json()
    return data.url || url
  } catch (error) {
    console.error('[Google Places] Error resolving short URL:', error)
    return url
  }
}


/**
 * Extrae las coordenadas de una URL de Google Maps si están disponibles
 */
function extractCoordinatesFromGoogleUrl(url: string): { lat: number; lng: number } | null {
  try {
    const urlObj = new URL(url)

    // Buscar coordenadas en formato @lat,lng en el pathname
    const pathname = urlObj.pathname
    const coordMatch = pathname.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (coordMatch && coordMatch[1] && coordMatch[2]) {
      const lat = parseFloat(coordMatch[1])
      const lng = parseFloat(coordMatch[2])
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng }
      }
    }

    // También buscar coordenadas en formato !8m2!3dlat!4dlng
    // Ejemplo: !8m2!3d37.2137302!4d-1.8313155
    const coordMatch2 = pathname.match(/[!]8m2[!]3d(-?\d+\.?\d*)[!]4d(-?\d+\.?\d*)/)
    if (coordMatch2 && coordMatch2[1] && coordMatch2[2]) {
      const lat = parseFloat(coordMatch2[1])
      const lng = parseFloat(coordMatch2[2])
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng }
      }
    }

    return null
  } catch (error) {
    console.error('[Google Places] Error extracting coordinates from URL:', error)
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
    const isCid = /^\d+$/.test(placeId)
    const identifierParam = isCid ? `cid=${placeId}` : `place_id=${placeId}`
    const url = `/api/google-places/details?${identifierParam}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: GooglePlacesDetailsResponse = await response.json()

    if (data.status !== 'OK') {
      console.error('[Google Places] Error obteniendo detalles:', data.status, data.error_message)
      return null
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
 * Calcula la distancia desde la propiedad hasta un lugar usando Distance Matrix API
 * Retorna tiempos en minutos para caminar y en coche
 */
async function calculateDistanceFromProperty(
  propertyLat: number,
  propertyLng: number,
  placeLat: number,
  placeLng: number
): Promise<{ walking_time: number | null; driving_time: number | null }> {
  try {
    const origin = `${propertyLat},${propertyLng}`
    const destination = `${placeLat},${placeLng}`

    const response = await fetch(
      `/api/google-places/distance?origin=${origin}&destination=${destination}`
    )

    if (!response.ok) {
      console.error('[calculateDistanceFromProperty] Error HTTP calculando distancia:', response.status)
      return { walking_time: null, driving_time: null }
    }

    const data = await response.json()

    // Verificar si hay un error en la respuesta
    if (data.error) {
      console.error('[calculateDistanceFromProperty] Error en respuesta de API:', data.error)
      return { walking_time: null, driving_time: null }
    }

    const walking_time = data.walking?.value ?? null
    const driving_time = data.driving?.value ?? null

    return { walking_time, driving_time }
  } catch (error) {
    console.error('[Google Places] Error calculating distance from property:', error)
    return { walking_time: null, driving_time: null }
  }
}

/**
 * Mapea los datos de Google Places al formato de Restaurant
 */
export async function mapPlaceDetailsToRestaurant(
  placeDetails: PlaceDetails,
  propertyLat?: number,
  propertyLng?: number
): Promise<Partial<Restaurant>> {
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

  // Calcular distancias si hay coordenadas de propiedad y del lugar
  let walking_time: number | null = null
  let driving_time: number | null = null

  if (propertyLat && propertyLng && placeDetails.geometry?.location) {
    const placeLat = placeDetails.geometry.location.lat
    const placeLng = placeDetails.geometry.location.lng

    const distances = await calculateDistanceFromProperty(
      propertyLat,
      propertyLng,
      placeLat,
      placeLng
    )

    walking_time = distances.walking_time
    driving_time = distances.driving_time
  }

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
    phone: placeDetails.formatted_phone_number || null,
    website: placeDetails.website || null,
    opening_hours: placeDetails.opening_hours || null,
    walking_time,
    driving_time,
  }
}

/**
 * Función unificada que obtiene información completa de un lugar desde una URL de Google
 * Soporta restaurantes, playas y actividades
 */
async function getPlaceFromGoogleUrl<T>(
  url: string,
  placeType: 'restaurant' | 'beach' | 'activity' | 'shopping',
  searchTypes: string[],
  mapper: (placeDetails: PlaceDetails, propertyLat?: number, propertyLng?: number) => Promise<Partial<T>>,
  propertyLat?: number,
  propertyLng?: number
): Promise<Partial<T> | null> {
  // Validar que la URL sea válida
  try {
    new URL(url)
  } catch (error) {
    console.error(`[Google Places] URL inválida:`, error)
    throw new Error(`La URL proporcionada no es válida: ${url}`)
  }

  // Resolver URL corta si es necesario
  const resolvedUrl = await resolveGoogleShortUrl(url)
  const workingUrl = resolvedUrl || url

  // Estrategia 0: Intentar extraer Place ID o CID directamente de la URL (más preciso)
  const placeId = extractPlaceIdFromGoogleUrl(workingUrl)
  const cid = extractCidFromGoogleUrl(workingUrl)

  const identifier = placeId || cid

  if (identifier) {
    try {
      const placeDetails = await getPlaceDetails(identifier)
      if (placeDetails) {
        return mapper(placeDetails, propertyLat, propertyLng)
      }
    } catch (error: any) {
      // Continuar con otras estrategias
    }
  }

  // Extraer coordenadas y nombre de la URL
  const coordinates = extractCoordinatesFromGoogleUrl(workingUrl)
  const placeName = extractRestaurantNameFromGoogleUrl(workingUrl)

  // Si no hay nombre, no podemos continuar
  if (!placeName || placeName.trim() === '') {
    console.error(`[Google Places] No se pudo extraer el nombre de la URL para ${placeType}`)
    throw new Error(`No se pudo extraer el nombre del lugar de la URL proporcionada. Por favor, verifica que la URL sea una URL válida de Google Maps.`)
  }

  // Estrategia 1: Si tenemos coordenadas, intentar búsqueda por proximidad primero
  if (coordinates) {
    try {
      const searchResult = await searchPlaceByCoordinates(coordinates.lat, coordinates.lng, placeName)
      if (searchResult && searchResult.place_id) {
        const placeDetails = await getPlaceDetails(searchResult.place_id)
        if (placeDetails) {
          return await mapper(placeDetails, propertyLat, propertyLng)
        }
      }
    } catch (error: any) {
      // Continuar con búsqueda por nombre
    }
  }

  // Estrategia 2: Intentar múltiples estrategias de búsqueda por nombre
  let searchResult: PlaceSearchResult | null = null

  // 1. Búsqueda sin restricción de tipo (más amplia)
  searchResult = await searchPlaceByName(placeName)
  if (!searchResult || !searchResult.place_id) {
    // 2. Intentar con los tipos específicos proporcionados
    for (const type of searchTypes) {
      searchResult = await searchPlaceByName(placeName, type as any)
      if (searchResult && searchResult.place_id) {
        break
      }
    }
  }

  if (!searchResult || !searchResult.place_id) {
    console.error(`[Google Places] No se encontró el ${placeType} con nombre:`, placeName)
    throw new Error(`No se encontró información para "${placeName}" en Google Places. Por favor, verifica que el nombre del lugar sea correcto o intenta con una URL diferente.`)
  }

  // Obtener detalles completos
  const placeDetails = await getPlaceDetails(searchResult.place_id)
  if (!placeDetails) {
    console.error(`[Google Places] No se pudieron obtener los detalles del ${placeType}`)
    throw new Error(`No se pudieron obtener los detalles del lugar desde Google Places. Por favor, intenta de nuevo.`)
  }

  return await mapper(placeDetails, propertyLat, propertyLng)
}

/**
 * Función principal que obtiene información completa de un restaurante desde una URL de Google
 */
export async function getRestaurantFromGoogleUrl(
  url: string,
  propertyLat?: number,
  propertyLng?: number
): Promise<Partial<Restaurant> | null> {
  return getPlaceFromGoogleUrl<Restaurant>(
    url,
    'restaurant',
    ['restaurant', 'food', 'point_of_interest'],
    mapPlaceDetailsToRestaurant,
    propertyLat,
    propertyLng
  )
}

/**
 * Mapea los datos de Google Places al formato de Shopping
 */
export async function mapPlaceDetailsToShopping(
  placeDetails: PlaceDetails,
  propertyLat?: number,
  propertyLng?: number
): Promise<Partial<Shopping>> {
  // Mapear price_level (0-4) a price_range con rangos específicos de precios
  const priceLevelToRange = (level?: number): string => {
    if (level === undefined || level === null) return ''
    const ranges: Record<number, string> = {
      0: '',              // No definido
      1: '€',             // Económico
      2: '€€',            // Moderado
      3: '€€€',           // Caro
      4: '€€€€'           // Muy Caro
    }
    return ranges[level] || ''
  }

  // Generar badge basado en rating
  const generateBadge = (rating?: number): string | null => {
    if (rating && rating >= 4.5) {
      return 'Recomendado'
    }
    if (rating && rating >= 4.0) {
      return 'Muy bueno'
    }
    return null
  }

  // Extraer tipo de compras de los types
  const extractShoppingType = (types?: string[]): string | null => {
    if (!types) return null

    // Mapear tipos de Google Places a tipos de compras
    const typeMapping: Record<string, string> = {
      'supermarket': 'supermercado',
      'shopping_mall': 'centro_comercial',
      'store': 'tienda',
      'pharmacy': 'farmacia',
      'market': 'mercado',
      'grocery_or_supermarket': 'supermercado',
      'department_store': 'tienda',
      'clothing_store': 'tienda',
      'convenience_store': 'tienda',
    }

    // Buscar el primer tipo que coincida
    for (const type of types) {
      const baseType = type.split('_')[0] // Tomar la primera parte del tipo
      if (typeMapping[type]) {
        return typeMapping[type]
      }
      if (typeMapping[baseType]) {
        return typeMapping[baseType]
      }
    }

    // Si no hay coincidencia exacta, intentar inferir del nombre
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
  const shoppingUrl = placeDetails.website || placeDetails.url || null

  // Calcular distancias si hay coordenadas de propiedad y del lugar
  let walking_time: number | null = null
  let driving_time: number | null = null

  if (propertyLat && propertyLng && placeDetails.geometry?.location) {
    const placeLat = placeDetails.geometry.location.lat
    const placeLng = placeDetails.geometry.location.lng

    const distances = await calculateDistanceFromProperty(
      propertyLat,
      propertyLng,
      placeLat,
      placeLng
    )

    walking_time = distances.walking_time
    driving_time = distances.driving_time
  }

  return {
    name: placeDetails.name,
    description: description,
    address: address,
    shopping_type: extractShoppingType(placeDetails.types),
    rating: placeDetails.rating || null,
    review_count: placeDetails.user_ratings_total || null,
    price_range: priceLevelToRange(placeDetails.price_level),
    image_url: imageUrl,
    badge: generateBadge(placeDetails.rating),
    url: shoppingUrl,
    phone: placeDetails.formatted_phone_number || null,
    website: placeDetails.website || null,
    opening_hours: placeDetails.opening_hours || null,
    walking_time,
    driving_time,
  }
}

/**
 * Función principal que obtiene información completa de un lugar de compras desde una URL de Google
 */
export async function getShoppingFromGoogleUrl(
  url: string,
  propertyLat?: number,
  propertyLng?: number
): Promise<Partial<Shopping> | null> {
  return getPlaceFromGoogleUrl<Shopping>(
    url,
    'shopping',
    ['supermarket', 'shopping_mall', 'store', 'pharmacy', 'market', 'grocery_or_supermarket', 'point_of_interest'],
    mapPlaceDetailsToShopping,
    propertyLat,
    propertyLng
  )
}

/**
 * Busca un lugar (playa, actividad, etc.) por nombre usando Google Places Text Search API
 */
export async function searchPlaceByName(
  name: string,
  type: 'beach' | 'tourist_attraction' | 'point_of_interest' = 'point_of_interest'
): Promise<PlaceSearchResult | null> {
  try {
    const encodedName = encodeURIComponent(name)
    const url = `/api/google-places/search?query=${encodedName}&type=${type}`

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
      return data.results[0]
    }

    return null
  } catch (error) {
    console.error('[Google Places] Error searching place:', error)
    return null
  }
}

/**
 * Mapea los datos de Google Places al formato de Beach
 */
export async function mapPlaceDetailsToBeach(
  placeDetails: PlaceDetails,
  propertyLat?: number,
  propertyLng?: number
): Promise<Partial<Beach>> {
  const priceLevelToRange = (level?: number): string => {
    if (level === undefined || level === null) return ''
    const ranges: Record<number, string> = {
      0: '',
      1: '€10-€20',
      2: '€20-€40',
      3: '€40-€80',
      4: '€80+'
    }
    return ranges[level] || ''
  }

  const generateBadge = (rating?: number): string | null => {
    if (rating && rating >= 4.5) {
      return 'Recomendado'
    }
    if (rating && rating >= 4.0) {
      return 'Muy bueno'
    }
    return null
  }

  const imageUrl =
    placeDetails.photos && placeDetails.photos.length > 0
      ? getPlacePhoto(placeDetails.photos[0].photo_reference, 680)
      : null

  const description = placeDetails.editorial_summary?.overview || null
  const address = placeDetails.formatted_address || null
  const placeUrl = placeDetails.website || placeDetails.url || null

  // Calcular distancias si hay coordenadas de propiedad y del lugar
  let walking_time: number | null = null
  let driving_time: number | null = null

  if (propertyLat && propertyLng && placeDetails.geometry?.location) {
    const placeLat = placeDetails.geometry.location.lat
    const placeLng = placeDetails.geometry.location.lng

    const distances = await calculateDistanceFromProperty(
      propertyLat,
      propertyLng,
      placeLat,
      placeLng
    )

    walking_time = distances.walking_time
    driving_time = distances.driving_time

    // Si walking_time > 15, asegurarse de calcular también driving_time
    if (walking_time && walking_time > 15 && !driving_time) {
      // Ya lo intentamos arriba, si no está disponible, dejamos null
    }
  }

  return {
    name: placeDetails.name,
    description: description,
    address: address,
    rating: placeDetails.rating || null,
    review_count: placeDetails.user_ratings_total || null,
    price_range: priceLevelToRange(placeDetails.price_level),
    image_url: imageUrl,
    badge: generateBadge(placeDetails.rating),
    url: placeUrl,
    walking_time,
    driving_time,
  }
}

/**
 * Mapea los datos de Google Places al formato de Activity
 */
export async function mapPlaceDetailsToActivity(
  placeDetails: PlaceDetails,
  propertyLat?: number,
  propertyLng?: number
): Promise<Partial<Activity>> {
  const priceLevelToRange = (level?: number): string => {
    if (level === undefined || level === null) return ''
    const ranges: Record<number, string> = {
      0: '',
      1: '€10-€20',
      2: '€20-€40',
      3: '€40-€80',
      4: '€80+'
    }
    return ranges[level] || ''
  }

  const generateBadge = (rating?: number): string | null => {
    if (rating && rating >= 4.5) {
      return 'Recomendado'
    }
    if (rating && rating >= 4.0) {
      return 'Muy bueno'
    }
    return null
  }

  // Extraer tipo de actividad de los types
  const extractActivityType = (types?: string[]): string | null => {
    if (!types) return null
    const activityTypes = types.filter(
      (type) =>
        type.includes('tourist') ||
        type.includes('attraction') ||
        type.includes('activity') ||
        type.includes('entertainment')
    )
    if (activityTypes.length > 0) {
      return activityTypes[0].replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    }
    return null
  }

  const imageUrl =
    placeDetails.photos && placeDetails.photos.length > 0
      ? getPlacePhoto(placeDetails.photos[0].photo_reference, 680)
      : null

  const description = placeDetails.editorial_summary?.overview || null
  const address = placeDetails.formatted_address || null
  const placeUrl = placeDetails.website || placeDetails.url || null

  // Calcular distancias si hay coordenadas de propiedad y del lugar
  let walking_time: number | null = null
  let driving_time: number | null = null

  if (propertyLat && propertyLng && placeDetails.geometry?.location) {
    const placeLat = placeDetails.geometry.location.lat
    const placeLng = placeDetails.geometry.location.lng

    const distances = await calculateDistanceFromProperty(
      propertyLat,
      propertyLng,
      placeLat,
      placeLng
    )

    walking_time = distances.walking_time
    driving_time = distances.driving_time

    // Si walking_time > 15, asegurarse de calcular también driving_time
    if (walking_time && walking_time > 15 && !driving_time) {
      // Ya lo intentamos arriba, si no está disponible, dejamos null
    }
  }

  return {
    name: placeDetails.name,
    description: description,
    address: address,
    activity_type: extractActivityType(placeDetails.types),
    rating: placeDetails.rating || null,
    review_count: placeDetails.user_ratings_total || null,
    price_range: priceLevelToRange(placeDetails.price_level),
    image_url: imageUrl,
    badge: generateBadge(placeDetails.rating),
    url: placeUrl,
    walking_time,
    driving_time,
  }
}

/**
 * Valida si un place_id tiene el formato correcto para Google Places API
 * Los place_ids válidos suelen empezar con letras o tener un formato específico
 */
/**
 * Extrae el place_id de una URL de Google Maps si está disponible
 * NOTA: Los place_ids en formato hexadecimal (0x...:0x...) que aparecen en las URLs
 * de Google Maps NO son compatibles con la Places API. Esta función intenta extraerlos
 * pero solo retorna place_ids válidos para la API (formato ChIJ...).
 */
function extractPlaceIdFromGoogleUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)

    // 1. Buscar en parámetro 'place_id' (si existe)
    const placeIdParam = urlObj.searchParams.get('place_id')
    if (placeIdParam && placeIdParam.startsWith('ChI')) return placeIdParam

    // 2. Buscar en el pathname formato /place/Nombre+del+Lugar/ChIJ...
    const pathname = urlObj.pathname
    const placeIdMatch = pathname.match(/ChIJ[a-zA-Z0-9_-]{23}/)
    if (placeIdMatch) return placeIdMatch[0]

    return null
  } catch {
    return null
  }
}

/**
 * Extrae el CID (Customer ID) de una URL de Google Maps si está disponible.
 * El CID es un identificador único que se puede usar con la Places API.
 */
export function extractCidFromGoogleUrl(url: string): string | null {
  try {
    // Buscar el patrón !1s0x...:0x[CID]
    const match = url.match(/!1s0x[0-9a-f]+:(0x[0-9a-f]+)/i)
    if (match && match[1]) {
      // El CID es el segundo valor hexadecimal. 
      // La Places API lo acepta como un string decimal.
      return BigInt(match[1]).toString()
    }

    // También buscar en el parámetro cid= si existe (en algunas URLs)
    const urlObj = new URL(url)
    const cidParam = urlObj.searchParams.get('cid')
    if (cidParam) return cidParam

    return null
  } catch {
    return null
  }
}

/**
 * Busca un lugar por coordenadas usando Google Places Nearby Search API
 */
async function searchPlaceByCoordinates(
  lat: number,
  lng: number,
  name?: string
): Promise<PlaceSearchResult | null> {
  try {
    if (!name) {
      return null
    }

    // Usar Text Search API con location bias en lugar de Nearby Search
    // Text Search con location bias es más efectivo cuando tenemos un nombre específico
    const location = `${lat},${lng}`
    const encodedName = encodeURIComponent(name)

    // Usar Text Search con locationbias (prioriza resultados cerca de las coordenadas)
    // Formato: locationbias=circle:radius@lat,lng
    let url = `/api/google-places/search?query=${encodedName}&location=${location}`

    const response = await fetch(url)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Google Places] Error response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: GooglePlacesTextSearchResponse = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('[Google Places] Error en búsqueda por coordenadas:', data.status, data.error_message)
      return null
    }

    if (data.results && data.results.length > 0) {
      // 1. Intentar encontrar una coincidencia exacta de nombre (ignorando mayúsculas/minúsculas)
      const exactMatch = data.results.find(
        r => r.name.toLowerCase() === name.toLowerCase()
      )
      if (exactMatch) return exactMatch

      // 2. Intentar coincidencia parcial (el nombre buscado está en el resultado o viceversa)
      const partialMatch = data.results.find(
        r => r.name.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(r.name.toLowerCase())
      )
      if (partialMatch) return partialMatch

      // 3. Si no hay coincidencia clara de nombre, elegir el más cercano geográficamente
      if (data.results.length > 1) {
        let closestResult = data.results[0]
        let closestDistance = Infinity

        for (const result of data.results) {
          if (result.geometry?.location) {
            const resultLat = result.geometry.location.lat
            const resultLng = result.geometry.location.lng
            const distance = Math.abs(resultLat - lat) + Math.abs(resultLng - lng)
            if (distance < closestDistance) {
              closestDistance = distance
              closestResult = result
            }
          }
        }
        return closestResult
      }

      return data.results[0]
    }

    return null
  } catch (error) {
    console.error('[Google Places] Error searching place by coordinates:', error)
    return null
  }
}

/**
 * Función principal que obtiene información completa de una playa desde una URL de Google
 */
export async function getBeachFromGoogleUrl(
  url: string,
  propertyLat?: number,
  propertyLng?: number
): Promise<Partial<Beach> | null> {
  return getPlaceFromGoogleUrl<Beach>(
    url,
    'beach',
    ['natural_feature', 'tourist_attraction', 'point_of_interest'],
    mapPlaceDetailsToBeach,
    propertyLat,
    propertyLng
  )
}

/**
 * Función principal que obtiene información completa de una actividad desde una URL de Google
 */
/**
 * Función principal que obtiene información completa de una actividad desde una URL de Google
 */
export async function getActivityFromGoogleUrl(
  url: string,
  propertyLat?: number,
  propertyLng?: number
): Promise<Partial<Activity> | null> {
  return getPlaceFromGoogleUrl<Activity>(
    url,
    'activity',
    ['tourist_attraction', 'amusement_park', 'museum', 'art_gallery', 'park', 'point_of_interest'],
    mapPlaceDetailsToActivity,
    propertyLat,
    propertyLng
  )
}

