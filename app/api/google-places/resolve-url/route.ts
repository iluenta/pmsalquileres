import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const shortUrl = searchParams.get('url')

        if (!shortUrl) {
            return NextResponse.json(
                { error: 'URL parameter is required' },
                { status: 400 }
            )
        }

        // Solo permitir URLs de Google Maps
        if (!shortUrl.includes('maps.app.goo.gl') && !shortUrl.includes('goo.gl/maps')) {
            return NextResponse.json({ url: shortUrl })
        }

        const response = await fetch(shortUrl, {
            method: 'HEAD',
            redirect: 'follow',
        })

        return NextResponse.json({ url: response.url })
    } catch (error: any) {
        console.error('[API Google Places Resolve URL] Error:', error)
        return NextResponse.json(
            { error: error.message || 'Error resolving URL' },
            { status: 500 }
        )
    }
}
