import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_WEATHER_API_KEY // Reutilizando la misma key de Google Cloud

export async function POST(req: NextRequest) {
    try {
        const { data, targetLanguage } = await req.json()

        if (!data || !targetLanguage) {
            return NextResponse.json({ error: 'Faltan datos o idioma de destino' }, { status: 400 })
        }

        if (targetLanguage === 'es') {
            return NextResponse.json({ data })
        }

        // Campos que NO queremos traducir (IDs, fechas, URLs, configuraciones técnicas)
        const skipFields = [
            'id', 'guide_id', 'tenant_id', 'order_index', 'created_at', 'updated_at', 'image_url', 'url', 'icon',
            'price', 'latitude', 'longitude', 'is_active', 'theme',
            'section_type', 'place_type', 'shopping_type', 'activity_type', 'cuisine_type', 'contact_type', 'category'
        ]

        // Función recursiva para extraer textos a traducir
        const textToTranslate: string[] = []
        const paths: any[] = []

        function extractTexts(obj: any, path = '') {
            if (!obj || typeof obj !== 'object') return

            for (const [key, value] of Object.entries(obj)) {
                if (skipFields.includes(key)) continue

                if (typeof value === 'string' && value.trim().length > 0 && !value.includes('http')) {
                    textToTranslate.push(value)
                    paths.push({ obj, key })
                } else if (typeof value === 'object' && value !== null) {
                    extractTexts(value, `${path}.${key}`)
                }
            }
        }

        extractTexts(data)

        if (textToTranslate.length === 0) {
            return NextResponse.json({ data })
        }

        // Google Cloud Translation v2 tiene un límite de segmentos por petición (aprox 128)
        // Vamos a procesar en lotes de 100 para estar seguros
        const BATCH_SIZE = 100
        const allTranslations: any[] = []

        for (let i = 0; i < textToTranslate.length; i += BATCH_SIZE) {
            const batch = textToTranslate.slice(i, i + BATCH_SIZE)

            const response = await fetch(
                `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        q: batch,
                        target: targetLanguage,
                        format: 'text'
                    })
                }
            )

            const result = await response.json()

            if (result.error) {
                console.error('[Translation API] Error de Google en lote:', result.error)
                throw new Error(result.error.message)
            }

            allTranslations.push(...result.data.translations)
        }

        // Reasignar textos traducidos
        paths.forEach((item, index) => {
            item.obj[item.key] = allTranslations[index].translatedText
        })

        return NextResponse.json({ data })

    } catch (error: any) {
        console.error('[Translation API] Error:', error)
        return NextResponse.json({ error: error.message || 'Error interno en la traducción' }, { status: 500 })
    }
}
