import { NextResponse } from 'next/server'

const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place'
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_WEATHER_API_KEY

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const photoReference = searchParams.get('photo_reference')
    const maxWidth = searchParams.get('maxwidth') || '400'

    if (!photoReference) {
      return NextResponse.json(
        { error: 'photo_reference parameter is required' },
        { status: 400 }
      )
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      )
    }

    // Redirigir a la URL de la foto de Google
    const photoUrl = `${GOOGLE_PLACES_BASE_URL}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${API_KEY}`
    
    // Hacer fetch de la imagen y retornarla
    const response = await fetch(photoUrl)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error: any) {
    console.error('[API Google Places Photo] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error getting photo' },
      { status: 500 }
    )
  }
}

