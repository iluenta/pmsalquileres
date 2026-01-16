import { NextResponse } from 'next/server'
import { getCompleteGuideDataPublic } from '@/lib/api/guides-public'
import { verifyGuideToken } from '@/lib/api/guide-auth'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const propertyId = searchParams.get('propertyId')
        const sessionToken = searchParams.get('session')

        if (!propertyId) {
            return NextResponse.json({ error: 'Falta propertyId' }, { status: 400 })
        }

        // Obtener los datos base (públicos por RLS endurecido)
        const data = await getCompleteGuideDataPublic(propertyId)

        if (!data) {
            return NextResponse.json({ error: 'Guía no encontrada' }, { status: 404 })
        }

        // Verificar si el usuario tiene una sesión válida para ESTA propiedad
        let isAuthorized = false
        if (sessionToken) {
            const session = verifyGuideToken(sessionToken)
            if (session && session.propertyId === data.property.id) {
                isAuthorized = true
            }
        }

        // Si NO está autorizado, filtrar datos sensibles
        if (!isAuthorized) {
            console.log(`[API/Guides] Acceso no autorizado para ${propertyId}. Filtrando datos sensibles.`)
            return NextResponse.json({
                ...data,
                contact_info: null,
                house_rules: [],
                house_guide_items: [],
                practical_info: [],
                property: {
                    ...data.property,
                    check_in_instructions: null // Ocultar instrucciones de llegada
                },
                _is_restricted: true
            })
        }

        // Si está autorizado, devolver todo
        return NextResponse.json({
            ...data,
            _is_restricted: false
        })

    } catch (error: any) {
        console.error('[API/Guides] Error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
