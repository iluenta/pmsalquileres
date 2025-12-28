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
          const decoded = decodeURIComponent(encodedName)
          console.log('[Google Places] Nombre decodificado con decodeURIComponent:', decoded)
          return decoded
        } catch (decodeError: any) {
          console.log('[Google Places] Error en decodeURIComponent:', decodeError.message)
          // Decodificar manualmente solo los caracteres %XX bien formados
          const manuallyDecoded = encodedName.replace(/%([0-9A-F]{2})/gi, (match, hex) => {
            return String.fromCharCode(parseInt(hex, 16))
          })
          console.log('[Google Places] Nombre decodificado manualmente:', manuallyDecoded)
          return manuallyDecoded
        }
      } else {
        // El nombre ya está decodificado, solo devolverlo
        console.log('[Google Places] Nombre ya decodificado:', encodedName)
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
          const decoded = decodeURIComponent(directName)
          console.log('[Google Places] Nombre decodificado de URL directa:', decoded)
          return decoded
        } catch {
          const manuallyDecoded = directName.replace(/%([0-9A-F]{2})/gi, (match, hex) => {
            return String.fromCharCode(parseInt(hex, 16))
          })
          console.log('[Google Places] Nombre decodificado manualmente de URL directa:', manuallyDecoded)
          return manuallyDecoded
        }
      }
      console.log('[Google Places] Nombre de URL directa (sin codificar):', directName)
      return directName
    }
    
    return null
  } catch (error) {
    console.error('[Google Places] Error extracting name from URL:', error)
    return null
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
 * Función unificada que obtiene información completa de un lugar desde una URL de Google
 * Soporta restaurantes, playas y actividades
 */
async function getPlaceFromGoogleUrl<T>(
  url: string,
  placeType: 'restaurant' | 'beach' | 'activity' | 'shopping',
  searchTypes: string[],
  mapper: (placeDetails: PlaceDetails) => Partial<T>
): Promise<Partial<T> | null> {
  console.log(`[Google Places] ========== INICIO búsqueda ${placeType} ==========`)
  console.log(`[Google Places] URL recibida:`, url)

  // Validar que la URL sea válida
  try {
    new URL(url)
  } catch (error) {
    console.error(`[Google Places] URL inválida:`, error)
    throw new Error(`La URL proporcionada no es válida: ${url}`)
  }

  // Extraer coordenadas y nombre de la URL
  const coordinates = extractCoordinatesFromGoogleUrl(url)
  const placeName = extractRestaurantNameFromGoogleUrl(url)
  
  console.log(`[Google Places] Nombre extraído (${placeType}):`, placeName)
  console.log(`[Google Places] Coordenadas extraídas (${placeType}):`, coordinates)

  // Si no hay nombre, no podemos continuar
  if (!placeName || placeName.trim() === '') {
    console.error(`[Google Places] No se pudo extraer el nombre de la URL para ${placeType}`)
    throw new Error(`No se pudo extraer el nombre del lugar de la URL proporcionada. Por favor, verifica que la URL sea una URL válida de Google Maps.`)
  }

  // Estrategia 1: Si tenemos coordenadas, intentar búsqueda por proximidad primero
  if (coordinates) {
    console.log(`[Google Places] Intentando búsqueda por coordenadas y nombre para ${placeType}`)
    try {
      const searchResult = await searchPlaceByCoordinates(coordinates.lat, coordinates.lng, placeName)
      if (searchResult && searchResult.place_id) {
        console.log(`[Google Places] ${placeType} encontrado por coordenadas`)
        const placeDetails = await getPlaceDetails(searchResult.place_id)
        if (placeDetails) {
          return mapper(placeDetails)
        }
      }
    } catch (error: any) {
      console.log(`[Google Places] Error en búsqueda por coordenadas para ${placeType}:`, error.message)
      console.log(`[Google Places] Continuando con búsqueda por nombre para ${placeType}`)
    }
  }

  // Estrategia 2: Intentar múltiples estrategias de búsqueda por nombre
  console.log(`[Google Places] Buscando ${placeType} por nombre:`, placeName)

  let searchResult: PlaceSearchResult | null = null

  // 1. Búsqueda sin restricción de tipo (más amplia)
  searchResult = await searchPlaceByName(placeName)
  if (searchResult && searchResult.place_id) {
    console.log(`[Google Places] ${placeType} encontrado con búsqueda general`)
  } else {
    // 2. Intentar con los tipos específicos proporcionados
    for (const type of searchTypes) {
      console.log(`[Google Places] Intentando búsqueda de ${placeType} por nombre "${placeName}" con tipo "${type}"`)
      searchResult = await searchPlaceByName(placeName, type as any)
      if (searchResult && searchResult.place_id) {
        console.log(`[Google Places] ${placeType} encontrado con tipo "${type}"`)
        break
      }
    }
  }

  if (!searchResult || !searchResult.place_id) {
    console.error(`[Google Places] No se encontró el ${placeType} con nombre:`, placeName)
    console.error(`[Google Places] Tipos de búsqueda intentados:`, searchTypes)
    console.error(`[Google Places] ========== FIN búsqueda ${placeType} (NO ENCONTRADO) ==========`)
    throw new Error(`No se encontró información para "${placeName}" en Google Places. Por favor, verifica que el nombre del lugar sea correcto o intenta con una URL diferente.`)
  }

  console.log(`[Google Places] Lugar encontrado, obteniendo detalles...`)
  console.log(`[Google Places] Place ID:`, searchResult.place_id)

  // Obtener detalles completos
  const placeDetails = await getPlaceDetails(searchResult.place_id)
  if (!placeDetails) {
    console.error(`[Google Places] No se pudieron obtener los detalles del ${placeType}`)
    console.error(`[Google Places] ========== FIN búsqueda ${placeType} (ERROR EN DETALLES) ==========`)
    throw new Error(`No se pudieron obtener los detalles del lugar desde Google Places. Por favor, intenta de nuevo.`)
  }

  console.log(`[Google Places] Detalles obtenidos correctamente`)
  console.log(`[Google Places] Nombre del lugar:`, placeDetails.name)
  console.log(`[Google Places] ========== FIN búsqueda ${placeType} (ÉXITO) ==========`)

  // Mapear según el tipo
  return mapper(placeDetails)
}

/**
 * Función principal que obtiene información completa de un restaurante desde una URL de Google
 */
export async function getRestaurantFromGoogleUrl(
  url: string
): Promise<Partial<Restaurant> | null> {
  return getPlaceFromGoogleUrl<Restaurant>(
    url,
    'restaurant',
    ['restaurant', 'food', 'point_of_interest'],
    mapPlaceDetailsToRestaurant
  )
}

/**
 * Mapea los datos de Google Places al formato de Shopping
 */
export function mapPlaceDetailsToShopping(
  placeDetails: PlaceDetails
): Partial<Shopping> {
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
  }
}

