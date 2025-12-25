import { NextResponse } from 'next/server'

const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place'
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_WEATHER_API_KEY

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const placeId = searchParams.get('place_id')

    if (!placeId) {
      return NextResponse.json(
        { error: 'place_id parameter is required' },
        { status: 400 }
      )
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      )
    }

    const fields = [
      'name',
      'formatted_address',
      'rating',
      'user_ratings_total',
      'price_level',
      'photos',
      'editorial_summary',
      'types',
      'formatted_phone_number',
      'website',
      'url', // URL de Google Maps
    ].join(',')

    const url = `${GOOGLE_PLACES_BASE_URL}/details/json?place_id=${placeId}&fields=${fields}&language=es&key=${API_KEY}`

    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Log completo de la respuesta para debugging
    console.log('[API Google Places Details] Respuesta completa:', JSON.stringify(data, null, 2))
    
    // Verificar si hay campos adicionales relacionados con precios
    if (data.result) {
      console.log('[API Google Places Details] Campos disponibles:', Object.keys(data.result))
      console.log('[API Google Places Details] price_level:', data.result.price_level)
      console.log('[API Google Places Details] Todos los campos numéricos:', 
        Object.entries(data.result).filter(([_, v]) => typeof v === 'number').map(([k, v]) => `${k}: ${v}`)
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[API Google Places Details] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error getting place details' },
      { status: 500 }
    )
  }
}

