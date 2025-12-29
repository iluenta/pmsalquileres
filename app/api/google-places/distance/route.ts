import { NextResponse } from 'next/server'

// Intentar usar Distance Matrix API (legacy) primero, si falla retornar null
const DISTANCE_MATRIX_BASE_URL = 'https://maps.googleapis.com/maps/api/distancematrix'
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_WEATHER_API_KEY

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const origin = searchParams.get('origin') // formato: "lat,lng"
    const destination = searchParams.get('destination') // formato: "lat,lng"

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination parameters are required (format: "lat,lng")' },
        { status: 400 }
      )
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      )
    }

    // Construir URL para Distance Matrix API con ambos modos (walking y driving)
    const modes = ['walking', 'driving']
    const results: { walking?: { text: string; value: number } | null; driving?: { text: string; value: number } | null } = {
      walking: null,
      driving: null
    }

    // Calcular distancia para cada modo
    for (const mode of modes) {
      try {
        const url = `${DISTANCE_MATRIX_BASE_URL}/json?origins=${origin}&destinations=${destination}&mode=${mode}&language=es&key=${API_KEY}`
        
        const response = await fetch(url)
        const responseText = await response.text()
        
        if (!response.ok) {
          console.error(`[API Google Distance Matrix] Error HTTP para ${mode}:`, response.status, responseText)
          continue
        }

        let data
        try {
          data = JSON.parse(responseText)
        } catch (parseError) {
          console.error(`[API Distance Matrix] Error parseando JSON para ${mode}:`, parseError, responseText)
          continue
        }


        if (data.status === 'OK' && data.rows && data.rows.length > 0) {
          const element = data.rows[0].elements?.[0]
          if (element && element.status === 'OK') {
            // Convertir duración de segundos a minutos
            const durationInMinutes = Math.round(element.duration.value / 60)
            
            
            results[mode as 'walking' | 'driving'] = {
              text: `${durationInMinutes} min`,
              value: durationInMinutes
            }
          } else {
            console.error(`[API Distance Matrix] Element status no OK para ${mode}:`, {
              elementStatus: element?.status,
              element: JSON.stringify(element, null, 2),
              rows: data.rows
            })
          }
        } else if (data.status === 'REQUEST_DENIED') {
          // API no habilitada - mostrar mensaje claro
          console.error(`[API Distance Matrix] API no habilitada para ${mode}:`, data.error_message)
          // Continuar al siguiente modo sin fallar completamente
        } else {
          console.error(`[API Distance Matrix] Status no OK o sin rows para ${mode}:`, {
            status: data.status,
            error_message: data.error_message,
            rows: data.rows?.length || 0,
            fullResponse: JSON.stringify(data, null, 2)
          })
        }
      } catch (error) {
        console.error(`[API Google Distance Matrix] Error calculando ${mode}:`, error)
        if (error instanceof Error) {
          console.error(`[API Google Distance Matrix] Error message:`, error.message)
          console.error(`[API Google Distance Matrix] Error stack:`, error.stack)
        }
      }
    }

    // Si ambos son null, retornar error informativo
    if (results.walking === null && results.driving === null) {
      return NextResponse.json(
        { 
          error: 'Distance Matrix API no está habilitada. Por favor, habilítala en Google Cloud Console: https://console.cloud.google.com/apis/library/distancematrix-backend.googleapis.com',
          walking: null,
          driving: null
        },
        { status: 503 } // Service Unavailable
      )
    }
    
    return NextResponse.json(results)
  } catch (error: any) {
    console.error('[API Google Distance Matrix] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error calculating distance' },
      { status: 500 }
    )
  }
}