/**
 * Función principal que obtiene información completa de un lugar de compras desde una URL de Google
 */
export async function getShoppingFromGoogleUrl(
  url: string
): Promise<Partial<Shopping> | null> {
  return getPlaceFromGoogleUrl<Shopping>(
    url,
    'shopping',
    ['supermarket', 'shopping_mall', 'store', 'pharmacy', 'market', 'grocery_or_supermarket', 'point_of_interest'],
    mapPlaceDetailsToShopping
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
export function mapPlaceDetailsToBeach(
  placeDetails: PlaceDetails
): Partial<Beach> {
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
  }
}

/**
 * Mapea los datos de Google Places al formato de Activity
 */
export function mapPlaceDetailsToActivity(
  placeDetails: PlaceDetails
): Partial<Activity> {
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
  }
}

/**
 * Valida si un place_id tiene el formato correcto para Google Places API
 * Los place_ids válidos suelen empezar con letras o tener un formato específico
 */
function isValidPlaceId(placeId: string): boolean {
  // Los place_ids de Google Places API suelen tener formatos como:
  // - ChIJ... (formato común)
  // - No deben contener solo números hexadecimales separados por :
  // - Deben tener al menos algunos caracteres alfanuméricos
  
  // Si contiene : y solo números hexadecimales, probablemente no es un place_id válido
  if (placeId.includes(':') && /^0x[0-9a-f]+:0x[0-9a-f]+$/i.test(placeId)) {
    return false
  }
  
  // Si es muy corto o solo números, probablemente no es válido
  if (placeId.length < 10) {
    return false
  }
  
  return true
}

/**
 * Extrae el place_id de una URL de Google Maps si está disponible
 * NOTA: Las URLs de Google Maps pueden contener place_ids en formato hexadecimal
 * que NO son compatibles con la API de Places. Esta función intenta extraerlos
 * pero se validan antes de usar.
 */
function extractPlaceIdFromGoogleUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    
    // Formato 1: Buscar place_id en el pathname (formato !1s0x... o !3m5!1s0x...)
    const pathname = urlObj.pathname
    // Buscar patrones como !1s0x... o !3m5!1s0x...:0x...
    const placeIdMatch = pathname.match(/![\d]+m[\d]+!1s([^!]+)/) || pathname.match(/!1s([^!]+)/)
    if (placeIdMatch && placeIdMatch[1]) {
      const extractedId = placeIdMatch[1]
      // Validar antes de retornar
      if (isValidPlaceId(extractedId)) {
        return extractedId
      } else {
        console.log('[Google Places] Place ID extraído no es válido para Places API:', extractedId)
      }
    }
    
    // Formato 2: Buscar en el parámetro 'data' de la URL
    const dataParam = urlObj.searchParams.get('data')
    if (dataParam) {
      // Buscar !1s0x... o !3m5!1s0x... en el parámetro data
      const dataMatch = dataParam.match(/![\d]+m[\d]+!1s([^!]+)/) || dataParam.match(/!1s([^!]+)/)
      if (dataMatch && dataMatch[1]) {
        const extractedId = dataMatch[1]
        if (isValidPlaceId(extractedId)) {
          return extractedId
        } else {
          console.log('[Google Places] Place ID extraído del parámetro data no es válido:', extractedId)
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('[Google Places] Error extracting place_id from URL:', error)
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
    // Usar Nearby Search API con las coordenadas
    const location = `${lat},${lng}`
    let url = `/api/google-places/nearby?location=${location}&radius=100`
    if (name) {
      url += `&keyword=${encodeURIComponent(name)}`
    }
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: GooglePlacesTextSearchResponse = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('[Google Places] Error en búsqueda por coordenadas:', data.status, data.error_message)
      return null
    }

    if (data.results && data.results.length > 0) {
      console.log('[Google Places] Resultados encontrados por coordenadas:', data.results.length)
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
  url: string
): Promise<Partial<Beach> | null> {
  return getPlaceFromGoogleUrl<Beach>(
    url,
    'beach',
    ['natural_feature', 'tourist_attraction', 'point_of_interest'],
    mapPlaceDetailsToBeach
  )
}

/**
 * Función principal que obtiene información completa de una actividad desde una URL de Google
 */
/**
 * Función principal que obtiene información completa de una actividad desde una URL de Google
 */
export async function getActivityFromGoogleUrl(
  url: string
): Promise<Partial<Activity> | null> {
  return getPlaceFromGoogleUrl<Activity>(
    url,
    'activity',
    ['tourist_attraction', 'amusement_park', 'museum', 'art_gallery', 'park', 'point_of_interest'],
    mapPlaceDetailsToActivity
  )
}

