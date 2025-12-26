import { NextResponse } from 'next/server'

const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place'
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_WEATHER_API_KEY

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location') // formato: "lat,lng"
    const radius = searchParams.get('radius') || '1000' // radio en metros
    const keyword = searchParams.get('keyword') // palabra clave opcional

    if (!location) {
      return NextResponse.json(
        { error: 'Location parameter is required (format: "lat,lng")' },
        { status: 400 }
      )
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      )
    }

    // Construir URL para Nearby Search API
    let url = `${GOOGLE_PLACES_BASE_URL}/nearbysearch/json?location=${location}&radius=${radius}&language=es&key=${API_KEY}`
    
    // Agregar keyword si está disponible
    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`
    }

    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Log para debugging
    console.log('[API Google Places Nearby] Status:', data.status)
    if (data.results) {
      console.log('[API Google Places Nearby] Resultados encontrados:', data.results.length)
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[API Google Places Nearby] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error searching nearby places' },
      { status: 500 }
    )
  }
}

