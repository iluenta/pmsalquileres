import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const type = searchParams.get('type') || 'current' // 'current' or 'forecast'
    const units = searchParams.get('units') || 'metric'
    const lang = searchParams.get('lang') || 'es'

    if (!lat || !lon) {
        return NextResponse.json({ error: 'Faltan coordenadas' }, { status: 400 })
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_WEATHER_API_KEY
    if (!apiKey) {
        return NextResponse.json({ error: 'Google Weather API key not configured' }, { status: 500 })
    }

    try {
        // Determinamos el endpoint correcto según el tipo
        const endpoint = type === 'forecast' ? 'forecast/days:lookup' : 'currentConditions:lookup'
        const googleWeatherUrl = `https://weather.googleapis.com/v1/${endpoint}?location.latitude=${lat}&location.longitude=${lon}&key=${apiKey}`

        const response = await fetch(googleWeatherUrl)
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error(`[Google Weather API Error] ${response.status}:`, errorData)
            return NextResponse.json(
                { error: 'Error from Google Weather API', details: errorData },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('[Weather Proxy] Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
