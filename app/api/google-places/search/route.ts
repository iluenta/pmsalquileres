import { NextResponse } from 'next/server'

const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place'
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_WEATHER_API_KEY

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      )
    }

    const encodedQuery = encodeURIComponent(query)
    const url = `${GOOGLE_PLACES_BASE_URL}/textsearch/json?query=${encodedQuery}&type=restaurant&language=es&key=${API_KEY}`

    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[API Google Places Search] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error searching restaurant' },
      { status: 500 }
    )
  }
}

